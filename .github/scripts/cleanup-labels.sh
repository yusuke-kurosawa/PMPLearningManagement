#!/bin/bash

# PMPLearningManagement 不要ラベル削除スクリプト
# 実行日: 2025-08-16

REPO="yusuke-kurosawa/PMPLearningManagement"

echo "🗑️ 不要なラベルを削除します..."

# 削除対象ラベルリスト
labels_to_delete=(
    # 自動生成ラベル
    "automated"
    "claude-analyzed"
    "priority:null"
    "idd-compliance"
    "report"
    "healthy"
    "maintenance-report"
    "needs-triage"
    "metrics:weekly-report"
    
    # 古い英語ラベル（新しい日本語ラベルで置き換え済み）
    "type:bug"
    "type:enhancement"
    "type:feature"
    "type:docs"
    "type:refactor"
    "type:chore"
    "type:test"
    "type:report"
    
    "priority:critical"
    "priority:high"
    "priority:medium"
    "priority:low"
    "🚨 high-priority"
    
    "status:triage"
    "status:in-progress"
    "status:ready"
    "status:blocked"
    "status:review"
    
    "area:ui"
    "area:backend"
    "area:frontend"
    "area:learning"
    "area:mobile"
    "area:devops"
    "area:visualization"
    "area:performance"
    "area:security"
    
    "size:xs"
    "size:s"
    "size:m"
    "size:l"
    "size:xl"
    "estimate: XS"
    "estimate: S"
    "estimate: M"
    "estimate: L"
    "estimate: XL"
    
    "good-first-issue"
    "help-wanted"
    "question"
    "duplicate"
    "wontfix"
    "breaking-change"
    "epic"
    "security"
    
    # 絵文字付きの古いラベル（整理）
    "T:🐛 バグハンター"
    "T:✨ 新機能の魔法使い"
    "T:🚀 パフォーマンス・スピードスター"
    "T:🎨 デザインの芸術家"
    "T:📚 知識の伝道師"
    "T:🔧 リファクタリングの匠"
    "T:🔐 セキュリティの守護者"
    "T:🧪 テストの科学者"
    
    "L:⚡ 駆け出し冒険者"
    "L:🌟 初心者への贈り物"
    "L:🏆 エピック・クエスト"
    "L:👑 マスター級の伝説"
    "L:🔥 熟練者の挑戦"
    
    "A:🎯 統合管理"
    "A:📋 スコープ管理"
    "A:⏰ スケジュール管理"
    "A:🏅 品質管理"
    "A:💰 コスト管理"
    "A:👥 チームワーク"
    "A:📡 コミュニケーション"
    "A:⚠️ リスク管理"
    "A:🤝 調達管理"
    "A:🎭 ステークホルダー・エンゲージメント"
    
    "P:🔥 高優先度"
    "P:🚨 緊急出動"
    "P:⭐ 標準"
    "P:🌱 低優先度"
    "P:💡 アイデア"
    
    "TM:🌟 チーム・クエスト"
    "TM:🎓 メンター募集"
    "TM:🚀 新人歓迎"
    "TM:🎯 ペアプログラミング"
    "TM:💬 ディスカッション"
    "TM:📚 ナレッジシェア"
    "TM:🎨 デザインレビュー"
    
    "S:🔍 調査中"
    "S:⚡ 開発中"
    "S:✅ 準備完了"
    "S:⏸️ 一時停止"
    "S:👀 レビュー待ち"
    "S:🎯 テスト中"
    "S:🚫 ブロック中"
    
    "SP:🏅 コミュニティ・ヒーロー"
    "SP:⚠️ 破壊的変更"
    "SP:🎭 オールラウンダー"
    "SP:❌ 今回は見送り"
    "SP:🎯 MVP必須"
    "SP:🔄 重複問題"
    "SP:🚀 将来の夢"
    
    # コンポーネント系ラベル
    "component:linting"
    "component:devops"
)

# ラベル削除実行
deleted_count=0
for label in "${labels_to_delete[@]}"; do
    echo "  削除中: $label"
    if gh label delete "$label" --repo $REPO --yes 2>/dev/null; then
        ((deleted_count++))
    fi
done

echo ""
echo "✅ 削除完了！ $deleted_count 個のラベルを削除しました。"