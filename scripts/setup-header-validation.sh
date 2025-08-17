#!/bin/bash

#
# ヘッダーコメント検証システム セットアップスクリプト
# 目的: eslint-plugin-header + GitHub Actions + Repository Rulesetsの統合環境構築
#

set -e

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ロゴとヘッダー
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                   ヘッダーコメント検証システム セットアップ                          ║"
echo "║                                                                                      ║"
echo "║   PMPLearningManagement プロジェクト用                                                ║"
echo "║   ESLint + GitHub Actions + Repository Rulesets 統合                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 前提条件のチェック
echo -e "${YELLOW}📋 前提条件をチェックしています...${NC}"

# Node.js のバージョンチェック
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js がインストールされていません${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo -e "${RED}❌ Node.js バージョン 18.0.0 以上が必要です（現在: $NODE_VERSION）${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"

# npm のチェック
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm がインストールされていません${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# package.json の存在確認
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json が見つかりません。プロジェクトルートで実行してください${NC}"
    exit 1
fi

echo -e "${GREEN}✅ package.json が見つかりました${NC}"

# 必要な依存関係のインストール
echo -e "${YELLOW}📦 必要な依存関係をインストールしています...${NC}"

# eslint-plugin-header の確認とインストール
if ! npm list eslint-plugin-header &> /dev/null; then
    echo -e "${YELLOW}📦 eslint-plugin-header をインストールしています...${NC}"
    npm install --save-dev eslint-plugin-header
    echo -e "${GREEN}✅ eslint-plugin-header がインストールされました${NC}"
else
    echo -e "${GREEN}✅ eslint-plugin-header は既にインストール済みです${NC}"
fi

# .eslintrc.header.json の存在確認
if [ ! -f ".eslintrc.header.json" ]; then
    echo -e "${RED}❌ .eslintrc.header.json が見つかりません${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .eslintrc.header.json が見つかりました${NC}"

# npm スクリプトの確認
echo -e "${YELLOW}🔍 npm スクリプトを確認しています...${NC}"

REQUIRED_SCRIPTS=("lint:header" "lint:header:fix" "header:validate" "header:apply")
MISSING_SCRIPTS=()

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if ! npm run-script $script --silent 2>/dev/null | head -1 | grep -q "Missing script"; then
        echo -e "${GREEN}✅ npm run $script${NC}"
    else
        MISSING_SCRIPTS+=($script)
        echo -e "${RED}❌ npm run $script (未定義)${NC}"
    fi
done

if [ ${#MISSING_SCRIPTS[@]} -gt 0 ]; then
    echo -e "${RED}❌ 必要な npm スクリプトが不足しています: ${MISSING_SCRIPTS[*]}${NC}"
    echo -e "${YELLOW}package.json に以下のスクリプトを追加してください:${NC}"
    echo ""
    echo '"lint:header": "eslint src --ext .js,.jsx,.ts,.tsx -c .eslintrc.header.json",'
    echo '"lint:header:fix": "eslint src --ext .js,.jsx,.ts,.tsx -c .eslintrc.header.json --fix",'
    echo '"header:validate": "npm run lint:header",'
    echo '"header:apply": "npm run lint:header:fix"'
    echo ""
    exit 1
fi

# GitHub Actions ワークフローの確認
echo -e "${YELLOW}🔍 GitHub Actions ワークフローを確認しています...${NC}"

WORKFLOW_FILE=".github/workflows/02-quality-header-validation.yml"
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}❌ GitHub Actions ワークフローが見つかりません: $WORKFLOW_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub Actions ワークフロー: $WORKFLOW_FILE${NC}"

# 初回検証テストの実行
echo -e "${YELLOW}🧪 初回ヘッダー検証テストを実行しています...${NC}"

# テスト実行（結果は保存するが、エラーでもスクリプトは継続）
set +e
npm run lint:header > header-test-results.txt 2>&1
TEST_EXIT_CODE=$?
set -e

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ 全ファイルがヘッダー検証に合格しました${NC}"
else
    ERROR_COUNT=$(grep -o '[0-9]\+ errors' header-test-results.txt | grep -o '[0-9]\+' || echo "0")
    WARNING_COUNT=$(grep -o '[0-9]\+ warnings' header-test-results.txt | grep -o '[0-9]\+' || echo "0")
    
    echo -e "${YELLOW}⚠️ ヘッダー検証でエラーが検出されました${NC}"
    echo -e "   エラー: ${RED}${ERROR_COUNT}個${NC}"
    echo -e "   警告: ${YELLOW}${WARNING_COUNT}個${NC}"
    echo ""
    echo -e "${BLUE}自動修正を実行するには:${NC}"
    echo -e "   ${GREEN}npm run lint:header:fix${NC}"
    echo ""
fi

# 統計情報の表示
echo -e "${YELLOW}📊 プロジェクト統計を生成しています...${NC}"

TOTAL_FILES=$(find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | wc -l)
echo -e "${BLUE}総ソースファイル数: ${TOTAL_FILES}${NC}"

# セットアップ完了メッセージ
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                          🎉 セットアップ完了 🎉                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}✨ ヘッダーコメント検証システムが正常にセットアップされました！${NC}"
echo ""
echo -e "${YELLOW}📋 利用可能なコマンド:${NC}"
echo -e "   ${GREEN}npm run lint:header${NC}       # ヘッダー検証の実行"
echo -e "   ${GREEN}npm run lint:header:fix${NC}   # 自動修正の適用"
echo -e "   ${GREEN}npm run header:validate${NC}   # 検証のエイリアス"
echo -e "   ${GREEN}npm run header:apply${NC}      # 修正のエイリアス"
echo ""

echo -e "${YELLOW}🔄 次のステップ:${NC}"
echo -e "   1. ${BLUE}Repository Rulesets の設定${NC}"
echo -e "      - GitHub リポジトリ → Settings → Rules → Rulesets"
echo -e "      - Required status check: 'Header Comment Validation'"
echo ""
echo -e "   2. ${BLUE}初回ヘッダー修正（必要に応じて）${NC}"
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo -e "      - ${GREEN}npm run lint:header:fix${NC} で自動修正"
    echo -e "      - ${GREEN}npm run lint:header${NC} で結果確認"
fi
echo ""
echo -e "   3. ${BLUE}チーム向けガイドライン共有${NC}"
echo -e "      - docs/HEADER_COMMENT_VALIDATION_IMPLEMENTATION_REPORT.md"
echo ""

echo -e "${YELLOW}📚 詳細なドキュメント:${NC}"
echo -e "   - 実装レポート: docs/HEADER_COMMENT_VALIDATION_IMPLEMENTATION_REPORT.md"
echo -e "   - GitHub Actions: .github/workflows/02-quality-header-validation.yml"
echo -e "   - ESLint設定: .eslintrc.header.json"
echo ""

echo -e "${GREEN}🎯 期待される効果:${NC}"
echo -e "   ✅ ファイル作成者の明確化"
echo -e "   ✅ コード可読性の向上"
echo -e "   ✅ 新規参加者のオンボーディング効率化"
echo -e "   ✅ プロジェクト全体の保守性向上"
echo ""

# テスト結果ファイルのクリーンアップ
rm -f header-test-results.txt

echo -e "${BLUE}🚀 ヘッダーコメント強制化システムの準備が完了しました！${NC}"