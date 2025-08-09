#!/bin/bash

# Claude AI Integration Test Script
# このスクリプトはGitHub CLIを使用してClaude統合をテストします

echo "========================================="
echo "Claude AI Integration Test Script"
echo "========================================="
echo ""

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "インストール方法: https://cli.github.com/"
    exit 1
fi

# GitHub CLIの認証状態を確認
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLIが認証されていません"
    echo "実行: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI準備完了"
echo ""

# リポジトリ情報を取得
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$REPO" ]; then
    echo "❌ GitHubリポジトリが見つかりません"
    exit 1
fi

echo "📦 リポジトリ: $REPO"
echo ""

# テストを選択
echo "実行するテストを選択してください:"
echo "1) Claude Assistant テスト (@claudeメンション)"
echo "2) Issue Handler テスト (自動ラベリング)"
echo "3) 両方のテストを実行"
echo "4) 既存のテストIssueを確認"
echo "5) 終了"
echo ""
read -p "選択 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📝 Claude Assistant テストIssueを作成中..."
        
        ISSUE_URL=$(gh issue create \
            --title "[TEST] Claude AI Assistant Integration Test" \
            --body "Testing Claude AI assistant integration.

@claude Please respond with a brief summary of the PMP Learning Management project based on the repository context.

This is a test issue to verify the GitHub Actions integration with Claude AI.

Expected outcome:
- Claude should respond to this mention
- Response should appear as a comment
- No errors in GitHub Actions logs" \
            --label "test,ai-integration,claude-assistant")
        
        if [ $? -eq 0 ]; then
            echo "✅ テストIssue作成成功!"
            echo "URL: $ISSUE_URL"
            echo ""
            echo "次のステップ:"
            echo "1. GitHub Actionsタブで実行状況を確認"
            echo "2. Issueページでコメントを確認"
        else
            echo "❌ Issue作成に失敗しました"
        fi
        ;;
        
    2)
        echo ""
        echo "📝 Issue Handler テストIssueを作成中..."
        
        ISSUE_URL=$(gh issue create \
            --title "[BUG] Test Issue for Automatic Labeling" \
            --body "This is a test issue to verify automatic labeling by Claude AI.

## Description
Testing the automatic issue analysis and labeling feature.

## Steps to Reproduce
1. Create this issue
2. Wait for Claude AI to analyze
3. Check applied labels and priority

## Expected Behavior
- Issue should be automatically analyzed
- Appropriate labels should be applied
- Priority should be assigned
- Analysis comment should be posted

## Environment
- Project: PMP Learning Management
- Component: Testing")
        
        if [ $? -eq 0 ]; then
            echo "✅ テストIssue作成成功!"
            echo "URL: $ISSUE_URL"
            echo ""
            echo "次のステップ:"
            echo "1. GitHub Actionsタブで実行状況を確認"
            echo "2. Issueページでラベルとコメントを確認"
        else
            echo "❌ Issue作成に失敗しました"
        fi
        ;;
        
    3)
        echo ""
        echo "📝 両方のテストIssueを作成中..."
        
        # Claude Assistant テスト
        ISSUE1_URL=$(gh issue create \
            --title "[TEST] Claude AI Assistant Test $(date +%s)" \
            --body "@claude What are the main features of this PMP Learning Management system?" \
            --label "test,claude-assistant")
        
        # Issue Handler テスト
        ISSUE2_URL=$(gh issue create \
            --title "[FEATURE] Automated Testing $(date +%s)" \
            --body "Test automatic labeling and priority assignment for a new feature request.")
        
        echo "✅ テストIssue作成完了!"
        echo "Issue 1: $ISSUE1_URL"
        echo "Issue 2: $ISSUE2_URL"
        ;;
        
    4)
        echo ""
        echo "📋 既存のテストIssueを確認中..."
        gh issue list --label "test" --limit 10
        ;;
        
    5)
        echo "終了します"
        exit 0
        ;;
        
    *)
        echo "無効な選択です"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "テスト完了"
echo "========================================="
echo ""
echo "📌 確認事項:"
echo "1. GitHub Actions タブで実行状況を確認"
echo "2. ワークフローの成功/失敗を確認"
echo "3. Issueページでコメントやラベルを確認"
echo ""
echo "🔍 トラブルシューティング:"
echo "- Secretsが設定されているか確認: Settings → Secrets and variables → Actions"
echo "- Actions権限が適切か確認: Settings → Actions → General"
echo "- ワークフローログでエラー詳細を確認"