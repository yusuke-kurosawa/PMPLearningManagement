# Infrastructure エージェント

インフラ構築・運用に特化したエージェント群です。

## エージェント選択ガイド

| エージェント | 適用場面 | 主な技術 |
|------------|----------|----------|  
| **devops-engineer** | CI/CD・デプロイ自動化 | GitHub Actions, Docker, K8s |
| **database-admin** | データベース設計・運用 | PostgreSQL, Redis, 最適化 |

## 推奨使用パターン

- **CI/CD構築**: devops-engineer
- **DB設計・最適化**: database-admin
- **フルインフラ構築**: devops-engineer + database-admin