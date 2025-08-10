# PMPLearningManagement エージェント選択ガイド

このディレクトリには、プロジェクトの各種作業に特化したエージェント定義が役割別に整理されています。適切なエージェントを効率的に選択するためのガイドです。

## 🎯 エージェント選択クイックガイド

### 作業タイプ別の推奨エージェント

| 作業内容 | 推奨エージェント | カテゴリ |
|---------|-----------------|----------|
| 🔧 フロントエンド開発・修正 | frontend-developer | development |
| 🔧 バックエンド開発・API作成 | backend-developer | development |
| 🔧 フルスタック機能実装 | fullstack-developer | development |
| 📱 モバイルアプリ開発 | mobile-app-developer | development |
| 🏗️ システム設計・アーキテクチャ | architect-reviewer | architecture |
| ☁️ クラウドインフラ設計 | cloud-architect | architecture |
| 🔧 マイクロサービス設計 | microservices-architect | architecture |
| 📋 プロジェクト管理・計画 | project-manager | management |
| 📊 プロダクト戦略・要件定義 | product-manager | management |
| 🏃 アジャイル開発・スクラム | scrum-master | management |
| 📈 ビジネス要件分析 | business-analyst | management |
| 🚀 CI/CD・デプロイ自動化 | devops-engineer | infrastructure |
| 🗄️ データベース設計・最適化 | database-admin | infrastructure |
| 🧪 品質保証・テスト戦略 | qa-expert | quality |
| 🤖 テスト自動化 | test-automator | quality |
| 🛡️ セキュリティ監査・脆弱性対策 | security-auditor | quality |
| 🎯 エージェント調整・最適化 | agent-organizer | coordination |
| 📋 コンテキスト管理・状態管理 | context-manager | coordination |

## 📁 カテゴリ別エージェント一覧

### 🔧 Development (開発系)
フロントエンド、バックエンド、フルスタック、モバイル開発に特化

```bash
development/
├── frontend-developer.md      # React/Vue/Angular等のUI開発
├── backend-developer.md       # API/サーバーサイド開発
├── fullstack-developer.md     # エンドツーエンド機能実装
└── mobile-app-developer.md    # iOS/Android/React Native開発
```

**使用例**: 
- 新機能の実装
- UIコンポーネントの作成
- API エンドポイントの開発
- データベーススキーマとAPIの統合

### 🏗️ Architecture (アーキテクチャ系)
システム設計、技術選定、アーキテクチャレビューに特化

```bash
architecture/
├── architect-reviewer.md       # 設計レビュー・技術選定
├── cloud-architect.md         # AWS/GCP/Azure設計
└── microservices-architect.md # 分散システム・マイクロサービス
```

**使用例**:
- システム全体の設計
- 技術スタックの選定
- スケーラビリティの検討
- クラウド移行計画

### 📋 Management (管理系)
プロジェクト管理、プロダクト戦略、チームマネジメントに特化

```bash
management/
├── project-manager.md    # プロジェクト計画・進捗管理
├── product-manager.md    # プロダクト戦略・ロードマップ
├── scrum-master.md       # アジャイル・スクラム運営
└── business-analyst.md   # 要件分析・ビジネスプロセス
```

**使用例**:
- プロジェクト計画の策定
- 要件定義・仕様書作成
- リリース計画・マイルストーン設定
- チーム協業の最適化

### 🏗️ Infrastructure (インフラ系)  
インフラ構築、CI/CD、データベース管理に特化

```bash
infrastructure/
├── devops-engineer.md  # CI/CD・デプロイ自動化
└── database-admin.md   # DB設計・最適化・運用
```

**使用例**:
- CI/CDパイプラインの構築
- Docker/Kubernetesの設定
- データベース設計・最適化
- 監視・ロギング設定

### 🧪 Quality (品質保証系)
テスト、品質管理、セキュリティに特化

```bash
quality/
├── qa-expert.md      # テスト戦略・品質管理
├── test-automator.md # テスト自動化・E2Eテスト
└── security-auditor.md # セキュリティ監査・脆弱性対策
```

**使用例**:
- テスト計画の策定
- 自動化テストの実装
- セキュリティ監査・脆弱性診断
- パフォーマンステスト

### 🎯 Coordination (調整・統合系)
エージェント間の調整、コンテキスト管理に特化

```bash
coordination/
├── agent-organizer.md # エージェント編成・ワークフロー最適化
└── context-manager.md # コンテキスト管理・状態同期
```

**使用例**:
- 複数エージェントの協調作業
- プロジェクトコンテキストの管理
- 作業状態の同期・追跡
- ワークフローの最適化

## 🚀 効率的なエージェント選択方法

### 1. 作業スコープで選択
- **単一技術領域**: 専門特化エージェント（frontend-developer, backend-developer等）
- **横断的作業**: 統合型エージェント（fullstack-developer, architect-reviewer等）
- **複数エージェント協調**: coordination カテゴリのエージェント

### 2. プロジェクトフェーズで選択
- **計画・設計フェーズ**: management + architecture
- **開発フェーズ**: development + infrastructure
- **テスト・リリースフェーズ**: quality + infrastructure

### 3. 緊急度・優先度で選択
- **高優先度・複雑**: 経験豊富なエージェント（architect-reviewer, fullstack-developer）
- **並行作業**: 複数の専門特化エージェント
- **品質重視**: quality カテゴリを必ず含める

## 📊 パフォーマンス指標

各エージェントは以下の指標で評価・最適化されています：

- **応答精度**: 90%以上
- **タスク完了率**: 95%以上  
- **実行時間効率**: 要求仕様に応じて最適化
- **協調性**: 他エージェントとの連携スコア
- **専門性深度**: 各領域での専門知識レベル

## 🔄 継続的改善

このエージェント構成は以下に基づいて継続的に最適化されています：

- パフォーマンス分析結果
- プロジェクト要件の変化
- 新技術・手法の導入
- チーム構成・スキルレベルの変化

---
*最終更新: 2025-08-10*
*管理責任者: context-manager + agent-organizer*