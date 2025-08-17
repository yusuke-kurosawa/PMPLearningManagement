#!/bin/bash

# PR作成ヘルパースクリプト
# 使用方法: npm run pr:create [issue_number] [title] [body]

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数処理
ISSUE_NUMBER=$1
PR_TITLE=$2
PR_BODY=$3

# 現在のブランチ名を取得
CURRENT_BRANCH=$(git branch --show-current)

# ヘルプ表示
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${BLUE}PR作成ヘルパー${NC}"
    echo ""
    echo "使用方法:"
    echo "  npm run pr:create [issue_number] [title] [body]"
    echo ""
    echo "例:"
    echo "  npm run pr:create 89 \"feat: 認証システム追加\" \"ログイン機能の実装\""
    echo ""
    echo "オプション:"
    echo "  --help, -h    このヘルプを表示"
    echo "  --draft       ドラフトPRとして作成"
    echo ""
    exit 0
fi

# Issue番号の確認
if [ -z "$ISSUE_NUMBER" ]; then
    echo -e "${YELLOW}Issue番号を入力してください:${NC}"
    read -r ISSUE_NUMBER
fi

# ブランチ名にIssue番号が含まれているか確認
if [[ ! "$CURRENT_BRANCH" =~ $ISSUE_NUMBER ]]; then
    echo -e "${YELLOW}警告: ブランチ名 '$CURRENT_BRANCH' にIssue番号 #$ISSUE_NUMBER が含まれていません${NC}"
    echo -e "${YELLOW}続行しますか? (y/n):${NC}"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo -e "${RED}PR作成をキャンセルしました${NC}"
        exit 1
    fi
fi

# タイトルの設定
if [ -z "$PR_TITLE" ]; then
    echo -e "${YELLOW}PRタイトルを入力してください:${NC}"
    read -r PR_TITLE
fi

# Issue番号をタイトルに追加
if [[ ! "$PR_TITLE" =~ "#$ISSUE_NUMBER" ]]; then
    PR_TITLE="$PR_TITLE #$ISSUE_NUMBER"
fi

# 本文の設定
if [ -z "$PR_BODY" ]; then
    # デフォルトの本文を生成
    PR_BODY=$(cat <<EOF
## 概要
このPRはIssue #$ISSUE_NUMBER を解決します。

## 変更内容
$(git log origin/main..HEAD --oneline | head -5)

## テスト
- [ ] 単体テスト実行済み
- [ ] E2Eテスト実行済み
- [ ] 手動テスト実行済み

Closes #$ISSUE_NUMBER
EOF
)
fi

# 変更の確認
echo -e "${BLUE}=== PR作成内容の確認 ===${NC}"
echo -e "${GREEN}ブランチ:${NC} $CURRENT_BRANCH"
echo -e "${GREEN}タイトル:${NC} $PR_TITLE"
echo -e "${GREEN}本文:${NC}"
echo "$PR_BODY"
echo ""
echo -e "${YELLOW}この内容でPRを作成しますか? (y/n):${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo -e "${RED}PR作成をキャンセルしました${NC}"
    exit 1
fi

# 変更をpush
echo -e "${BLUE}変更をpushしています...${NC}"
git push -u origin "$CURRENT_BRANCH"

# PRを作成
echo -e "${BLUE}PRを作成しています...${NC}"

# ドラフトフラグの確認
DRAFT_FLAG=""
if [ "$4" = "--draft" ]; then
    DRAFT_FLAG="--draft"
fi

# gh コマンドでPR作成
gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --assignee @me \
    $DRAFT_FLAG

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PRが正常に作成されました！${NC}"
    
    # PR URLを表示
    PR_URL=$(gh pr view --json url -q .url)
    echo -e "${GREEN}PR URL: $PR_URL${NC}"
    
    # ブラウザで開くか確認
    echo -e "${YELLOW}ブラウザでPRを開きますか? (y/n):${NC}"
    read -r OPEN_BROWSER
    if [ "$OPEN_BROWSER" = "y" ]; then
        gh pr view --web
    fi
else
    echo -e "${RED}✗ PR作成に失敗しました${NC}"
    exit 1
fi

# 統計情報を表示
echo ""
echo -e "${BLUE}=== PR統計情報 ===${NC}"
echo -e "${GREEN}変更ファイル数:${NC} $(git diff --stat origin/main..HEAD | tail -1 | awk '{print $1}')"
echo -e "${GREEN}追加行数:${NC} $(git diff --stat origin/main..HEAD | tail -1 | grep -oE '[0-9]+ insertion' | awk '{print $1}')"
echo -e "${GREEN}削除行数:${NC} $(git diff --stat origin/main..HEAD | tail -1 | grep -oE '[0-9]+ deletion' | awk '{print $1}')"

echo ""
echo -e "${GREEN}✨ PR作成が完了しました！${NC}"