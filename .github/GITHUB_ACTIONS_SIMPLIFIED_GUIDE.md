# GitHub Actions 簡易ガイド

## 📋 概要

PMPLearningManagementプロジェクトのGitHub Actions運用に関する基本ガイドです。

## 🎯 主要ワークフロー

### 1. 📦 Core CI/CD Pipeline

- **ファイル**: `01-core-ci-cd.yml`
- **目的**: ビルド、テスト、品質チェック
- **トリガー**: push、PR作成時

### 2. 🔒 Security Scan

- **ファイル**: `03-security-scan.yml`
- **目的**: セキュリティ監査、脆弱性スキャン
- **トリガー**: 定期実行、PR作成時

### 3. 🚀 Production Deployment

- **ファイル**: `deploy.yml`
- **目的**: GitHub Pagesへのデプロイ
- **トリガー**: mainブランチへのpush

### 4. 📋 IDD Compliance Check

- **ファイル**: `idd-compliance.yml`
- **目的**: Issue駆動開発の準拠チェック
- **トリガー**: PR作成・更新時

## 🏷️ 命名規則

### ワークフローファイル

```
<番号>-<カテゴリ>-<機能>.yml

例:
01-core-ci-cd.yml          # CI/CD基盤
02-claude-pr-review.yml    # Claude PR レビュー
03-security-scan.yml       # セキュリティスキャン
04-deploy-production.yml   # プロダクションデプロイ
05-idd-compliance.yml      # IDD準拠チェック
```

## 💡 ベストプラクティス

### ✅ 推奨事項

1. **日本語コメント**: わかりやすい説明を記載
2. **絵文字使用**: 視認性向上のため活用
3. **並列実行**: 可能な限り並列化
4. **キャッシュ活用**: ビルド時間短縮
5. **適切な権限**: 最小権限の原則

### ❌ 避けるべき事項

1. **ハードコーディング**: シークレットや設定値
2. **過度な権限付与**: 不必要な権限は設定しない
3. **長時間実行**: 効率的な実装を心がける
4. **重複処理**: 同じ処理の重複を避ける

## 🔧 メンテナンス

### 定期的な確認事項

- [ ] ワークフローの実行状況
- [ ] エラーログの確認
- [ ] 実行時間の監視
- [ ] 成功率の追跡

### 問題発生時の対応

1. **GitHub Actions画面で詳細ログを確認**
2. **エラーメッセージを分析**
3. **必要に応じてワークフローを修正**
4. **テスト実行で動作確認**

## 📊 監視項目

### パフォーマンス指標

- 実行時間
- 成功率
- リソース使用量
- キャッシュヒット率

### 品質指標

- ビルド成功率
- テストカバレッジ
- ESLintエラー数
- セキュリティ問題数

## 🚀 最適化のヒント

### 実行時間短縮

```yaml
# キャッシュの活用
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: node-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

# 並列実行
strategy:
  matrix:
    node-version: [18, 20]
```

### エラー処理

```yaml
# 条件付き実行
- name: テスト実行
  if: success()
  run: npm test

# 失敗時の対処
- name: 失敗時の通知
  if: failure()
  run: echo "テストが失敗しました"
```

## 🔗 関連リソース

- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [プロジェクト固有ルール](.claude/rules/github-actions.md)
- [IDD実装ガイド](docs/IDD_IMPLEMENTATION_STATUS.md)

---

最終更新: 2025-08-15  
関連Issue: #77 - DevOps基盤構築
