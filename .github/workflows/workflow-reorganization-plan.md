# GitHub Actions ワークフロー再編成計画

## 現在のワークフロー分析

### 既存ファイル
1. `01-core-ci-cd.yml` - ✅ 命名規則適合
2. `03-security-scan.yml` - ✅ 命名規則適合
3. `04-deploy.yml` - ⚠️ カテゴリ不明確
4. `06-idd-main.yml` - ⚠️ カテゴリ不明確
5. `07-idd-metrics.yml` - ⚠️ カテゴリ不明確
6. `deploy.yml` - ❌ 命名規則非準拠（重複）
7. `minimal-status-check.yml` - ❌ 命名規則非準拠
8. `test-ci.yml` - ❌ 命名規則非準拠

## 再編成計画

### 新命名規則マッピング
- `deploy.yml` → 削除（04-deploy.ymlと重複）
- `minimal-status-check.yml` → `01-core-status-check.yml`
- `test-ci.yml` → `02-quality-test.yml`
- `04-deploy.yml` → `04-deployment-production.yml`
- `06-idd-main.yml` → `02-quality-idd-compliance.yml`
- `07-idd-metrics.yml` → `02-quality-idd-metrics.yml`

### カテゴリ整理
1. **01-core-*** : 基本CI/CD、ステータスチェック
2. **02-quality-*** : テスト、IDD、品質保証
3. **03-security-*** : セキュリティスキャン
4. **04-deployment-*** : デプロイメント関連
5. **05-docs-*** : ドキュメント生成（今後追加）
6. **06-claude-*** : Claude統合（今後追加）
7. **07-release-*** : リリース管理（今後追加）

## 実装手順
1. 重複ファイル削除
2. ファイル名変更
3. 各ワークフローのコメント標準化
4. 再利用可能コンポーネント抽出
5. テスト実行