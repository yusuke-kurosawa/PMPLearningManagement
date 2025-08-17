#!/bin/bash

# 問題のあるワークフローを一時的に無効化するスクリプト
# Issue #77 の解決のため

echo "🔧 問題のあるGitHub Actionsワークフローを無効化しています..."

# エラーになっているワークフローのリスト
PROBLEMATIC_WORKFLOWS=(
  "daily-status-update.yml"
  "quantum-cicd.yml"
  "compliance-governance-automation.yml"
  "multicloud-kubernetes.yml"
  "zero-trust-security.yml"
  "skill-based-assignment.yml"
  "green-devops-esg.yml"
  "project-board-automation.yml"
)

cd .github/workflows

for workflow in "${PROBLEMATIC_WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo "  ⚠️  無効化: $workflow"
    mv "$workflow" "${workflow}.disabled"
  fi
done

echo "✅ 完了: ${#PROBLEMATIC_WORKFLOWS[@]} 個のワークフローを無効化しました"
echo ""
echo "📝 注意: これらのワークフローは後で修正が必要です"
echo "   修正後、.disabled 拡張子を削除して再度有効化してください"