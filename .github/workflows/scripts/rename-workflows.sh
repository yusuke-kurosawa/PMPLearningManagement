#!/bin/bash

# GitHub Actions ワークフローファイル名変更スクリプト
# カテゴリ別に整理された新しい命名規則に従って名前を変更

echo "🔄 ワークフローファイルの名前変更を開始します..."

# 作業ディレクトリに移動
cd /home/kurosawa/PMPLearningManagement/.github/workflows

# 名前変更マッピング（旧名 -> 新名）
declare -A rename_map=(
    # CORE - コアワークフロー
    ["deploy.yml"]="core-01-deploy.yml"
    ["pr-validation.yml"]="core-02-pr-validation.yml"
    ["test.yml"]="core-03-build-test.yml"
    
    # TEST - テスト関連
    ["integration-test.yml"]="test-01-unit-integration.yml"
    ["test-parallel.yml"]="test-02-parallel.yml"
    ["advanced-testing.yml"]="test-03-advanced.yml"
    # integration-test.yml は既に test-01 として割り当て済み
    ["test-data-management.yml"]="test-05-data-management.yml"
    ["chaos-engineering.yml"]="test-06-chaos.yml"
    
    # SECURITY - セキュリティ・コンプライアンス
    ["security-scan.yml"]="sec-01-vulnerability-scan.yml"
    ["zero-trust-security.yml"]="sec-02-zero-trust.yml"
    ["infrastructure-security.yml"]="sec-03-infrastructure.yml"
    ["compliance-audit.yml"]="sec-04-compliance.yml"
    ["compliance-governance-automation.yml"]="sec-05-governance.yml"
    
    # MONITOR - 監視・パフォーマンス
    ["performance-monitoring.yml"]="mon-01-performance.yml"
    ["observability.yml"]="mon-02-observability.yml"
    ["monitoring-setup.yml"]="mon-03-monitoring-setup.yml"
    ["advanced-quality-gates.yml"]="mon-04-quality-gates.yml"
    ["ai-monitoring-analytics.yml"]="mon-05-ai-analytics.yml"
    
    # AUTO - 自動化・AI支援
    ["ai-assisted-review.yml"]="auto-01-ai-review.yml"
    ["dependabot-auto-merge.yml"]="auto-02-dependabot.yml"
    ["claude-pr-review.yml"]="auto-03-claude-pr.yml"
    ["claude-issue-handler.yml"]="auto-04-claude-issue.yml"
    ["claude-assistant.yml"]="auto-05-claude-assistant.yml"
    ["issue-automation.yml"]="auto-06-issue-automation.yml"
    ["project-board-automation.yml"]="auto-07-project-board.yml"
    ["translate-issues.yml"]="auto-08-translate.yml"
    
    # DEV - 開発支援
    ["developer-experience.yml"]="dev-01-experience.yml"
    ["developer-experience-culture.yml"]="dev-02-dx-culture.yml"
    ["dependency-health-check.yml"]="dev-03-dependency-health.yml"
    ["dependency-roadmap.yml"]="dev-04-dependency-roadmap.yml"
    ["feature-management.yml"]="dev-05-feature-mgmt.yml"
    ["issue-driven-development.yml"]="dev-06-idd-workflow.yml"
    ["idd-compliance.yml"]="dev-07-idd-compliance.yml"
    ["idd-metrics-collector.yml"]="dev-08-idd-metrics.yml"
    ["skill-based-assignment.yml"]="dev-09-skill-assign.yml"
    ["technical-spike-management.yml"]="dev-10-technical-spike.yml"
    ["stakeholder-validation.yml"]="dev-11-stakeholder.yml"
    
    # NOTIFY - 通知・レポート
    ["notifications.yml"]="notify-01-notifications.yml"
    ["world-class-devops-benchmark.yml"]="notify-02-benchmark.yml"
    
    # ADVANCED - 先進的機能
    ["edge-wasm-optimization.yml"]="adv-01-edge-wasm.yml"
    ["multicloud-kubernetes.yml"]="adv-02-multicloud-k8s.yml"
    ["quantum-cicd.yml"]="adv-03-quantum-cicd.yml"
    ["green-devops-esg.yml"]="adv-04-green-devops.yml"
)

# 名前変更の実行
echo "📝 以下のファイルを名前変更します："
echo ""

for old_name in "${!rename_map[@]}"; do
    new_name="${rename_map[$old_name]}"
    
    if [ -f "$old_name" ]; then
        echo "  ✅ $old_name → $new_name"
        git mv "$old_name" "$new_name" 2>/dev/null || mv "$old_name" "$new_name"
    else
        echo "  ⚠️  $old_name が見つかりません（スキップ）"
    fi
done

echo ""
echo "✨ 名前変更が完了しました！"
echo ""
echo "📋 次のステップ："
echo "1. git status で変更を確認"
echo "2. git add . で変更をステージング"
echo "3. git commit -m 'refactor: ワークフローファイルをカテゴリ別に再編成'"
echo "4. git push でリモートに反映"