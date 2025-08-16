#!/bin/bash

# ================================================================
# GitHub Actions設定監査スクリプト
# PMPLearningManagement用のActions設定を包括的に監査
# 作成者: DevOps Engineer Agent
# 最終更新: 2025-08-16
# ================================================================

set -euo pipefail

# 色付きoutput用の定数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..60})${NC}"
}

# リポジトリ情報の取得
get_repo_info() {
    if [ -z "${GITHUB_REPOSITORY:-}" ]; then
        if git remote get-url origin >/dev/null 2>&1; then
            REPO_URL=$(git remote get-url origin)
            GITHUB_REPOSITORY=$(echo "$REPO_URL" | sed -E 's/.*github\.com[:/]([^/]+\/[^/]+)(\.git)?$/\1/')
        else
            log_error "GitHub repository not found. Set GITHUB_REPOSITORY or run in git repository."
            exit 1
        fi
    fi
    log_info "Repository: $GITHUB_REPOSITORY"
}

# GitHub CLI認証確認
check_gh_auth() {
    log_header "🔐 GitHub CLI認証確認"
    
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        return 1
    fi
    
    if gh auth status &> /dev/null; then
        log_success "GitHub CLI認証済み"
        gh auth status
    else
        log_error "GitHub CLI認証が必要です。'gh auth login' を実行してください"
        return 1
    fi
}

# Actions権限設定の確認
audit_actions_permissions() {
    log_header "📋 Actions権限設定監査"
    
    log_info "Actions権限設定を取得中..."
    PERMISSIONS=$(gh api repos/$GITHUB_REPOSITORY/actions/permissions)
    
    echo "$PERMISSIONS" | jq . > actions-permissions.json
    
    # 設定値の確認
    ENABLED=$(echo "$PERMISSIONS" | jq -r '.enabled')
    ALLOWED_ACTIONS=$(echo "$PERMISSIONS" | jq -r '.allowed_actions')
    SHA_PINNING=$(echo "$PERMISSIONS" | jq -r '.sha_pinning_required // false')
    
    echo "📊 現在の設定:"
    echo "  • Actions有効: $ENABLED"
    echo "  • 許可アクション: $ALLOWED_ACTIONS"
    echo "  • SHAピンニング: $SHA_PINNING"
    
    # 推奨設定との比較
    echo ""
    echo "🎯 推奨設定との比較:"
    
    if [ "$ENABLED" = "true" ]; then
        log_success "Actions有効: ✅"
    else
        log_warning "Actions無効: ⚠️"
    fi
    
    if [ "$ALLOWED_ACTIONS" = "selected" ]; then
        log_success "許可アクション制限: ✅"
    else
        log_warning "許可アクション制限なし: ⚠️ (セキュリティリスク)"
    fi
    
    if [ "$SHA_PINNING" = "true" ]; then
        log_success "SHAピンニング有効: ✅"
    else
        log_warning "SHAピンニング無効: ⚠️ (セキュリティリスク)"
    fi
}

# ワークフロー権限の確認
audit_workflow_permissions() {
    log_header "🔒 ワークフロー権限監査"
    
    log_info "ワークフロー権限設定を取得中..."
    WORKFLOW_PERMS=$(gh api repos/$GITHUB_REPOSITORY/actions/permissions/workflow)
    
    echo "$WORKFLOW_PERMS" | jq . > workflow-permissions.json
    
    DEFAULT_PERMS=$(echo "$WORKFLOW_PERMS" | jq -r '.default_workflow_permissions')
    CAN_APPROVE=$(echo "$WORKFLOW_PERMS" | jq -r '.can_approve_pull_request_reviews')
    
    echo "📊 現在の設定:"
    echo "  • デフォルト権限: $DEFAULT_PERMS"
    echo "  • PR承認許可: $CAN_APPROVE"
    
    echo ""
    echo "🎯 推奨設定との比較:"
    
    if [ "$DEFAULT_PERMS" = "read" ]; then
        log_success "デフォルト権限制限: ✅"
    else
        log_warning "デフォルト権限が制限なし: ⚠️ (セキュリティリスク)"
    fi
    
    if [ "$CAN_APPROVE" = "false" ]; then
        log_success "PR承認制限: ✅"
    else
        log_warning "PR自動承認許可: ⚠️"
    fi
}

# リポジトリ変数の確認
audit_repository_variables() {
    log_header "📊 リポジトリ変数監査"
    
    log_info "リポジトリ変数を取得中..."
    VARIABLES=$(gh variable list --json name,value,updatedAt)
    
    echo "$VARIABLES" | jq . > repository-variables.json
    
    VARIABLE_COUNT=$(echo "$VARIABLES" | jq length)
    echo "📊 設定済み変数数: $VARIABLE_COUNT"
    
    # 必須変数の確認
    REQUIRED_VARS=(
        "NODE_VERSION"
        "BUILD_TIMEOUT" 
        "TEST_TIMEOUT"
        "COVERAGE_THRESHOLD"
        "PROJECT_NAME"
        "MAIN_BRANCH"
    )
    
    echo ""
    echo "🎯 必須変数の確認:"
    
    for var in "${REQUIRED_VARS[@]}"; do
        if echo "$VARIABLES" | jq -e ".[] | select(.name == \"$var\")" > /dev/null; then
            VALUE=$(echo "$VARIABLES" | jq -r ".[] | select(.name == \"$var\") | .value")
            log_success "$var: $VALUE ✅"
        else
            log_warning "$var: 未設定 ⚠️"
        fi
    done
}

# シークレットの確認
audit_secrets() {
    log_header "🔐 シークレット監査"
    
    log_info "シークレット一覧を取得中..."
    SECRETS=$(gh secret list --json name,updatedAt)
    
    echo "$SECRETS" | jq . > repository-secrets.json
    
    SECRET_COUNT=$(echo "$SECRETS" | jq length)
    echo "📊 設定済みシークレット数: $SECRET_COUNT"
    
    # 推奨シークレットの確認
    RECOMMENDED_SECRETS=(
        "DEPLOY_TOKEN"
        "CODECOV_TOKEN"
        "LIGHTHOUSE_CI_TOKEN"
    )
    
    echo ""
    echo "🎯 推奨シークレットの確認:"
    
    for secret in "${RECOMMENDED_SECRETS[@]}"; do
        if echo "$SECRETS" | jq -e ".[] | select(.name == \"$secret\")" > /dev/null; then
            UPDATED=$(echo "$SECRETS" | jq -r ".[] | select(.name == \"$secret\") | .updatedAt")
            log_success "$secret: 設定済み (更新: $UPDATED) ✅"
        else
            log_warning "$secret: 未設定 ⚠️"
        fi
    done
}

# 環境の確認
audit_environments() {
    log_header "🌍 環境設定監査"
    
    log_info "環境一覧を取得中..."
    ENVIRONMENTS=$(gh api repos/$GITHUB_REPOSITORY/environments | jq '.environments')
    
    echo "$ENVIRONMENTS" | jq . > repository-environments.json
    
    ENV_COUNT=$(echo "$ENVIRONMENTS" | jq length)
    echo "📊 設定済み環境数: $ENV_COUNT"
    
    # 推奨環境の確認
    RECOMMENDED_ENVS=(
        "production"
        "staging"
        "development"
    )
    
    echo ""
    echo "🎯 推奨環境の確認:"
    
    for env in "${RECOMMENDED_ENVS[@]}"; do
        if echo "$ENVIRONMENTS" | jq -e ".[] | select(.name == \"$env\")" > /dev/null; then
            CREATED=$(echo "$ENVIRONMENTS" | jq -r ".[] | select(.name == \"$env\") | .created_at")
            log_success "$env: 設定済み (作成: $CREATED) ✅"
        else
            log_warning "$env: 未設定 ⚠️"
        fi
    done
}

# ワークフロー統計の確認
audit_workflow_stats() {
    log_header "📈 ワークフロー統計監査"
    
    log_info "ワークフロー一覧を取得中..."
    WORKFLOWS=$(gh workflow list --json id,name,state,badge_url)
    
    echo "$WORKFLOWS" | jq . > workflows.json
    
    WORKFLOW_COUNT=$(echo "$WORKFLOWS" | jq length)
    ACTIVE_COUNT=$(echo "$WORKFLOWS" | jq '[.[] | select(.state == "active")] | length')
    
    echo "📊 ワークフロー統計:"
    echo "  • 総ワークフロー数: $WORKFLOW_COUNT"
    echo "  • アクティブ: $ACTIVE_COUNT"
    echo "  • 非アクティブ: $((WORKFLOW_COUNT - ACTIVE_COUNT))"
    
    echo ""
    echo "🎯 ワークフロー一覧:"
    echo "$WORKFLOWS" | jq -r '.[] | "  • \(.name): \(.state)"'
}

# 最近の実行履歴確認
audit_recent_runs() {
    log_header "⏱️ 最近の実行履歴監査"
    
    log_info "最近の実行履歴を取得中..."
    RUNS=$(gh run list --limit 10 --json workflowName,conclusion,status,createdAt)
    
    echo "$RUNS" | jq . > recent-runs.json
    
    RUN_COUNT=$(echo "$RUNS" | jq length)
    SUCCESS_COUNT=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "success")] | length')
    FAILURE_COUNT=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "failure")] | length')
    
    echo "📊 最近10回の実行統計:"
    echo "  • 成功: $SUCCESS_COUNT"
    echo "  • 失敗: $FAILURE_COUNT" 
    echo "  • その他: $((RUN_COUNT - SUCCESS_COUNT - FAILURE_COUNT))"
    
    if [ "$RUN_COUNT" -gt 0 ]; then
        SUCCESS_RATE=$(( (SUCCESS_COUNT * 100) / RUN_COUNT ))
        echo "  • 成功率: ${SUCCESS_RATE}%"
        
        if [ "$SUCCESS_RATE" -ge 90 ]; then
            log_success "成功率良好: ${SUCCESS_RATE}% ✅"
        elif [ "$SUCCESS_RATE" -ge 80 ]; then
            log_warning "成功率注意: ${SUCCESS_RATE}% ⚠️"
        else
            log_error "成功率低下: ${SUCCESS_RATE}% ❌"
        fi
    fi
}

# セキュリティ設定の確認
audit_security_settings() {
    log_header "🛡️ セキュリティ設定監査"
    
    log_info "セキュリティ設定を確認中..."
    
    # Dependabot設定の確認
    if [ -f ".github/dependabot.yml" ]; then
        log_success "Dependabot設定: ✅"
    else
        log_warning "Dependabot設定: 未設定 ⚠️"
    fi
    
    # セキュリティポリシーの確認
    if [ -f "SECURITY.md" ] || [ -f ".github/SECURITY.md" ]; then
        log_success "セキュリティポリシー: ✅"
    else
        log_warning "セキュリティポリシー: 未設定 ⚠️"
    fi
    
    # Issue テンプレートの確認
    if [ -d ".github/ISSUE_TEMPLATE" ]; then
        TEMPLATE_COUNT=$(find .github/ISSUE_TEMPLATE -name "*.md" -o -name "*.yml" | wc -l)
        log_success "Issueテンプレート: $TEMPLATE_COUNT 個設定済み ✅"
    else
        log_warning "Issueテンプレート: 未設定 ⚠️"
    fi
}

# レポート生成
generate_report() {
    log_header "📋 監査レポート生成"
    
    REPORT_FILE="github-actions-audit-report-$(date +%Y%m%d-%H%M%S).md"
    
    log_info "レポートを生成中: $REPORT_FILE"
    
    cat << EOF > "$REPORT_FILE"
# GitHub Actions設定監査レポート

**対象リポジトリ**: $GITHUB_REPOSITORY  
**監査実行日時**: $(date)  
**監査実行者**: $(whoami)  

## 📊 監査結果サマリー

### Actions権限設定
$(cat actions-permissions.json | jq -r 'to_entries | map("- \(.key): \(.value)") | .[]')

### ワークフロー権限設定  
$(cat workflow-permissions.json | jq -r 'to_entries | map("- \(.key): \(.value)") | .[]')

### リポジトリ変数 ($(cat repository-variables.json | jq length)個)
$(cat repository-variables.json | jq -r '.[] | "- \(.name): \(.value)"')

### シークレット ($(cat repository-secrets.json | jq length)個)
$(cat repository-secrets.json | jq -r '.[] | "- \(.name) (更新: \(.updatedAt))"')

### 環境設定 ($(cat repository-environments.json | jq length)個)
$(cat repository-environments.json | jq -r '.[] | "- \(.name) (作成: \(.created_at))"')

### ワークフロー統計
$(cat workflows.json | jq -r '.[] | "- \(.name): \(.state)"')

### 最近の実行統計
$(cat recent-runs.json | jq -r '.[] | "- \(.workflowName): \(.conclusion) (\(.createdAt))"')

## 🎯 推奨事項

1. **セキュリティ強化**
   - SHAピンニングの有効化
   - 最小権限の原則適用
   - 定期的なシークレットローテーション

2. **運用改善**
   - ワークフロー実行時間の最適化
   - 失敗率の改善
   - 監視・アラートの強化

3. **ドキュメント整備**
   - セキュリティポリシーの作成
   - 運用手順書の整備
   - インシデント対応手順の策定

## 📁 生成ファイル

- actions-permissions.json
- workflow-permissions.json  
- repository-variables.json
- repository-secrets.json
- repository-environments.json
- workflows.json
- recent-runs.json

---
*このレポートは GitHub Actions設定監査スクリプトにより自動生成されました*
EOF

    log_success "監査レポート生成完了: $REPORT_FILE"
}

# メイン処理
main() {
    log_header "🔍 GitHub Actions設定監査開始"
    
    # 事前確認
    get_repo_info
    check_gh_auth || exit 1
    
    # 監査実行
    audit_actions_permissions
    audit_workflow_permissions
    audit_repository_variables
    audit_secrets
    audit_environments
    audit_workflow_stats
    audit_recent_runs
    audit_security_settings
    
    # レポート生成
    generate_report
    
    log_header "✅ GitHub Actions設定監査完了"
    log_info "詳細は生成されたレポートファイルを確認してください"
}

# スクリプト実行
main "$@"