#!/bin/bash

# PMPLearningManagement ラベル作成スクリプト
# 実行日: 2025-08-16

REPO="yusuke-kurosawa/PMPLearningManagement"

echo "🏷️ PMPLearningManagement ラベル体系の再構築を開始します..."

# 種別ラベル（青系 #0366d6）
echo "📦 種別ラベルを作成中..."
gh label create "種別:機能追加" --repo $REPO --color "0366d6" --description "新機能の追加" --force
gh label create "種別:バグ修正" --repo $REPO --color "0366d6" --description "バグ・不具合の修正" --force
gh label create "種別:改善" --repo $REPO --color "0366d6" --description "既存機能の改善" --force
gh label create "種別:ドキュメント" --repo $REPO --color "0366d6" --description "ドキュメントの作成・更新" --force
gh label create "種別:リファクタリング" --repo $REPO --color "0366d6" --description "コードの改善・整理" --force
gh label create "種別:テスト" --repo $REPO --color "0366d6" --description "テストの追加・修正" --force
gh label create "種別:保守" --repo $REPO --color "0366d6" --description "メンテナンス作業" --force

# 優先度ラベル
echo "🎯 優先度ラベルを作成中..."
gh label create "優先度:緊急" --repo $REPO --color "d73a4a" --description "即座に対応が必要" --force
gh label create "優先度:高" --repo $REPO --color "ff6b6b" --description "優先的に対応" --force
gh label create "優先度:中" --repo $REPO --color "fbca04" --description "通常の優先度" --force
gh label create "優先度:低" --repo $REPO --color "0e8a16" --description "時間があるときに対応" --force

# 状態ラベル
echo "📊 状態ラベルを作成中..."
gh label create "状態:準備完了" --repo $REPO --color "0e8a16" --description "作業開始可能" --force
gh label create "状態:作業中" --repo $REPO --color "1d76db" --description "現在作業中" --force
gh label create "状態:レビュー待ち" --repo $REPO --color "fbca04" --description "レビュー待機中" --force
gh label create "状態:ブロック中" --repo $REPO --color "d73a4a" --description "他の要因でブロック" --force
gh label create "状態:調査中" --repo $REPO --color "d4c5f9" --description "調査・分析中" --force

# 領域ラベル（紫系 #6f42c1）
echo "🗂️ 領域ラベルを作成中..."
gh label create "領域:フロントエンド" --repo $REPO --color "6f42c1" --description "React/TypeScript関連" --force
gh label create "領域:バックエンド" --repo $REPO --color "6f42c1" --description "API/Database関連" --force
gh label create "領域:DevOps" --repo $REPO --color "6f42c1" --description "CI/CD・インフラ関連" --force
gh label create "領域:学習機能" --repo $REPO --color "6f42c1" --description "学習・教育機能関連" --force
gh label create "領域:モバイル" --repo $REPO --color "6f42c1" --description "モバイル対応・PWA関連" --force
gh label create "領域:パフォーマンス" --repo $REPO --color "6f42c1" --description "パフォーマンス最適化" --force
gh label create "領域:セキュリティ" --repo $REPO --color "6f42c1" --description "セキュリティ・認証関連" --force
gh label create "領域:UI/UX" --repo $REPO --color "6f42c1" --description "UI/UXデザイン関連" --force
gh label create "領域:視覚化" --repo $REPO --color "6f42c1" --description "データ視覚化・グラフ関連" --force

# 規模ラベル
echo "📏 規模ラベルを作成中..."
gh label create "規模:XS（1-2時間）" --repo $REPO --color "c5def5" --description "非常に小さいタスク" --force
gh label create "規模:S（半日）" --repo $REPO --color "bfd4f2" --description "小規模タスク" --force
gh label create "規模:M（1-2日）" --repo $REPO --color "9cb9d4" --description "中規模タスク" --force
gh label create "規模:L（1週間）" --repo $REPO --color "7b9fc1" --description "大規模タスク" --force
gh label create "規模:XL（複数週間）" --repo $REPO --color "5a84ae" --description "非常に大規模なタスク" --force

# 特殊ラベル
echo "✨ 特殊ラベルを作成中..."
gh label create "初心者向け" --repo $REPO --color "7057ff" --description "新規貢献者に適した課題" --force
gh label create "ヘルプ求む" --repo $REPO --color "008672" --description "外部からの支援が必要" --force
gh label create "破壊的変更" --repo $REPO --color "d93f0b" --description "既存機能への影響あり" --force
gh label create "エピック" --repo $REPO --color "5319e7" --description "複数のIssueを含む大きな機能" --force
gh label create "重複" --repo $REPO --color "cfd3d7" --description "他のIssueと重複" --force

# PM管理ラベル（PMBOK準拠）
echo "📚 PM管理ラベル（PMBOK準拠）を作成中..."
gh label create "PM:統合管理" --repo $REPO --color "FF6B6B" --description "プロジェクト全体の統合管理" --force
gh label create "PM:スコープ管理" --repo $REPO --color "4ECDC4" --description "機能要件・スコープ管理" --force
gh label create "PM:スケジュール管理" --repo $REPO --color "45B7D1" --description "開発スケジュール管理" --force
gh label create "PM:コスト管理" --repo $REPO --color "96CEB4" --description "リソース・コスト管理" --force
gh label create "PM:品質管理" --repo $REPO --color "FFEAA7" --description "品質保証・テスト管理" --force
gh label create "PM:資源管理" --repo $REPO --color "DDA0DD" --description "人的資源・チーム管理" --force
gh label create "PM:コミュニケーション" --repo $REPO --color "98D8C8" --description "情報共有・コミュニケーション" --force
gh label create "PM:リスク管理" --repo $REPO --color "FDA7DF" --description "リスク識別・対応管理" --force
gh label create "PM:調達管理" --repo $REPO --color "FFA500" --description "外部リソース・調達管理" --force
gh label create "PM:ステークホルダー" --repo $REPO --color "74B9FF" --description "ステークホルダー管理" --force

echo "✅ ラベル作成完了！"