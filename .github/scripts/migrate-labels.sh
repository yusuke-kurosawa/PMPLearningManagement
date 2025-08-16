#!/bin/bash

# PMPLearningManagement ラベル移行スクリプト
# 実行日: 2025-08-16

REPO="yusuke-kurosawa/PMPLearningManagement"

echo "🔄 既存Issueのラベル付け替えを開始します..."

# マッピングルール関数
migrate_issue_labels() {
    local issue_number=$1
    local labels_to_remove=""
    local labels_to_add=""
    
    # 現在のラベルを取得
    current_labels=$(gh issue view $issue_number --repo $REPO --json labels --jq '.labels[].name' | tr '\n' ' ')
    
    echo "Issue #$issue_number のラベルを確認中..."
    
    # 種別マッピング
    if [[ $current_labels == *"type:bug"* ]]; then
        labels_to_remove="$labels_to_remove type:bug"
        labels_to_add="$labels_to_add 種別:バグ修正"
    fi
    if [[ $current_labels == *"type:enhancement"* ]]; then
        labels_to_remove="$labels_to_remove type:enhancement"
        labels_to_add="$labels_to_add 種別:改善"
    fi
    if [[ $current_labels == *"type:feature"* ]]; then
        labels_to_remove="$labels_to_remove type:feature"
        labels_to_add="$labels_to_add 種別:機能追加"
    fi
    if [[ $current_labels == *"type:docs"* ]]; then
        labels_to_remove="$labels_to_remove type:docs"
        labels_to_add="$labels_to_add 種別:ドキュメント"
    fi
    if [[ $current_labels == *"type:refactor"* ]]; then
        labels_to_remove="$labels_to_remove type:refactor"
        labels_to_add="$labels_to_add 種別:リファクタリング"
    fi
    if [[ $current_labels == *"type:test"* ]]; then
        labels_to_remove="$labels_to_remove type:test"
        labels_to_add="$labels_to_add 種別:テスト"
    fi
    if [[ $current_labels == *"type:chore"* ]]; then
        labels_to_remove="$labels_to_remove type:chore"
        labels_to_add="$labels_to_add 種別:保守"
    fi
    if [[ $current_labels == *"type:report"* ]]; then
        labels_to_remove="$labels_to_remove type:report"
        labels_to_add="$labels_to_add 種別:ドキュメント"
    fi
    
    # 優先度マッピング
    if [[ $current_labels == *"priority:critical"* ]] || [[ $current_labels == *"🚨 high-priority"* ]]; then
        labels_to_remove="$labels_to_remove priority:critical 🚨 high-priority"
        labels_to_add="$labels_to_add 優先度:緊急"
    elif [[ $current_labels == *"priority:high"* ]] || [[ $current_labels == *"P:🔥 高優先度"* ]]; then
        labels_to_remove="$labels_to_remove priority:high P:🔥 高優先度"
        labels_to_add="$labels_to_add 優先度:高"
    elif [[ $current_labels == *"priority:medium"* ]] || [[ $current_labels == *"P:⭐ 標準"* ]]; then
        labels_to_remove="$labels_to_remove priority:medium P:⭐ 標準"
        labels_to_add="$labels_to_add 優先度:中"
    elif [[ $current_labels == *"priority:low"* ]] || [[ $current_labels == *"P:🌱 低優先度"* ]]; then
        labels_to_remove="$labels_to_remove priority:low P:🌱 低優先度"
        labels_to_add="$labels_to_add 優先度:低"
    fi
    
    # 状態マッピング
    if [[ $current_labels == *"status:ready"* ]] || [[ $current_labels == *"S:✅ 準備完了"* ]]; then
        labels_to_remove="$labels_to_remove status:ready S:✅ 準備完了"
        labels_to_add="$labels_to_add 状態:準備完了"
    fi
    if [[ $current_labels == *"status:in-progress"* ]] || [[ $current_labels == *"S:⚡ 開発中"* ]]; then
        labels_to_remove="$labels_to_remove status:in-progress S:⚡ 開発中"
        labels_to_add="$labels_to_add 状態:作業中"
    fi
    if [[ $current_labels == *"status:review"* ]] || [[ $current_labels == *"S:👀 レビュー待ち"* ]]; then
        labels_to_remove="$labels_to_remove status:review S:👀 レビュー待ち"
        labels_to_add="$labels_to_add 状態:レビュー待ち"
    fi
    if [[ $current_labels == *"status:blocked"* ]] || [[ $current_labels == *"S:🚫 ブロック中"* ]]; then
        labels_to_remove="$labels_to_remove status:blocked S:🚫 ブロック中"
        labels_to_add="$labels_to_add 状態:ブロック中"
    fi
    if [[ $current_labels == *"status:triage"* ]] || [[ $current_labels == *"S:🔍 調査中"* ]] || [[ $current_labels == *"needs-triage"* ]]; then
        labels_to_remove="$labels_to_remove status:triage S:🔍 調査中 needs-triage"
        labels_to_add="$labels_to_add 状態:調査中"
    fi
    
    # 領域マッピング
    if [[ $current_labels == *"area:frontend"* ]] || [[ $current_labels == *"A:🎯 統合管理"* ]]; then
        labels_to_remove="$labels_to_remove area:frontend A:🎯 統合管理"
        labels_to_add="$labels_to_add 領域:フロントエンド"
    fi
    if [[ $current_labels == *"area:backend"* ]]; then
        labels_to_remove="$labels_to_remove area:backend"
        labels_to_add="$labels_to_add 領域:バックエンド"
    fi
    if [[ $current_labels == *"area:devops"* ]] || [[ $current_labels == *"component:devops"* ]]; then
        labels_to_remove="$labels_to_remove area:devops component:devops"
        labels_to_add="$labels_to_add 領域:DevOps"
    fi
    if [[ $current_labels == *"area:learning"* ]] || [[ $current_labels == *"A:📋 スコープ管理"* ]]; then
        labels_to_remove="$labels_to_remove area:learning A:📋 スコープ管理"
        labels_to_add="$labels_to_add 領域:学習機能"
    fi
    if [[ $current_labels == *"area:mobile"* ]]; then
        labels_to_remove="$labels_to_remove area:mobile"
        labels_to_add="$labels_to_add 領域:モバイル"
    fi
    if [[ $current_labels == *"area:performance"* ]] || [[ $current_labels == *"A:💰 コスト管理"* ]]; then
        labels_to_remove="$labels_to_remove area:performance A:💰 コスト管理"
        labels_to_add="$labels_to_add 領域:パフォーマンス"
    fi
    if [[ $current_labels == *"area:security"* ]] || [[ $current_labels == *"security"* ]] || [[ $current_labels == *"A:⚠️ リスク管理"* ]]; then
        labels_to_remove="$labels_to_remove area:security security A:⚠️ リスク管理"
        labels_to_add="$labels_to_add 領域:セキュリティ"
    fi
    if [[ $current_labels == *"area:ui"* ]] || [[ $current_labels == *"A:📡 コミュニケーション"* ]]; then
        labels_to_remove="$labels_to_remove area:ui A:📡 コミュニケーション"
        labels_to_add="$labels_to_add 領域:UI/UX"
    fi
    if [[ $current_labels == *"area:visualization"* ]]; then
        labels_to_remove="$labels_to_remove area:visualization"
        labels_to_add="$labels_to_add 領域:視覚化"
    fi
    if [[ $current_labels == *"component:linting"* ]]; then
        labels_to_remove="$labels_to_remove component:linting"
        labels_to_add="$labels_to_add 領域:DevOps"
    fi
    
    # 規模マッピング
    if [[ $current_labels == *"size:xs"* ]] || [[ $current_labels == *"estimate: XS"* ]] || [[ $current_labels == *"L:🌟 初心者への贈り物"* ]]; then
        labels_to_remove="$labels_to_remove size:xs estimate: XS L:🌟 初心者への贈り物"
        labels_to_add="$labels_to_add 規模:XS（1-2時間）"
    fi
    if [[ $current_labels == *"size:s"* ]] || [[ $current_labels == *"estimate: S"* ]] || [[ $current_labels == *"L:⚡ 駆け出し冒険者"* ]]; then
        labels_to_remove="$labels_to_remove size:s estimate: S L:⚡ 駆け出し冒険者"
        labels_to_add="$labels_to_add 規模:S（半日）"
    fi
    if [[ $current_labels == *"size:m"* ]] || [[ $current_labels == *"estimate: M"* ]] || [[ $current_labels == *"L:🔥 熟練者の挑戦"* ]]; then
        labels_to_remove="$labels_to_remove size:m estimate: M L:🔥 熟練者の挑戦"
        labels_to_add="$labels_to_add 規模:M（1-2日）"
    fi
    if [[ $current_labels == *"size:l"* ]] || [[ $current_labels == *"estimate: L"* ]] || [[ $current_labels == *"L:👑 マスター級の伝説"* ]]; then
        labels_to_remove="$labels_to_remove size:l estimate: L L:👑 マスター級の伝説"
        labels_to_add="$labels_to_add 規模:L（1週間）"
    fi
    if [[ $current_labels == *"size:xl"* ]] || [[ $current_labels == *"estimate: XL"* ]] || [[ $current_labels == *"L:🏆 エピック・クエスト"* ]]; then
        labels_to_remove="$labels_to_remove size:xl estimate: XL L:🏆 エピック・クエスト"
        labels_to_add="$labels_to_add 規模:XL（複数週間）"
    fi
    
    # 特殊ラベルマッピング
    if [[ $current_labels == *"good-first-issue"* ]] || [[ $current_labels == *"TM:🚀 新人歓迎"* ]]; then
        labels_to_remove="$labels_to_remove good-first-issue TM:🚀 新人歓迎"
        labels_to_add="$labels_to_add 初心者向け"
    fi
    if [[ $current_labels == *"help-wanted"* ]] || [[ $current_labels == *"TM:🎓 メンター募集"* ]]; then
        labels_to_remove="$labels_to_remove help-wanted TM:🎓 メンター募集"
        labels_to_add="$labels_to_add ヘルプ求む"
    fi
    if [[ $current_labels == *"breaking-change"* ]] || [[ $current_labels == *"SP:⚠️ 破壊的変更"* ]]; then
        labels_to_remove="$labels_to_remove breaking-change SP:⚠️ 破壊的変更"
        labels_to_add="$labels_to_add 破壊的変更"
    fi
    if [[ $current_labels == *"epic"* ]] || [[ $current_labels == *"SP:🎭 オールラウンダー"* ]]; then
        labels_to_remove="$labels_to_remove epic SP:🎭 オールラウンダー"
        labels_to_add="$labels_to_add エピック"
    fi
    if [[ $current_labels == *"duplicate"* ]] || [[ $current_labels == *"SP:🔄 重複問題"* ]]; then
        labels_to_remove="$labels_to_remove duplicate SP:🔄 重複問題"
        labels_to_add="$labels_to_add 重複"
    fi
    
    # PM管理ラベル（既存のA:タグから移行）
    if [[ $current_labels == *"A:🏅 品質管理"* ]]; then
        labels_to_remove="$labels_to_remove A:🏅 品質管理"
        labels_to_add="$labels_to_add PM:品質管理"
    fi
    if [[ $current_labels == *"A:⏰ スケジュール管理"* ]]; then
        labels_to_remove="$labels_to_remove A:⏰ スケジュール管理"
        labels_to_add="$labels_to_add PM:スケジュール管理"
    fi
    if [[ $current_labels == *"A:👥 チームワーク"* ]]; then
        labels_to_remove="$labels_to_remove A:👥 チームワーク"
        labels_to_add="$labels_to_add PM:資源管理"
    fi
    if [[ $current_labels == *"A:🤝 調達管理"* ]]; then
        labels_to_remove="$labels_to_remove A:🤝 調達管理"
        labels_to_add="$labels_to_add PM:調達管理"
    fi
    if [[ $current_labels == *"A:🎭 ステークホルダー・エンゲージメント"* ]]; then
        labels_to_remove="$labels_to_remove A:🎭 ステークホルダー・エンゲージメント"
        labels_to_add="$labels_to_add PM:ステークホルダー"
    fi
    
    # 不要ラベルの削除のみ
    if [[ $current_labels == *"automated"* ]] || [[ $current_labels == *"claude-analyzed"* ]] || [[ $current_labels == *"priority:null"* ]] || [[ $current_labels == *"idd-compliance"* ]] || [[ $current_labels == *"report"* ]] || [[ $current_labels == *"healthy"* ]] || [[ $current_labels == *"maintenance-report"* ]] || [[ $current_labels == *"metrics:weekly-report"* ]]; then
        labels_to_remove="$labels_to_remove automated claude-analyzed priority:null idd-compliance report healthy maintenance-report metrics:weekly-report"
    fi
    
    # ラベルを更新
    if [ ! -z "$labels_to_remove" ]; then
        for label in $labels_to_remove; do
            gh issue edit $issue_number --repo $REPO --remove-label "$label" 2>/dev/null
        done
    fi
    
    if [ ! -z "$labels_to_add" ]; then
        for label in $labels_to_add; do
            gh issue edit $issue_number --repo $REPO --add-label "$label" 2>/dev/null
        done
    fi
    
    if [ ! -z "$labels_to_remove" ] || [ ! -z "$labels_to_add" ]; then
        echo "  ✅ Issue #$issue_number のラベルを更新しました"
    else
        echo "  ⏩ Issue #$issue_number は更新不要です"
    fi
}

# すべてのIssueを取得して処理
echo "📋 全Issueのラベルを移行中..."
issue_numbers=$(gh issue list --repo $REPO --limit 100 --state all --json number --jq '.[].number')

for issue in $issue_numbers; do
    migrate_issue_labels $issue
    sleep 0.5  # APIレート制限対策
done

echo "✅ ラベル移行完了！"