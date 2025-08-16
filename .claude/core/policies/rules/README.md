# 📋 Rules ディレクトリ

## 概要

このディレクトリは、PMPLearningManagementプロジェクトの包括的な開発ルール、標準、およびベストプラクティスを定義します。DevOps成熟度レベル5（95%自動化）を達成するための完全なルールセットを提供します。

## 📁 ルールカテゴリ

### 🔧 開発ルール

| ファイル                                             | 説明                                       | 優先度  | 自動化  |
| ---------------------------------------------------- | ------------------------------------------ | ------- | ------- |
| [`eslint-rules.md`](./eslint-rules.md)               | ESLint設定、カスタムルール、品質ゲート     | 🔴 必須 | ✅ 100% |
| [`coding-standards.md`](./coding-standards.md)       | コーディング標準とベストプラクティス       | 🔴 必須 | ✅ 90%  |
| [`testing-rules.md`](./testing-rules.md)             | テスト標準、カバレッジ要件、品質メトリクス | 🔴 必須 | ✅ 95%  |
| [`documentation-rules.md`](./documentation-rules.md) | ドキュメント標準とテンプレート             | 🟡 推奨 | ✅ 80%  |

### 🚀 CI/CD ルール

| ファイル                                                   | 説明                              | 優先度  | 自動化  |
| ---------------------------------------------------------- | --------------------------------- | ------- | ------- |
| [`ci-cd-rules.md`](./ci-cd-rules.md)                       | CI/CDパイプライン要件と品質ゲート | 🔴 必須 | ✅ 95%  |
| [`github-actions-rules.md`](./github-actions-rules.md)     | GitHub Actionsワークフロー標準    | 🔴 必須 | ✅ 100% |
| [`workflow-comment-rules.md`](./workflow-comment-rules.md) | ワークフローコメント記載標準      | 🟡 推奨 | ✅ 85%  |

### 🔒 セキュリティルール

| ファイル                                       | 説明                                   | 優先度  | 自動化  |
| ---------------------------------------------- | -------------------------------------- | ------- | ------- |
| [`security-rules.md`](./security-rules.md)     | セキュリティスキャンとコンプライアンス | 🔴 必須 | ✅ 90%  |
| [`eslint-standards.md`](./eslint-standards.md) | ESLint セキュリティ設定                | 🔴 必須 | ✅ 100% |

### 📝 プロセスルール

| ファイル                                               | 説明                              | 優先度  | 自動化  |
| ------------------------------------------------------ | --------------------------------- | ------- | ------- |
| [`commit-message-rules.md`](./commit-message-rules.md) | コミットメッセージ規約と自動化    | 🔴 必須 | ✅ 100% |
| [`branch-naming-rules.md`](./branch-naming-rules.md)   | ブランチ命名規則と管理            | 🔴 必須 | ✅ 95%  |
| [`pr-rules.md`](./pr-rules.md)                         | プルリクエスト標準とテンプレート  | 🔴 必須 | ✅ 90%  |
| [`idd-process.md`](./idd-process.md)                   | Issue-Driven Development プロセス | 🔴 必須 | ✅ 99%  |

### 🏛️ ガバナンスルール

| ファイル                                       | 説明                   | 優先度  | 自動化 |
| ---------------------------------------------- | ---------------------- | ------- | ------ |
| [`devops-standards.md`](./devops-standards.md) | DevOps標準と成熟度要件 | 🔴 必須 | ✅ 85% |
| [`github-actions.md`](./github-actions.md)     | GitHub Actions詳細規則 | 🟡 推奨 | ✅ 90% |

## 🎯 ルール成熟度メトリクス

### 現在の達成状況

```yaml
overall_compliance: 94%
automation_level: 92%
enforcement_rate: 96%

by_category:
  development: 95%
  ci_cd: 93%
  security: 91%
  process: 96%
  governance: 90%
```

### 目標 (2025 Q3)

```yaml
overall_compliance: ≥98%
automation_level: ≥95%
enforcement_rate: 100%
```

## 🤖 自動化ツール

### ルール検証

```bash
# すべてのルールをチェック
npm run rules:check

# 特定のカテゴリをチェック
npm run rules:check:eslint
npm run rules:check:commits
npm run rules:check:security

# ルール違反を自動修正
npm run rules:fix

# ルールコンプライアンスレポート生成
npm run rules:report
```

### Git Hooks

```bash
# Git hooks インストール（自動ルール適用）
npm run rules:hooks:install

# Pre-commit: ESLint、フォーマット、テスト
# Commit-msg: コミットメッセージ検証
# Pre-push: ブランチ名、セキュリティチェック
```

### CI/CD Integration

```yaml
# GitHub Actions で自動実行
- ESLint ルールチェック
- コミットメッセージ検証
- ブランチ名検証
- PRテンプレート検証
- セキュリティスキャン
- テストカバレッジチェック
- ドキュメント生成
```

## 📊 ルール効果測定

### KPI (Key Performance Indicators)

| メトリクス         | 現在値 | 目標   | ステータス |
| ------------------ | ------ | ------ | ---------- |
| ESLintエラー       | 0      | 0      | ✅ 達成    |
| ESLint警告         | 45     | ≤50    | ✅ 達成    |
| テストカバレッジ   | 82%    | ≥80%   | ✅ 達成    |
| IDD準拠率          | 99%    | ≥99%   | ✅ 達成    |
| セキュリティスコア | 88/100 | ≥85    | ✅ 達成    |
| ビルド成功率       | 96%    | ≥95%   | ✅ 達成    |
| デプロイ頻度       | 8/日   | ≥10/日 | 🔄 進行中  |
| MTTR               | 18分   | ≤15分  | 🔄 進行中  |

## 🔄 ルール更新プロセス

### 1. 提案フェーズ

```bash
# Issueを作成
gh issue create --title "[Rule] 新しいルールの提案" \
  --label "rule-proposal" \
  --body "ルールの詳細..."
```

### 2. レビューフェーズ

- テクニカルレビュー（必須）
- セキュリティレビュー（必要に応じて）
- チーム合意形成

### 3. 実装フェーズ

```bash
# ブランチ作成
git checkout -b feature/issue-XXX-new-rule

# ルールファイル更新
vim .claude/rules/new-rule.md

# 自動化スクリプト追加
vim scripts/enforce-new-rule.js

# テスト追加
npm run test:rules
```

### 4. 展開フェーズ

- 段階的ロールアウト
- メトリクス監視
- フィードバック収集

## 📚 クイックリファレンス

### 必須ルールチェックリスト

- [ ] ESLintエラー: 0個
- [ ] TypeScriptエラー: 0個
- [ ] テストカバレッジ: ≥80%
- [ ] コミットメッセージ: Issue番号含む
- [ ] ブランチ名: 規約に準拠
- [ ] PRテンプレート: 完全記入
- [ ] セキュリティスキャン: パス
- [ ] ドキュメント: 更新済み

### よく使うコマンド

```bash
# ルール一覧表示
ls -la .claude/rules/

# ルール詳細確認
cat .claude/rules/eslint-rules.md

# ルール違反チェック
npm run lint
npm run test:coverage
npm run security:scan

# ルール準拠状況
npm run rules:compliance

# ルールダッシュボード
npm run rules:dashboard
```

## 🚨 違反時の対処

### 即座に修正が必要

- セキュリティ違反
- ビルド失敗
- テスト失敗

### 次のスプリントで修正

- ESLint警告
- ドキュメント不足
- パフォーマンス改善

### テクニカルデットとして管理

- リファクタリング
- 技術的改善
- 最適化

## 📈 継続的改善

### 月次レビュー

- ルール効果測定
- 違反パターン分析
- 改善提案

### 四半期更新

- ルール見直し
- 自動化強化
- ツールアップデート

### 年次監査

- 完全コンプライアンスチェック
- ベストプラクティス更新
- 次年度目標設定

## 🔗 関連リソース

### 内部ドキュメント

- [DevOps成熟度モデル](../operations/README.md)
- [CI/CDパイプライン](../operations/ci-cd/README.md)
- [セキュリティポリシー](../policies/security-policy.md)
- [コーディング標準](../policies/coding-standards.md)

### 外部リソース

- [ESLint公式ドキュメント](https://eslint.org/docs/latest/)
- [GitHub Actions ベストプラクティス](https://docs.github.com/en/actions/guides)
- [OWASP セキュリティガイド](https://owasp.org/www-project-top-ten/)
- [Google エンジニアリングプラクティス](https://google.github.io/eng-practices/)

## 📞 サポート

### 質問・相談

- Slackチャンネル: #devops-rules
- メール: devops-team@example.com
- オフィスアワー: 毎週水曜 15:00-16:00

### 緊急時

- オンコール: [PagerDuty](https://example.pagerduty.com)
- ホットライン: 内線 9999

---

**最終更新**: 2025-08-15  
**オーナー**: DevOps Team  
**レビュー予定**: 2025-09-15
