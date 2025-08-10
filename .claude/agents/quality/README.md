# Quality エージェント

品質保証・テストに特化したエージェント群です。

## エージェント選択ガイド

| エージェント | 適用場面 | 主な技術 |
|------------|----------|----------|
| **qa-expert** | テスト戦略・品質管理 | テスト計画、品質メトリクス |
| **test-automator** | テスト自動化 | Jest, Playwright, E2Eテスト |
| **security-auditor** | セキュリティ監査 | 脆弱性診断、セキュリティテスト |

## 推奨使用パターン

- **品質向上**: qa-expert + test-automator
- **セキュリティ強化**: security-auditor
- **完全品質保証**: qa-expert + test-automator + security-auditor