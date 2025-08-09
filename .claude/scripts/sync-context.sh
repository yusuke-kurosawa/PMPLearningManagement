#!/bin/bash

# Claudeコンテキスト同期スクリプト
# このスクリプトは、プロジェクトの最新状態を.claudeディレクトリに反映します

set -e

echo "🔄 Claudeコンテキストを同期中..."

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトルートに移動
cd "$(dirname "$0")/../.."

# 現在の日付を取得
TODAY=$(date +%Y-%m-%d)

echo -e "${BLUE}📅 更新日: $TODAY${NC}"

# 1. 現在のステータスを更新
echo -e "${YELLOW}📊 ステータス情報を更新中...${NC}"

# Git情報を取得
CURRENT_BRANCH=$(git branch --show-current)
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)")
UNCOMMITTED=$(git status --porcelain | wc -l)

# package.jsonから情報を取得
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "未定義")

# ステータスファイルの最終更新日を更新
sed -i "s/最終更新: .*/最終更新: $TODAY/" .claude/context/current-status.md

# Git情報を追記（存在しない場合）
if ! grep -q "## Git情報" .claude/context/current-status.md; then
    cat >> .claude/context/current-status.md << EOF

## Git情報

- **現在のブランチ**: $CURRENT_BRANCH
- **最後のコミット**: $LAST_COMMIT
- **未コミットの変更**: $UNCOMMITTED ファイル
- **パッケージバージョン**: $VERSION
EOF
else
    # 既存のGit情報を更新
    sed -i "/## Git情報/,/^##/c\\
## Git情報\\
\\
- **現在のブランチ**: $CURRENT_BRANCH\\
- **最後のコミット**: $LAST_COMMIT\\
- **未コミットの変更**: $UNCOMMITTED ファイル\\
- **パッケージバージョン**: $VERSION\\
\\
##" .claude/context/current-status.md
fi

# 2. テストカバレッジ情報を取得（存在する場合）
if [ -f "coverage/coverage-summary.json" ]; then
    echo -e "${YELLOW}🧪 テストカバレッジ情報を更新中...${NC}"
    
    # カバレッジ情報を抽出（Node.jsを使用）
    node -e "
    const coverage = require('./coverage/coverage-summary.json');
    const total = coverage.total;
    console.log('Lines: ' + total.lines.pct + '%');
    console.log('Branches: ' + total.branches.pct + '%');
    console.log('Functions: ' + total.functions.pct + '%');
    console.log('Statements: ' + total.statements.pct + '%');
    " > /tmp/coverage.txt 2>/dev/null || echo "カバレッジ情報なし" > /tmp/coverage.txt
fi

# 3. 依存関係の数を集計
echo -e "${YELLOW}📦 依存関係情報を更新中...${NC}"
DEPS=$(node -p "Object.keys(require('./package.json').dependencies || {}).length" 2>/dev/null || echo 0)
DEV_DEPS=$(node -p "Object.keys(require('./package.json').devDependencies || {}).length" 2>/dev/null || echo 0)

# 4. ファイル統計を生成
echo -e "${YELLOW}📈 ファイル統計を生成中...${NC}"

# ソースコードファイル数
JSX_FILES=$(find src -name "*.jsx" 2>/dev/null | wc -l)
TSX_FILES=$(find src -name "*.tsx" 2>/dev/null | wc -l)
TS_FILES=$(find src -name "*.ts" 2>/dev/null | wc -l)
JS_FILES=$(find src -name "*.js" 2>/dev/null | wc -l)

# テストファイル数
TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)

# ドキュメント数
DOC_FILES=$(find docs -name "*.md" 2>/dev/null | wc -l)

# 5. プロジェクトサマリーファイルを作成/更新
echo -e "${YELLOW}📝 プロジェクトサマリーを生成中...${NC}"

cat > .claude/context/project-summary.md << EOF
# プロジェクトサマリー

最終更新: $TODAY

## 基本情報
- **プロジェクト名**: PMPLearningManagement
- **バージョン**: $VERSION
- **現在のブランチ**: $CURRENT_BRANCH
- **最後のコミット**: $LAST_COMMIT

## ファイル統計
- **JSXファイル**: $JSX_FILES
- **TSXファイル**: $TSX_FILES
- **TSファイル**: $TS_FILES
- **JSファイル**: $JS_FILES
- **テストファイル**: $TEST_FILES
- **ドキュメント**: $DOC_FILES

## 依存関係
- **本番依存**: $DEPS パッケージ
- **開発依存**: $DEV_DEPS パッケージ

## テストカバレッジ
$(cat /tmp/coverage.txt 2>/dev/null || echo "情報なし")

## 未コミットの変更
$UNCOMMITTED ファイル
EOF

# 6. TODOリストを抽出
echo -e "${YELLOW}📋 TODOリストを抽出中...${NC}"

# ソースコードからTODOコメントを抽出
echo "# TODOリスト" > .claude/context/todo-list.md
echo "" >> .claude/context/todo-list.md
echo "最終更新: $TODAY" >> .claude/context/todo-list.md
echo "" >> .claude/context/todo-list.md

grep -r "TODO\|FIXME\|XXX\|HACK" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | while read -r line; do
    FILE=$(echo "$line" | cut -d: -f1)
    CONTENT=$(echo "$line" | cut -d: -f2-)
    echo "- \`$FILE\`: $CONTENT" >> .claude/context/todo-list.md
done || echo "TODOコメントなし" >> .claude/context/todo-list.md

# 7. 最近の変更を記録
echo -e "${YELLOW}📜 最近の変更を記録中...${NC}"

cat > .claude/context/recent-changes.md << EOF
# 最近の変更

最終更新: $TODAY

## 最近のコミット（最新10件）

\`\`\`
$(git log --oneline -10)
\`\`\`

## 変更されたファイル（未コミット）

\`\`\`
$(git status --porcelain)
\`\`\`

## 今週の活動サマリー

\`\`\`
$(git log --since="7 days ago" --pretty=format:"%h - %an, %ar : %s" --stat | head -50)
\`\`\`
EOF

# 8. 完了メッセージ
echo -e "${GREEN}✅ コンテキスト同期が完了しました！${NC}"
echo ""
echo "更新されたファイル:"
echo "  - .claude/context/current-status.md"
echo "  - .claude/context/project-summary.md"
echo "  - .claude/context/todo-list.md"
echo "  - .claude/context/recent-changes.md"
echo ""
echo "これらのファイルはClaudeがプロジェクトの最新状態を理解するのに役立ちます。"

# 一時ファイルのクリーンアップ
rm -f /tmp/coverage.txt