# 🚀 Operations - 統合運用管理ディレクトリ

## 概要

このディレクトリは、DevOpsと自動化機能を統合した運用管理の中央ハブです。CI/CD、監視、デプロイメント、インフラストラクチャ、および開発自動化のすべてを一元管理します。

## 📁 ディレクトリ構造

```
operations/
├── ci-cd/                    # CI/CDパイプライン管理
│   ├── github-actions/       # GitHub Actions設定
│   │   ├── workflows/        # ワークフロー定義
│   │   ├── composite/        # コンポジットアクション
│   │   └── templates/        # 再利用可能テンプレート
│   ├── scripts/              # ビルド・デプロイスクリプト
│   └── pipelines/            # パイプライン定義
│
├── automation/               # 開発自動化
│   ├── hooks/                # Git Hooks
│   │   ├── pre-commit        # コミット前チェック
│   │   ├── commit-msg        # メッセージ検証
│   │   └── pre-push          # プッシュ前チェック
│   ├── scripts/              # 自動化スクリプト
│   │   ├── daily/            # 日次タスク
│   │   ├── weekly/           # 週次タスク
│   │   └── adhoc/            # 随時実行タスク
│   └── cron/                 # 定期実行設定
│
├── monitoring/               # 監視・可観測性
│   ├── alerts/               # アラート定義
│   ├── dashboards/           # ダッシュボード設定
│   ├── metrics/              # メトリクス定義
│   └── logs/                 # ログ管理
│
├── deployment/               # デプロイメント管理
│   ├── environments/         # 環境別設定
│   ├── configurations/      # アプリケーション設定
│   └── secrets/              # シークレット管理（暗号化）
│
└── infrastructure/           # インフラストラクチャ
    ├── terraform/            # IaC定義
    ├── docker/               # コンテナ設定
    └── kubernetes/           # K8s マニフェスト
```

## 🎯 主要機能

### 1. CI/CDパイプライン管理

#### GitHub Actions ワークフロー
- **コアワークフロー**: メインCI/CDパイプライン
- **セキュリティスキャン**: 脆弱性検査と監査
- **デプロイメント**: 本番・ステージング環境へのデプロイ

#### 自動化スクリプト
```bash
# ビルド実行
./operations/ci-cd/scripts/build.sh

# テスト実行
./operations/ci-cd/scripts/test.sh

# デプロイ実行
./operations/ci-cd/scripts/deploy.sh
```

### 2. 開発自動化

#### Git Hooks
- **pre-commit**: ESLint、Prettier、TypeScript型チェック、軽量テスト
- **commit-msg**: IDD準拠チェック、Issue番号検証
- **pre-push**: 包括的テスト、ビルド確認、セキュリティスキャン

#### 自動化タスク
```bash
# 日次タスク（クリーンアップ、バックアップ）
npm run ops:automation:daily

# 週次タスク（依存関係更新、レポート生成）
npm run ops:automation:weekly

# カスタムスクリプト実行
npm run ops:automation:run -- scripts/custom.sh
```

### 3. 監視とアラート

#### メトリクス収集
- アプリケーションメトリクス
- インフラストラクチャメトリクス
- ビジネスメトリクス
- パフォーマンス指標

#### アラート設定
```yaml
# alerts/critical.yml
- name: "High Error Rate"
  condition: error_rate > 5%
  duration: 5m
  severity: critical
  
- name: "Low Availability"
  condition: availability < 99.9%
  duration: 1m
  severity: critical
```

### 4. デプロイメント戦略

#### 環境
- **development**: 開発環境
- **staging**: ステージング環境
- **production**: 本番環境

#### デプロイ方式
- Blue-Green デプロイメント
- カナリアリリース
- ローリングアップデート
- フィーチャーフラグ管理

### 5. インフラストラクチャ管理

#### Infrastructure as Code
- Terraform による環境構築
- Docker コンテナ化
- Kubernetes オーケストレーション
- 自動スケーリング設定

## 📊 運用コマンド

### 日常運用
```bash
# システムヘルスチェック
npm run ops:health:check

# メトリクス確認
npm run ops:metrics:view

# ログ確認
npm run ops:logs:tail

# ダッシュボード起動
npm run ops:dashboard
```

### デプロイメント
```bash
# ステージングデプロイ
npm run ops:deploy:staging

# 本番デプロイ（承認必要）
npm run ops:deploy:production

# ロールバック
npm run ops:rollback:production

# デプロイ状況確認
npm run ops:deploy:status
```

### 自動化管理
```bash
# Git Hooks インストール
npm run ops:hooks:install

# 自動化スクリプト実行
npm run ops:automation:run

# ワークフロー検証
npm run ops:workflow:validate

# 自動化統計
npm run ops:automation:stats
```

### トラブルシューティング
```bash
# システム診断
npm run ops:diagnose:system

# パフォーマンス分析
npm run ops:analyze:performance

# インシデント対応
npm run ops:incident:response

# デバッグモード
DEBUG=* npm run ops:debug
```

## 📈 メトリクスと成熟度

### DevOps成熟度
- **現在のレベル**: 3-4
  - ✅ 自動化されたCI/CD
  - ✅ インフラストラクチャのコード化
  - ✅ 包括的な監視
  - 🟡 予測的な運用（部分的）
  - 🔴 完全な自己修復（未実装）

### 自動化率
- **現在**: 85%
- **目標**: 95%

### パフォーマンス指標
- **デプロイ頻度**: 日次
- **リードタイム**: < 2時間
- **MTTR**: < 30分
- **変更失敗率**: < 5%

## 🔒 セキュリティ

### シークレット管理
- GitHub Secrets 使用
- 環境変数での管理
- 暗号化された設定ファイル
- HashiCorp Vault 統合（計画中）

### アクセス制御
- RBAC実装
- 最小権限の原則
- 監査ログ
- 定期的な権限レビュー

### セキュリティスキャン
- 依存関係の脆弱性チェック
- コンテナイメージスキャン
- SAST/DAST実装
- シークレットスキャン

## 🚀 ベストプラクティス

### ✅ 推奨事項
1. **自動化優先**: 手動作業を最小限に
2. **コードとしての管理**: すべての設定をコード化
3. **監視の充実**: プロアクティブな問題検出
4. **ドキュメントの維持**: 常に最新の状態を保つ
5. **継続的改善**: メトリクスに基づく最適化

### ❌ 避けるべきこと
1. **手動デプロイメント**: 必ず自動化パイプラインを使用
2. **ハードコードされた設定**: 環境変数を使用
3. **監視の欠如**: すべての重要機能を監視
4. **ドキュメントなしの変更**: 必ず記録を残す
5. **セキュリティの軽視**: セキュリティファーストの原則

## 📚 リファレンス

### 内部ドキュメント
- [CI/CDガイドライン](./ci-cd/README.md)
- [自動化ガイド](./automation/README.md)
- [監視設定](./monitoring/README.md)
- [デプロイメントガイド](./deployment/README.md)
- [インフラガイド](./infrastructure/README.md)

### 外部リソース
- [GitHub Actions ドキュメント](https://docs.github.com/actions)
- [Terraform ドキュメント](https://www.terraform.io/docs)
- [Kubernetes ドキュメント](https://kubernetes.io/docs)
- [Docker ドキュメント](https://docs.docker.com)

## 🔄 改善計画

### 短期（1-3ヶ月）
- [ ] 監視ダッシュボードの強化
- [ ] アラート最適化
- [ ] ドキュメント自動生成

### 中期（3-6ヶ月）
- [ ] 自動スケーリング実装
- [ ] カオスエンジニアリング導入
- [ ] ML基盤の運用最適化

### 長期（6-12ヶ月）
- [ ] 完全自動化達成（95%以上）
- [ ] 自己修復システム実装
- [ ] AIOps導入

---

**最終更新**: 2025-08-15  
**バージョン**: 1.0.0  
**メンテナー**: PMPLearningManagement DevOpsチーム  
**統合完了日**: 2025-08-15