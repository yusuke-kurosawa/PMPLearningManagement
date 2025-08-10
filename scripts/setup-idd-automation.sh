#!/bin/bash

# IDD自動化セットアップスクリプト
# このスクリプトは、IDD準拠のための完全な自動化環境をセットアップします

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ロゴ表示
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██╗██████╗ ██████╗     ███████╗███████╗████████╗██╗   ██╗║
║     ██║██╔══██╗██╔══██╗    ██╔════╝██╔════╝╚══██╔══╝██║   ██║║
║     ██║██║  ██║██║  ██║    ███████╗█████╗     ██║   ██║   ██║║
║     ██║██║  ██║██║  ██║    ╚════██║██╔══╝     ██║   ██║   ██║║
║     ██║██████╔╝██████╔╝    ███████║███████╗   ██║   ╚██████╔╝║
║     ╚═╝╚═════╝ ╚═════╝     ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ║
║                                                               ║
║           Issue-Driven Development Automation Setup           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 関数定義
print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# プロジェクトルートの確認
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Step 1: Git Hooks のインストール
print_step "Step 1: Installing Git Hooks"

if [ -f ".github/hooks/install.sh" ]; then
    chmod +x .github/hooks/install.sh
    chmod +x .github/hooks/uninstall.sh
    chmod +x .github/hooks/pre-commit
    chmod +x .github/hooks/commit-msg
    chmod +x .github/hooks/pre-push
    
    .github/hooks/install.sh
    print_success "Git hooks installed successfully"
else
    print_error "Git hooks not found. Please ensure .github/hooks directory exists"
fi

# Step 2: GitHub CLI のチェック
print_step "Step 2: Checking GitHub CLI"

if command -v gh &> /dev/null; then
    print_success "GitHub CLI is installed ($(gh --version | head -n1))"
    
    # 認証状態の確認
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI is authenticated"
    else
        print_warning "GitHub CLI is not authenticated"
        echo "Run: gh auth login"
    fi
else
    print_warning "GitHub CLI is not installed"
    echo "Install from: https://cli.github.com/"
    echo "Or run:"
    echo "  macOS:  brew install gh"
    echo "  Ubuntu: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
fi

# Step 3: Node.js 依存関係のチェック
print_step "Step 3: Checking Node.js Dependencies"

# 必要なパッケージのインストール
if [ -f "package.json" ]; then
    print_info "Installing/updating dependencies for IDD automation..."
    
    # ESLintがインストールされているか確認
    if ! npm ls eslint &> /dev/null; then
        print_info "Installing ESLint for code quality checks..."
        npm install --save-dev eslint
    fi
    
    print_success "Dependencies checked and updated"
else
    print_warning "package.json not found"
fi

# Step 4: IDD設定ファイルの作成
print_step "Step 4: Creating IDD Configuration"

# .iddrc 設定ファイルの作成
cat << 'EOF' > .iddrc
{
  "version": "1.0.0",
  "strict_mode": true,
  "rules": {
    "require_issue_in_commits": true,
    "require_issue_in_pr_title": true,
    "require_issue_in_pr_body": true,
    "minimum_compliance_rate": 95,
    "block_non_compliant_pushes": true,
    "auto_create_tracking_issues": false
  },
  "notifications": {
    "slack_webhook": "",
    "email_recipients": [],
    "notify_on_violation": true,
    "weekly_reports": true
  },
  "metrics": {
    "track_compliance": true,
    "dashboard_enabled": true,
    "export_format": "json"
  },
  "exclusions": {
    "branches": ["gh-pages", "release/*"],
    "authors": [],
    "commit_patterns": ["^Merge", "^Revert"]
  }
}
EOF

print_success "Created .iddrc configuration file"

# Step 5: Git設定の更新
print_step "Step 5: Updating Git Configuration"

# コミットテンプレートの設定
cat << 'EOF' > .gitmessage
# <type>(<scope>): <subject> (#<issue>)
#
# <body>
#
# <footer>
#
# Type: feat, fix, docs, style, refactor, test, chore
# Scope: optional, e.g., auth, api, ui
# Subject: imperative mood, max 50 chars
# Issue: REQUIRED - reference GitHub issue number
#
# Example:
# feat(auth): Add OAuth2 integration (#234)
#
# This commit implements OAuth2 authentication flow
# for third-party integrations.
#
# Closes #234
EOF

git config --local commit.template .gitmessage
print_success "Git commit template configured"

# エイリアスの設定
git config --local alias.idd-status '!echo "📊 IDD Compliance Status" && echo "" && git log --oneline -10 | while read line; do if echo "$line" | grep -qE "#[0-9]+"; then echo "✓ $line"; else echo "✗ $line"; fi; done'
git config --local alias.idd-check '!git log origin/main..HEAD --oneline | grep -v -E "#[0-9]+" && echo "❌ Non-compliant commits found!" || echo "✅ All commits are IDD compliant!"'

print_success "Git aliases configured (git idd-status, git idd-check)"

# Step 6: VSCode設定（オプション）
print_step "Step 6: Configuring VSCode (Optional)"

if [ -d ".vscode" ] || command -v code &> /dev/null; then
    mkdir -p .vscode
    
    # VSCode タスクの作成
    cat << 'EOF' > .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "IDD: Check Compliance",
      "type": "shell",
      "command": "git idd-check",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "IDD: Create Issue",
      "type": "shell",
      "command": "gh issue create",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "IDD: List Issues",
      "type": "shell",
      "command": "gh issue list --limit 10",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
EOF
    
    print_success "VSCode tasks configured"
else
    print_info "VSCode not detected, skipping VSCode configuration"
fi

# Step 7: 初期メトリクスファイルの作成
print_step "Step 7: Initializing Metrics"

mkdir -p .github/metrics

# 初期メトリクスファイル
echo "timestamp,event,total,compliant,violations" > .github/metrics/idd-metrics.csv
echo "$(date '+%Y-%m-%d %H:%M:%S'),setup,0,0,0" >> .github/metrics/idd-metrics.csv

print_success "Metrics files initialized"

# Step 8: README更新の提案
print_step "Step 8: Documentation Updates"

if [ -f "README.md" ]; then
    if ! grep -q "IDD Compliance" README.md; then
        print_info "Consider adding IDD compliance badge to README.md:"
        echo ""
        echo "[![IDD Compliance](https://img.shields.io/badge/IDD-Compliant-success)](https://github.com/your-org/PMPLearningManagement/blob/main/docs/IDD_AGENT_GUIDELINES.md)"
        echo ""
    fi
fi

# Step 9: チームへの通知設定
print_step "Step 9: Team Notification Setup"

cat << 'EOF' > .github/idd-notify.sh
#!/bin/bash
# IDD違反通知スクリプト

VIOLATION_MSG="$1"
AUTHOR="$2"

# Slack通知（Webhook URLを設定してください）
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️ IDD Violation Detected\",\"blocks\":[{\"type\":\"section\",\"text\":{\"type\":\"mrkdwn\",\"text\":\"*Author:* $AUTHOR\n*Issue:* $VIOLATION_MSG\"}}]}"
fi

# メール通知（設定が必要）
# echo "$VIOLATION_MSG" | mail -s "IDD Violation Alert" team@example.com

echo "Notification sent for: $VIOLATION_MSG"
EOF

chmod +x .github/idd-notify.sh
print_success "Notification script created"

# Step 10: 最終確認とサマリー
print_step "Setup Complete!"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ IDD Automation Setup Completed Successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n📋 ${CYAN}Setup Summary:${NC}"
echo "  ✓ Git hooks installed and configured"
echo "  ✓ IDD configuration file created (.iddrc)"
echo "  ✓ Git commit template configured"
echo "  ✓ Git aliases added (idd-status, idd-check)"
echo "  ✓ Metrics tracking initialized"
echo "  ✓ Notification system prepared"

echo -e "\n🚀 ${CYAN}Next Steps:${NC}"
echo "  1. Test the setup:"
echo "     $ git idd-status    # Check recent commits"
echo "     $ git idd-check     # Verify compliance"
echo ""
echo "  2. Create your first IDD-compliant commit:"
echo "     $ gh issue create --title 'Your feature'"
echo "     $ git add ."
echo "     $ git commit -m 'feat: Your feature (#issue_number)'"
echo ""
echo "  3. Configure team notifications:"
echo "     - Set SLACK_WEBHOOK_URL environment variable"
echo "     - Update .github/idd-notify.sh with your settings"
echo ""
echo "  4. View the dashboard (after first push):"
echo "     https://your-org.github.io/PMPLearningManagement/idd-dashboard/"

echo -e "\n📚 ${CYAN}Documentation:${NC}"
echo "  - Quick Reference: .github/IDD_QUICK_REFERENCE.md"
echo "  - Full Guidelines: docs/IDD_AGENT_GUIDELINES.md"
echo "  - Configuration: .iddrc"

echo -e "\n${YELLOW}⚠️  Important:${NC}"
echo "  - All team members should run this setup script"
echo "  - Commit hooks are now active and will enforce IDD"
echo "  - Non-compliant commits will be blocked by default"

echo -e "\n${GREEN}Happy coding with IDD! 🎉${NC}\n"

# 設定ファイルをgitに追加するか確認
read -p "Would you like to commit the IDD configuration files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .iddrc .gitmessage .github/hooks/* .github/IDD_QUICK_REFERENCE.md .github/workflows/idd-*.yml .github/ISSUE_TEMPLATE/*.md .vscode/tasks.json 2>/dev/null || true
    
    # Issue作成を促す
    echo -e "\n${CYAN}Creating an issue for this setup...${NC}"
    if command -v gh &> /dev/null && gh auth status &> /dev/null; then
        ISSUE_NUM=$(gh issue create --title "Setup IDD automation infrastructure" --body "Implement comprehensive IDD automation including git hooks, CI/CD workflows, and monitoring dashboard" --label "enhancement,idd-required" | grep -oE '[0-9]+$')
        git commit -m "feat: Implement IDD automation infrastructure (#$ISSUE_NUM)

- Add git hooks for commit message validation
- Create GitHub Actions workflows for compliance checking
- Setup monitoring dashboard
- Add issue templates
- Create quick reference guide

Closes #$ISSUE_NUM"
        print_success "Configuration committed with issue reference #$ISSUE_NUM"
    else
        print_warning "Please create an issue manually and reference it in your commit"
        echo "Example: git commit -m 'feat: Implement IDD automation (#YOUR_ISSUE_NUMBER)'"
    fi
fi

exit 0