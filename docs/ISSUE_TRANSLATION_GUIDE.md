# GitHub Issue 日本語翻訳ガイド

## 1. 用語集（Technical Terms Glossary）

### Issue種別
| English | Japanese | 絵文字 |
|---------|----------|--------|
| Bug | バグ | 🐛 |
| Feature | 機能 | ✨ |
| Enhancement | 機能強化 | ✨ |
| Documentation | ドキュメント | 📝 |
| Security | セキュリティ | 🔒 |
| Performance | パフォーマンス | ⚡ |
| Test | テスト | 🧪 |
| Infrastructure | インフラ | 🏗️ |
| UI/UX | UI/UX | 🎨 |
| Backend | バックエンド | ⚙️ |
| Mobile | モバイル | 📱 |
| AI/ML | AI/機械学習 | 🤖 |

### 優先度
| English | Japanese | 色 |
|---------|----------|-----|
| Critical | 緊急 | 🔴 |
| High | 高 | 🟠 |
| Medium | 中 | 🟡 |
| Low | 低 | 🟢 |

### 状態
| English | Japanese |
|---------|----------|
| Open | オープン |
| In Progress | 進行中 |
| Review | レビュー中 |
| Testing | テスト中 |
| Closed | クローズ |
| Blocked | ブロック中 |

### 技術用語
| English | Japanese |
|---------|----------|
| Authentication | 認証 |
| Authorization | 認可 |
| API | API |
| Database | データベース |
| Cache | キャッシュ |
| Deployment | デプロイメント |
| CI/CD | CI/CD |
| Pipeline | パイプライン |
| Repository | リポジトリ |
| Branch | ブランチ |
| Commit | コミット |
| Pull Request | プルリクエスト |
| Merge | マージ |
| Code Review | コードレビュー |
| Unit Test | 単体テスト |
| Integration Test | 統合テスト |
| E2E Test | E2Eテスト |
| Performance Test | パフォーマンステスト |
| Security Audit | セキュリティ監査 |
| Load Balancer | ロードバランサー |
| Container | コンテナ |
| Kubernetes | Kubernetes |
| Docker | Docker |
| Monitoring | モニタリング |
| Logging | ロギング |
| Metrics | メトリクス |
| Dashboard | ダッシュボード |
| Webhook | Webhook |
| WebSocket | WebSocket |
| REST API | REST API |
| GraphQL | GraphQL |
| TypeScript | TypeScript |
| React | React |
| Node.js | Node.js |
| Supabase | Supabase |
| PostgreSQL | PostgreSQL |
| Redis | Redis |
| Elasticsearch | Elasticsearch |
| PWA | PWA |
| Service Worker | Service Worker |
| Responsive Design | レスポンシブデザイン |
| Accessibility | アクセシビリティ |
| WCAG | WCAG |
| Dark Mode | ダークモード |
| Theme | テーマ |
| Component | コンポーネント |
| State Management | 状態管理 |
| Redux/Zustand | Redux/Zustand |
| Bundle Size | バンドルサイズ |
| Code Splitting | コード分割 |
| Lazy Loading | 遅延読み込み |
| Optimization | 最適化 |
| Refactoring | リファクタリング |
| Technical Debt | 技術的負債 |
| Migration | マイグレーション |
| Backup | バックアップ |
| Recovery | リカバリ |
| Rollback | ロールバック |
| Scaling | スケーリング |
| High Availability | 高可用性 |
| Disaster Recovery | 災害復旧 |
| SLA | SLA |
| KPI | KPI |
| Analytics | 分析 |
| Machine Learning | 機械学習 |
| AI | AI |
| NLP | 自然言語処理 |
| Recommendation Engine | レコメンデーションエンジン |
| Predictive Model | 予測モデル |
| Data Pipeline | データパイプライン |
| ETL | ETL |
| Data Warehouse | データウェアハウス |
| Business Intelligence | ビジネスインテリジェンス |

## 2. Issue Titleフォーマット

### 基本形式
```
[種別] 簡潔で分かりやすい日本語説明
```

### 例
- `[バグ修正] 本番環境での認証リダイレクトループの修正`
- `[機能追加] 二要素認証（2FA）の実装`
- `[パフォーマンス] 初期読み込み時間の最適化（1秒以下目標）`
- `[セキュリティ] 包括的な監査ログシステムの実装`
- `[UI/UX] ダークモードテーマの実装（システム設定連携）`

## 3. Issue本文の構成

### セクション見出し
| English | Japanese |
|---------|----------|
| Overview | 概要 |
| Description | 説明 |
| Problem | 問題 |
| Solution | 解決策 |
| Requirements | 要件 |
| Technical Specifications | 技術仕様 |
| Acceptance Criteria | 受け入れ基準 |
| Testing Requirements | テスト要件 |
| Security Requirements | セキュリティ要件 |
| Performance Requirements | パフォーマンス要件 |
| Dependencies | 依存関係 |
| Related Issues | 関連Issue |
| Steps to Reproduce | 再現手順 |
| Expected Behavior | 期待される動作 |
| Actual Behavior | 実際の動作 |
| Screenshots | スクリーンショット |
| Environment | 環境 |
| Additional Context | 追加情報 |
| Checklist | チェックリスト |
| User Story | ユーザーストーリー |
| Business Value | ビジネス価値 |
| Success Metrics | 成功指標 |
| Implementation Notes | 実装メモ |
| Deployment Considerations | デプロイ考慮事項 |
| Documentation | ドキュメント |
| Migration Plan | 移行計画 |
| Rollback Plan | ロールバック計画 |
| Monitoring Plan | モニタリング計画 |

## 4. ラベル日本語対応

### 種別ラベル
- `bug` → `🐛 バグ`
- `enhancement` → `✨ 機能強化`
- `feature` → `✨ 新機能`
- `documentation` → `📝 ドキュメント`
- `security` → `🔒 セキュリティ`
- `performance` → `⚡ パフォーマンス`
- `test` → `🧪 テスト`
- `refactoring` → `♻️ リファクタリング`
- `chore` → `🔧 雑務`
- `ci/cd` → `🚀 CI/CD`

### エリアラベル
- `area:ui` → `🎨 UI/UX`
- `area:backend` → `⚙️ バックエンド`
- `area:mobile` → `📱 モバイル`
- `area:database` → `🗄️ データベース`
- `area:api` → `🔌 API`
- `area:infrastructure` → `🏗️ インフラ`
- `area:learning` → `📚 学習機能`
- `area:ai` → `🤖 AI/ML`

### 優先度ラベル
- `priority:critical` → `🔴 緊急`
- `priority:high` → `🟠 優先度:高`
- `priority:medium` → `🟡 優先度:中`
- `priority:low` → `🟢 優先度:低`

### 状態ラベル
- `status:triage` → `🔍 トリアージ中`
- `status:in-progress` → `🏃 作業中`
- `status:review` → `👀 レビュー中`
- `status:testing` → `🧪 テスト中`
- `status:blocked` → `🚫 ブロック中`
- `status:ready` → `✅ 準備完了`

## 5. 翻訳のベストプラクティス

### Do's ✅
1. **技術用語は適切に使用**
   - 一般的な技術用語は英語のまま（API, CI/CD, Docker等）
   - 日本語として定着している用語は日本語を使用

2. **簡潔で明確な表現**
   - 冗長な表現を避ける
   - 主語を明確にする
   - 能動態を使用する

3. **一貫性の維持**
   - 同じ用語は同じ訳語を使用
   - フォーマットを統一
   - 敬語レベルを統一（です・ます調）

4. **コンテキストの保持**
   - 技術的な正確性を維持
   - エラーメッセージは英語併記
   - コードサンプルはそのまま

### Don'ts ❌
1. **直訳を避ける**
   - 英語の構文をそのまま日本語にしない
   - 自然な日本語表現を心がける

2. **過度な意訳を避ける**
   - 技術的な意味が変わらないように注意
   - 原文の意図を正確に伝える

3. **カタカナの乱用を避ける**
   - 必要以上にカタカナ語を使わない
   - 適切な日本語訳がある場合は使用する

## 6. チーム別担当Issue一覧

### Team A: Frontend/UI担当（2人）
- Issue #52: UI/UX改善とレイアウトコンポーネント強化
- Issue #49: パフォーマンス最適化とバンドルサイズ削減
- Issue #32: ダークモードテーマ実装
- Issue #34: 高度なユーザー設定とパーソナライゼーション
- Issue #29, #25: カスタマイズ可能な学習ダッシュボード
- Issue #30: インタラクティブチュートリアル付き強化オンボーディング
- Issue #31: 包括的なアクセシビリティ改善（WCAG 2.1 AA）

### Team B: Backend/API担当（2人）
- Issue #51: 監視・ヘルスチェック・メトリクス実装
- Issue #48: CI/CDパイプラインとインフラ自動化
- Issue #47: 包括的テストフレームワーク実装
- Issue #45: 認証・認可システムの完全実装
- Issue #40: APIバックエンド実装 - スケーラブルデータアーキテクチャ
- Issue #41: リアルタイム同期機能 - マルチデバイス体験
- Issue #24: データベースクエリ最適化とインデックス作成

### Team C: Infrastructure/DevOps担当（2人）
- Issue #48: CI/CDパイプラインとインフラ自動化
- Issue #39: 状態管理ライブラリ統合 - Zustand実装
- Issue #38: TypeScriptマイグレーション - 包括的な型安全性実装
- Issue #26: バックグラウンド同期付き完全オフラインモード
- Issue #27: ネイティブモバイルアプリ開発（iOS/Android）

### Team D: Quality/Testing担当（2人）
- Issue #47: 包括的テストフレームワーク実装
- Issue #21: 初期読み込み時間の最適化（1秒以下目標）
- Issue #22: 包括的な画像最適化パイプライン
- Issue #23: バンドルサイズの削減と最適化
- Issue #42: 高度なデータ視覚化スイート - インタラクティブ分析

### Team E: Security/Compliance担当（2人）
- Issue #50: セキュリティ強化とコンプライアンス実装
- Issue #11: 二要素認証（2FA）の実装
- Issue #12: 拡張データ暗号化の実装
- Issue #13: 包括的な監査ログシステム
- Issue #15: きめ細かいアクセス制御とRBAC強化

### Team F: AI/ML担当（2人）
- Issue #16: 機械学習による適応型学習パス生成
- Issue #17: パーソナライズされたコンテンツレコメンデーションエンジン
- Issue #18: インテリジェント弱点分析と改善システム
- Issue #19: 予測試験スコアモデリングと成功確率
- Issue #20: インテリジェント学習アシスタントチャットボット統合

### Team G: Mobile/PWA担当（2人）
- Issue #46: モバイル・PWA最適化とレスポンシブデザイン実装
- Issue #26: バックグラウンド同期付き完全オフラインモード
- Issue #27: ネイティブモバイルアプリ開発（iOS/Android）
- Issue #9: PWAオフラインサポートの実装

### Team H: Learning Features担当（2人）
- Issue #36: PMBOK第7版サポート - 原則ベースのフレームワーク
- Issue #37: 継続学習ダッシュボード - 認定後の価値追跡
- Issue #35: キャリアサービス統合 - ジョブマッチングと給与ツール
- Issue #43: ゲーミフィケーションシステム - 学習モチベーションとエンゲージメント
- Issue #44: 音声読み上げとオーディオ学習機能

### Team I: Performance担当（2人）
- Issue #21: 初期読み込み時間の最適化（1秒以下目標）
- Issue #22: 包括的な画像最適化パイプライン
- Issue #23: バンドルサイズの削減と最適化
- Issue #24: データベースクエリ最適化とインデックス作成
- Issue #49: パフォーマンス最適化とバンドルサイズ削減

### Team J: Internationalization担当（2人）
- Issue #28: 多言語サポートと国際化
- Issue #33: プリファレンス付きインテリジェント通知システム
- Closed Issues #1-10の日本語化

## 7. 品質チェックリスト

### 翻訳前
- [ ] 原文の完全な理解
- [ ] 技術的コンテキストの把握
- [ ] 関連Issueの確認

### 翻訳中
- [ ] 用語集の参照
- [ ] 一貫性の確保
- [ ] 自然な日本語表現

### 翻訳後
- [ ] 技術的正確性の確認
- [ ] 読みやすさの確認
- [ ] フォーマットの統一
- [ ] ピアレビューの実施

## 8. 自動化ワークフロー仕様

### 新規Issue自動日本語化
1. GitHub Actionsトリガー: Issue作成時
2. 翻訳APIを使用した自動翻訳
3. 用語集に基づく専門用語の置換
4. 日本語ラベルの自動付与
5. 翻訳レビュー用のコメント追加

### テンプレート管理
1. 英語版と日本語版のIssueテンプレート
2. 言語選択に応じた自動切り替え
3. カスタムフィールドの多言語対応

## 9. 納品物

1. **全Issue日本語化完了**
   - タイトルの日本語化
   - 本文の完全翻訳
   - ラベルの日本語対応

2. **ドキュメント**
   - 本翻訳ガイド
   - 用語集（継続的更新）
   - スタイルガイド

3. **自動化ツール**
   - GitHub Actions ワークフロー
   - 翻訳スクリプト
   - 品質チェックツール

4. **テンプレート**
   - 日本語Issueテンプレート（バグ報告）
   - 日本語Issueテンプレート（機能要望）
   - 日本語Issueテンプレート（セキュリティ）

## 10. 継続的改善

- 月次での用語集レビュー
- 四半期での翻訳品質評価
- ユーザーフィードバックの収集
- 自動化ワークフローの最適化