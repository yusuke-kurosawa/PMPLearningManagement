# GitHub Actions アーティファクトアップロードエラー修正レポート

## 問題の概要

GitHub Actionsワークフローで以下のエラーが発生していました：

```
Error: Failed to CreateArtifact: Received non-retryable error: Failed request: (409) Conflict: an artifact with this name already exists on the workflow run
```

このエラーは、同じワークフロー実行内で同じ名前のアーティファクトを複数回アップロードしようとした際に発生します。

## 原因

以下の要因が重複を引き起こしていました：

1. **Matrix戦略での重複**: `performance-monitoring.yml`で、matrix戦略を使用している際に同じ`name`と`device`の組み合わせが複数回実行される可能性がありました
2. **再実行時の重複**: ワークフローが再実行される際に、同じアーティファクト名を使用していました
3. **固定名の使用**: 一部のワークフローでアーティファクトに固定名を使用していました

## 実施した修正

### 1. performance-monitoring.yml

- **修正箇所**: Lighthouse結果とCore Web Vitalsレポートのアップロード
- **対策**:
  - アーティファクト名に`${{ github.run_id }}-${{ github.run_attempt }}`を追加
  - `if-no-files-found: warn`オプションを追加

### 2. security-optimization.yml

- **修正箇所**: 5つのセキュリティレポートアップロード
- **対策**:
  - 全てのアーティファクト名に`${{ github.run_id }}-${{ github.run_attempt }}`を追加
  - `if-no-files-found: warn`オプションを追加

### 3. content-quality-assurance.yml

- **修正箇所**: 6つの品質保証レポートアップロード
- **対策**:
  - 全てのアーティファクト名に`${{ github.run_id }}-${{ github.run_attempt }}`を追加
  - `if-no-files-found: warn`オプションを追加

### 4. security-scan.yml

- **修正箇所**: 4つのセキュリティスキャンレポートアップロード
- **対策**:
  - 全てのアーティファクト名に`${{ github.run_id }}-${{ github.run_attempt }}`を追加
  - `if-no-files-found: warn`オプションを追加

### 5. pr-validation.yml

- **修正箇所**: E2Eテスト結果のアップロード
- **対策**:
  - アーティファクト名に`${{ github.event.pull_request.number }}-${{ github.run_id }}-${{ github.run_attempt }}`を追加
  - `if-no-files-found: warn`オプションを追加

## 修正の詳細

### アーティファクト名の変更パターン

変更前:

```yaml
name: artifact-name
```

変更後:

```yaml
name: artifact-name-${{ github.run_id }}-${{ github.run_attempt }}
```

### 追加したオプション

```yaml
if-no-files-found: warn
```

これにより、アップロードするファイルが存在しない場合でもワークフローが失敗せず、警告のみを出力します。

## 使用したGitHub コンテキスト変数

- `${{ github.run_id }}`: ワークフロー実行のユニークID
- `${{ github.run_attempt }}`: 同じワークフローの再実行回数
- `${{ github.event.pull_request.number }}`: PR番号（PR関連のワークフローの場合）
- `${{ github.sha }}`: コミットSHA（一部のケースで使用）

## 期待される効果

1. **重複エラーの解消**: アーティファクト名が常にユニークになるため、409エラーが発生しなくなります
2. **再実行対応**: ワークフローを再実行しても、`run_attempt`により異なる名前になります
3. **並列実行対応**: Matrix戦略での並列実行でも問題なく動作します
4. **エラー耐性の向上**: `if-no-files-found: warn`により、ファイルが存在しない場合でもワークフローが継続します

## 検証方法

1. ワークフローを実行し、アーティファクトアップロードエラーが発生しないことを確認
2. 同じワークフローを再実行し、エラーが発生しないことを確認
3. Matrix戦略を使用しているジョブが正常に完了することを確認

## 関連Issue

- Issue #23

## 今後の推奨事項

1. **命名規則の統一**: 全てのワークフローでアーティファクト名にユニーク識別子を含める
2. **テンプレート化**: 共通のアーティファクトアップロード設定をテンプレート化
3. **定期的な監視**: アーティファクトのサイズと保持期間を定期的に確認
4. **ドキュメント化**: アーティファクト命名規則をドキュメント化

---

_修正日時: 2025-08-12_
_修正者: Claude Code (DevOps Engineer)_
