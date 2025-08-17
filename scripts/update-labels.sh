#!/bin/bash

# GitHub ラベル更新スクリプト
# 古いラベル体系から新しいプレフィックス付きラベル体系への移行

REPO="yusuke-kurosawa/PMPLearningManagement"

echo "🔄 GitHubラベル更新スクリプト開始..."

# 1. priority:medium を P:⭐ 標準 に更新
echo "📝 priority:medium -> P:⭐ 標準 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "priority:medium" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "priority:medium" --add-label "P:⭐ 標準"
  sleep 0.5
done

# 2. status:ready を S:✅ 準備完了 に更新
echo "📝 status:ready -> S:✅ 準備完了 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "status:ready" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "status:ready" --add-label "S:✅ 準備完了"
  sleep 0.5
done

# 3. size:m を L:⚡ 駆け出し冒険者 に更新
echo "📝 size:m -> L:⚡ 駆け出し冒険者 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "size:m" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "size:m" --add-label "L:⚡ 駆け出し冒険者"
  sleep 0.5
done

# 4. type:feature を T:✨ 新機能の魔法使い に更新
echo "📝 type:feature -> T:✨ 新機能の魔法使い の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "type:feature" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "type:feature" --add-label "T:✨ 新機能の魔法使い"
  sleep 0.5
done

# 5. area:learning を A:📋 スコープ管理 に更新
echo "📝 area:learning -> A:📋 スコープ管理 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "area:learning" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "area:learning" --add-label "A:📋 スコープ管理"
  sleep 0.5
done

# 6. size:xl を L:🏆 エピック・クエスト に更新
echo "📝 size:xl -> L:🏆 エピック・クエスト の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "size:xl" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "size:xl" --add-label "L:🏆 エピック・クエスト"
  sleep 0.5
done

# 7. area:ui を A:📡 コミュニケーション に更新
echo "📝 area:ui -> A:📡 コミュニケーション の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "area:ui" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "area:ui" --add-label "A:📡 コミュニケーション"
  sleep 0.5
done

# 8. area:security を A:⚠️ リスク管理 に更新
echo "📝 area:security -> A:⚠️ リスク管理 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "area:security" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "area:security" --add-label "A:⚠️ リスク管理"
  sleep 0.5
done

# 9. type:test を T:🧪 テストの科学者 に更新
echo "📝 type:test -> T:🧪 テストの科学者 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "type:test" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "type:test" --add-label "T:🧪 テストの科学者"
  sleep 0.5
done

# 10. status:triage を S:🔍 調査中 に更新
echo "📝 status:triage -> S:🔍 調査中 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "status:triage" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "status:triage" --add-label "S:🔍 調査中"
  sleep 0.5
done

# 11. area:performance を A:🏅 品質管理 に更新
echo "📝 area:performance -> A:🏅 品質管理 の更新中..."
gh issue list --repo $REPO --limit 100 --state all --label "area:performance" --json number | \
jq -r '.[].number' | while read issue_num; do
  echo "  Issue #$issue_num を更新中..."
  gh issue edit $issue_num --repo $REPO --remove-label "area:performance" --add-label "A:🏅 品質管理"
  sleep 0.5
done

# 12. その他の小さな変更
echo "📝 その他のラベル更新中..."

# area:mobile -> A:⚠️ リスク管理
gh issue list --repo $REPO --limit 100 --state all --label "area:mobile" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "area:mobile" --add-label "A:⚠️ リスク管理"
  sleep 0.5
done

# area:backend -> A:🎯 統合管理
gh issue list --repo $REPO --limit 100 --state all --label "area:backend" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "area:backend" --add-label "A:🎯 統合管理"
  sleep 0.5
done

# size:l -> L:🔥 熟練者の挑戦
gh issue list --repo $REPO --limit 100 --state all --label "size:l" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "size:l" --add-label "L:🔥 熟練者の挑戦"
  sleep 0.5
done

# priority:low -> P:🌱 低優先度
gh issue list --repo $REPO --limit 100 --state all --label "priority:low" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "priority:low" --add-label "P:🌱 低優先度"
  sleep 0.5
done

# area:visualization -> A:📡 コミュニケーション
gh issue list --repo $REPO --limit 100 --state all --label "area:visualization" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "area:visualization" --add-label "A:📡 コミュニケーション"
  sleep 0.5
done

# area:frontend -> A:📡 コミュニケーション
gh issue list --repo $REPO --limit 100 --state all --label "area:frontend" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "area:frontend" --add-label "A:📡 コミュニケーション"
  sleep 0.5
done

# area:devops -> A:🎯 統合管理
gh issue list --repo $REPO --limit 100 --state all --label "area:devops" --json number | \
jq -r '.[].number' | while read issue_num; do
  gh issue edit $issue_num --repo $REPO --remove-label "area:devops" --add-label "A:🎯 統合管理"
  sleep 0.5
done

echo "✅ GitHubラベル更新完了！"
echo "📊 更新完了後の確認を実行中..."

# 更新後の状況確認
gh issue list --repo $REPO --limit 100 --state all --json labels | jq -r '.[].labels[]?.name' | sort | uniq -c | sort -nr