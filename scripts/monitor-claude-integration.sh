#!/bin/bash

# Claude AI Integration Monitoring Script
# このスクリプトはClaude統合の状態を監視し、レポートを生成します

echo "========================================="
echo "Claude AI Integration Monitor"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) がインストールされていません${NC}"
    exit 1
fi

# 認証状態確認
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLIが認証されていません${NC}"
    exit 1
fi

# リポジトリ情報を取得
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${GREEN}📦 リポジトリ: $REPO${NC}"
echo ""

# 1. ワークフロー実行状況の確認
echo "📊 ワークフロー実行状況"
echo "------------------------"

# Claude Assistant ワークフロー
echo "1. Claude Assistant:"
ASSISTANT_RUNS=$(gh run list --workflow=claude-assistant.yml --limit 5 --json status,conclusion,createdAt 2>/dev/null)
if [ -n "$ASSISTANT_RUNS" ] && [ "$ASSISTANT_RUNS" != "[]" ]; then
    echo "$ASSISTANT_RUNS" | jq -r '.[] | "   - \(.createdAt | split("T")[0]): \(.status) / \(.conclusion // "running")"'
else
    echo -e "   ${YELLOW}まだ実行されていません${NC}"
fi

# Issue Handler ワークフロー
echo ""
echo "2. Issue Handler:"
HANDLER_RUNS=$(gh run list --workflow=claude-issue-handler.yml --limit 5 --json status,conclusion,createdAt 2>/dev/null)
if [ -n "$HANDLER_RUNS" ] && [ "$HANDLER_RUNS" != "[]" ]; then
    echo "$HANDLER_RUNS" | jq -r '.[] | "   - \(.createdAt | split("T")[0]): \(.status) / \(.conclusion // "running")"'
else
    echo -e "   ${YELLOW}まだ実行されていません${NC}"
fi

# PR Review ワークフロー
echo ""
echo "3. PR Review:"
REVIEW_RUNS=$(gh run list --workflow=claude-pr-review.yml --limit 5 --json status,conclusion,createdAt 2>/dev/null)
if [ -n "$REVIEW_RUNS" ] && [ "$REVIEW_RUNS" != "[]" ]; then
    echo "$REVIEW_RUNS" | jq -r '.[] | "   - \(.createdAt | split("T")[0]): \(.status) / \(.conclusion // "running")"'
else
    echo -e "   ${YELLOW}まだ実行されていません${NC}"
fi

# 2. Claude関連のIssuesとコメントの確認
echo ""
echo "🔍 Claude関連のアクティビティ"
echo "--------------------------------"

# Claudeがメンションされた最近のIssues
echo "最近の@claudeメンション:"
CLAUDE_ISSUES=$(gh issue list --search "@claude" --limit 5 --json number,title,state 2>/dev/null)
if [ -n "$CLAUDE_ISSUES" ] && [ "$CLAUDE_ISSUES" != "[]" ]; then
    echo "$CLAUDE_ISSUES" | jq -r '.[] | "   Issue #\(.number): \(.title) [\(.state)]"'
else
    echo -e "   ${YELLOW}@claudeメンションが見つかりません${NC}"
fi

# 3. ラベル統計
echo ""
echo "📌 自動ラベリング統計"
echo "----------------------"

# claude-analyzedラベルがついたIssue数
ANALYZED_COUNT=$(gh issue list --label "claude-analyzed" --json number --jq '. | length' 2>/dev/null || echo "0")
echo "claude-analyzed ラベル付きIssue: $ANALYZED_COUNT"

# 優先度ラベルの分布
echo "優先度分布:"
for priority in critical high medium low; do
    COUNT=$(gh issue list --label "priority:$priority" --json number --jq '. | length' 2>/dev/null || echo "0")
    echo "   priority:$priority: $COUNT"
done

# 4. エラーチェック
echo ""
echo "⚠️  エラーチェック"
echo "------------------"

# 最近のワークフローエラーを確認
FAILED_RUNS=$(gh run list --status failure --limit 3 --json workflowName,conclusion,createdAt 2>/dev/null)
if [ -n "$FAILED_RUNS" ] && [ "$FAILED_RUNS" != "[]" ]; then
    echo -e "${RED}失敗したワークフロー:${NC}"
    echo "$FAILED_RUNS" | jq -r '.[] | "   - \(.workflowName): \(.createdAt | split("T")[0])"'
else
    echo -e "${GREEN}✅ 最近のエラーはありません${NC}"
fi

# 5. APIキー設定の確認（値は表示しない）
echo ""
echo "🔐 セキュリティ設定"
echo "-------------------"

# Secretsの存在確認（値は取得できない）
echo "GitHub Secrets:"
echo "   ANTHROPIC_API_KEY: [設定済みかGitHub UIで確認してください]"
echo "   設定場所: Settings → Secrets and variables → Actions"

# 6. 推奨事項
echo ""
echo "💡 推奨事項"
echo "-----------"

if [ "$ANALYZED_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}• Issueの自動分析がまだ実行されていません${NC}"
    echo "  → 新しいIssueを作成して機能をテストしてください"
fi

if [ -z "$ASSISTANT_RUNS" ] || [ "$ASSISTANT_RUNS" = "[]" ]; then
    echo -e "${YELLOW}• Claude Assistantがまだ使用されていません${NC}"
    echo "  → @claudeメンションを含むIssueコメントを作成してください"
fi

# 成功率の計算（簡易版）
TOTAL_RUNS=$(gh run list --limit 20 --json conclusion --jq '. | length' 2>/dev/null || echo "0")
SUCCESS_RUNS=$(gh run list --limit 20 --json conclusion --jq '[.[] | select(.conclusion == "success")] | length' 2>/dev/null || echo "0")

if [ "$TOTAL_RUNS" -gt 0 ]; then
    SUCCESS_RATE=$((SUCCESS_RUNS * 100 / TOTAL_RUNS))
    echo ""
    echo "📈 成功率: $SUCCESS_RATE% ($SUCCESS_RUNS/$TOTAL_RUNS)"
    
    if [ "$SUCCESS_RATE" -lt 80 ]; then
        echo -e "${YELLOW}• 成功率が低いです。ログを確認してください${NC}"
    fi
fi

# 7. レポート生成
echo ""
echo "📄 レポート生成"
echo "---------------"

REPORT_FILE="claude-integration-report-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# Claude AI Integration Monitoring Report

Generated: $(date)
Repository: $REPO

## Workflow Execution Status

### Claude Assistant
$(echo "$ASSISTANT_RUNS" | jq -r 'if . == [] then "No runs yet" else .[] | "- \(.createdAt): \(.status) / \(.conclusion // "running")" end' 2>/dev/null || echo "No data")

### Issue Handler
$(echo "$HANDLER_RUNS" | jq -r 'if . == [] then "No runs yet" else .[] | "- \(.createdAt): \(.status) / \(.conclusion // "running")" end' 2>/dev/null || echo "No data")

### PR Review
$(echo "$REVIEW_RUNS" | jq -r 'if . == [] then "No runs yet" else .[] | "- \(.createdAt): \(.status) / \(.conclusion // "running")" end' 2>/dev/null || echo "No data")

## Statistics

- Issues with claude-analyzed label: $ANALYZED_COUNT
- Total workflow runs (last 20): $TOTAL_RUNS
- Successful runs: $SUCCESS_RUNS
- Success rate: ${SUCCESS_RATE:-0}%

## Recommendations

$(if [ "$ANALYZED_COUNT" -eq 0 ]; then echo "- Test automatic issue analysis by creating new issues"; fi)
$(if [ -z "$ASSISTANT_RUNS" ] || [ "$ASSISTANT_RUNS" = "[]" ]; then echo "- Test Claude Assistant by mentioning @claude in issues"; fi)
$(if [ "$SUCCESS_RATE" -lt 80 ] 2>/dev/null; then echo "- Review failed workflow logs to improve success rate"; fi)

## Next Steps

1. Monitor API usage and costs
2. Optimize prompts for better responses
3. Consider adding more automation features
EOF

echo -e "${GREEN}✅ レポートを生成しました: $REPORT_FILE${NC}"

echo ""
echo "========================================="
echo "監視完了"
echo "========================================="