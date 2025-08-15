# 🔧 Infrastructure エージェントカテゴリ

> **重要**: このディレクトリはインフラストラクチャとDevOpsに特化したClaude Codeエージェントを管理します。

## 📋 概要

Infrastructureカテゴリは、CI/CD、データベース管理、クラウドインフラ、自動化を担当する運用専門エージェント群です。安定したインフラ基盤の構築と効率的な運用を支援します。

## 🤖 配置エージェント

### devops-engineer.md
**DevOps・自動化専門エージェント**

#### 専門領域
- CI/CDパイプライン構築
- コンテナ化とオーケストレーション
- インフラストラクチャのコード化
- 自動化とスクリプティング
- 監視とロギング

#### 技術スタック
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **コンテナ**: Docker, Kubernetes, Docker Compose
- **IaC**: Terraform, Ansible, CloudFormation
- **監視**: Prometheus, Grafana, ELK Stack
- **クラウド**: AWS, GCP, Azure

#### 主要タスク
```bash
# CI/CDパイプライン構築
@agent-devops-engineer GitHub Actionsワークフローを構築してください

# コンテナ化
@agent-devops-engineer アプリケーションをDockerコンテナ化してください

# 自動デプロイ
@agent-devops-engineer 自動デプロイパイプラインを実装してください

# 監視設定
@agent-devops-engineer 監視とアラートシステムを構築してください
```

#### 自動化スクリプト例
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          npm ci
          npm run build
          npm run deploy
```

### database-admin.md
**データベース管理専門エージェント**

#### 専門領域
- データベース設計
- パフォーマンスチューニング
- バックアップとリカバリ
- レプリケーション設定
- セキュリティ管理

#### 技術スタック
- **RDBMS**: PostgreSQL, MySQL, Oracle
- **NoSQL**: MongoDB, Redis, Cassandra
- **ORM/ODM**: Prisma, TypeORM, Mongoose
- **監視**: pgAdmin, Redis Commander
- **最適化**: インデックス設計, クエリ最適化

#### 主要タスク
```bash
# データベース設計
@agent-database-admin データベーススキーマを設計してください

# パフォーマンス最適化
@agent-database-admin クエリパフォーマンスを最適化してください

# バックアップ戦略
@agent-database-admin バックアップとリカバリ戦略を策定してください

# セキュリティ強化
@agent-database-admin データベースセキュリティを強化してください
```

#### スキーマ設計例
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## 🎯 使用シナリオ

### 新規インフラ構築
```bash
# 1. インフラ設計
@agent-devops-engineer インフラアーキテクチャを設計してください

# 2. CI/CD構築
@agent-devops-engineer CI/CDパイプラインを実装してください

# 3. データベース構築
@agent-database-admin データベース環境を構築してください

# 4. 監視設定
@agent-devops-engineer 監視システムを設定してください
```

### 既存インフラ改善
```bash
# 1. 現状分析
@agent-devops-engineer インフラの問題点を分析してください

# 2. 最適化提案
@agent-database-admin データベース最適化案を提示してください

# 3. 実装
@agent-devops-engineer 改善案を実装してください
```

## 📊 評価メトリクス

### パフォーマンス指標
| メトリクス | 目標値 | 現在値 |
|-----------|--------|--------|
| デプロイ成功率 | 99% | 98% |
| 平均復旧時間(MTTR) | <30分 | 25分 |
| システム稼働率 | 99.9% | 99.8% |
| DB応答時間 | <100ms | 95ms |

### 自動化指標
- **CI/CD自動化率**: 95%
- **インフラコード化率**: 90%
- **自動テスト実行率**: 100%
- **自動リカバリ率**: 80%

## 🔧 インフラ設定

### DevOps設定
```json
{
  "ci_cd": {
    "platform": "GitHub Actions",
    "deployment": "automated",
    "environments": ["dev", "staging", "production"],
    "rollback": "automatic"
  },
  "monitoring": {
    "metrics": "Prometheus",
    "logs": "ELK Stack",
    "alerts": "PagerDuty"
  }
}
```

### データベース設定
```yaml
database:
  primary:
    type: PostgreSQL
    version: "15"
    replication: streaming
    backup: daily
  cache:
    type: Redis
    version: "7"
    persistence: enabled
```

## 🔗 他カテゴリとの連携

### Development連携
```bash
# 開発環境構築
@agent-fullstack-developer 開発完了
→ @agent-devops-engineer デプロイ環境準備
```

### Architecture連携
```bash
# インフラ設計実装
@agent-cloud-architect インフラ設計
→ @agent-devops-engineer 実装開始
```

### Quality連携
```bash
# セキュリティ強化
@agent-security-auditor セキュリティ要件
→ @agent-devops-engineer セキュリティ実装
```

## 🎮 ベストプラクティス

### ✅ 推奨事項

1. **インフラのコード化**
   - すべてのインフラをコードで管理
   - バージョン管理の徹底
   - レビュープロセスの実施

2. **自動化優先**
   - 手動作業の最小化
   - CI/CDパイプラインの充実
   - 自動テストの実装

3. **監視とアラート**
   - 包括的な監視体制
   - 適切なアラート設定
   - インシデント対応手順

### ❌ 避けるべきこと

1. **手動デプロイ**
   - 人的ミスのリスク
   - 再現性の欠如
   - 時間の浪費

2. **セキュリティの軽視**
   - デフォルト設定の使用
   - 暗号化の省略
   - アクセス制御の不備

## 📈 継続的改善

### 月次目標
- インフラコスト10%削減
- デプロイ時間20%短縮
- 自動化率5%向上
- インシデント発生率10%削減

### 技術革新
- サーバーレスアーキテクチャ導入
- GitOps実践
- カオスエンジニアリング
- AIOps活用

---

**最終更新**: 2025-08-15  
**カテゴリ責任者**: @agent-devops-engineer  
**対象プロジェクト**: PMPLearningManagement
