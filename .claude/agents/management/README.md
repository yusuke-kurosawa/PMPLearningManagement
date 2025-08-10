# Management エージェント

プロジェクト管理・プロダクト戦略に特化したエージェント群です。

## エージェント選択ガイド

| エージェント | 適用場面 | 主な職責 |
|------------|----------|----------|
| **project-manager** | プロジェクト計画・進捗管理 | WBS、リスク管理、リソース管理 |
| **product-manager** | プロダクト戦略・要件定義 | ロードマップ、市場分析、仕様策定 |
| **scrum-master** | アジャイル開発支援 | スクラム運営、チーム支援 |
| **business-analyst** | 業務要件分析 | プロセス分析、要件定義書 |

## 推奨使用パターン

- **プロジェクト立上げ**: product-manager → project-manager
- **アジャイル開発**: scrum-master + product-manager  
- **要件定義**: business-analyst → product-manager
- **大規模プロジェクト**: project-manager + business-analyst