# Development エージェント

開発作業に特化したエージェント群です。

## エージェント選択ガイド

| エージェント | 適用場面 | 主な技術 |
|------------|----------|----------|
| **frontend-developer** | UI/UX実装、React/Vue開発 | React, TypeScript, CSS, D3.js |
| **backend-developer** | API開発、サーバーサイド | Node.js, Express, データベース |
| **fullstack-developer** | エンドツーエンド機能実装 | フロント+バックエンド統合 |
| **mobile-app-developer** | モバイルアプリ開発 | React Native, iOS/Android |

## 推奨使用パターン

- **小規模機能**: frontend-developer OR backend-developer
- **中規模機能**: fullstack-developer 
- **大規模機能**: fullstack-developer + 専門特化エージェント
- **モバイル対応**: mobile-app-developer + frontend-developer