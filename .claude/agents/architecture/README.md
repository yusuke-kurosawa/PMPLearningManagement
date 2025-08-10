# Architecture エージェント

システム設計・アーキテクチャに特化したエージェント群です。

## エージェント選択ガイド

| エージェント | 適用場面 | 主な技術 |
|------------|----------|----------|
| **architect-reviewer** | システム設計・技術選定 | アーキテクチャパターン、設計レビュー |
| **cloud-architect** | クラウドインフラ設計 | AWS/GCP/Azure、マルチクラウド |  
| **microservices-architect** | 分散システム設計 | マイクロサービス、API設計 |

## 推奨使用パターン

- **新システム設計**: architect-reviewer → cloud-architect
- **既存システム改善**: architect-reviewer
- **クラウド移行**: cloud-architect  
- **マイクロサービス化**: microservices-architect + architect-reviewer