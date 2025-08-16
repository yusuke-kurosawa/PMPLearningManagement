# 🏗️ Architecture エージェントカテゴリ

> **重要**: このディレクトリはシステムアーキテクチャと設計に特化したClaude Codeエージェントを管理します。

## 📋 概要

Architectureカテゴリは、システムの設計、技術選定、アーキテクチャレビューを担当する専門エージェント群です。品質の高い設計と持続可能なアーキテクチャの実現を支援します。

## 🤖 配置エージェント

### architect-reviewer.md

**アーキテクチャレビュー専門エージェント**

#### 専門領域

- システム設計レビュー
- 技術選定評価
- パフォーマンス最適化提案
- スケーラビリティ分析
- セキュリティアーキテクチャ評価

#### 主要タスク

```bash
# アーキテクチャレビュー
@agent-architect-reviewer 現在のシステム設計をレビューしてください

# 技術選定支援
@agent-architect-reviewer 新機能のための技術スタック選定を支援してください

# パフォーマンス分析
@agent-architect-reviewer システムのボトルネック分析と改善提案をしてください
```

### cloud-architect.md

**クラウドインフラ設計エージェント**

#### 専門領域

- AWS/Azure/GCP設計
- インフラストラクチャの最適化
- コスト最適化
- 高可用性設計
- ディザスタリカバリ計画

#### 主要タスク

```bash
# クラウド移行計画
@agent-cloud-architect オンプレミスからクラウドへの移行計画を策定してください

# インフラ最適化
@agent-cloud-architect 現在のクラウドインフラのコスト最適化案を提示してください

# スケーリング設計
@agent-cloud-architect 自動スケーリング戦略を設計してください
```

### microservices-architect.md

**マイクロサービス設計エージェント**

#### 専門領域

- マイクロサービス分割戦略
- API設計
- サービス間通信
- イベント駆動アーキテクチャ
- コンテナ化とオーケストレーション

#### 主要タスク

```bash
# サービス分割
@agent-microservices-architect モノリスをマイクロサービスに分割する戦略を提案してください

# API設計
@agent-microservices-architect RESTful APIの設計レビューをしてください

# イベント設計
@agent-microservices-architect イベント駆動アーキテクチャを設計してください
```

## 🎯 使用シナリオ

### 新規プロジェクト立ち上げ

```bash
# 1. 要件分析とアーキテクチャ設計
@agent-architect-reviewer プロジェクト要件からアーキテクチャを設計してください

# 2. クラウドインフラ設計
@agent-cloud-architect 設計に基づいてクラウドインフラを構築してください

# 3. マイクロサービス設計（該当する場合）
@agent-microservices-architect サービス分割とAPI設計を行ってください
```

### 既存システムの改善

```bash
# 1. 現状分析
@agent-architect-reviewer 既存システムの問題点を分析してください

# 2. 改善提案
@agent-cloud-architect インフラレベルの改善案を提示してください

# 3. 実装計画
@agent-microservices-architect 段階的な移行計画を策定してください
```

## 📊 評価メトリクス

### パフォーマンス指標

| メトリクス     | 目標値 | 現在値 |
| -------------- | ------ | ------ |
| レビュー精度   | 95%    | 93%    |
| 提案採用率     | 80%    | 78%    |
| 設計品質スコア | 90%    | 88%    |
| コスト削減率   | 30%    | 28%    |

## 🔗 他カテゴリとの連携

### Development連携

```bash
# アーキテクチャ設計後の実装
@agent-architect-reviewer 設計完了
→ @agent-fullstack-developer 実装開始
```

### Quality連携

```bash
# 設計レビューとセキュリティ監査
@agent-architect-reviewer 設計レビュー
→ @agent-security-auditor セキュリティ評価
```

### Infrastructure連携

```bash
# インフラ設計とDevOps実装
@agent-cloud-architect インフラ設計
→ @agent-devops-engineer CI/CD構築
```

---

**最終更新**: 2025-08-15  
**カテゴリ責任者**: @agent-architect-reviewer  
**対象プロジェクト**: PMPLearningManagement
