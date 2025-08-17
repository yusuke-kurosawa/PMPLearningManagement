# ⚡ Automation ディレクトリ

## 概要

プロジェクトの自動化スクリプト、Git Hooks、GitHub Actions統合、定期実行タスクを管理します。

## ディレクトリ構造

```
automation/
├── hooks/                # Git Hooks
│   ├── pre-commit       # コミット前チェック
│   ├── commit-msg       # コミットメッセージ検証
│   ├── pre-push         # プッシュ前チェック
│   └── post-merge       # マージ後処理
│
├── workflows/           # GitHub Actions統合
│   ├── templates/      # ワークフローテンプレート
│   ├── composite/      # 再利用可能アクション
│   └── scripts/        # ワークフロー用スクリプト
│
├── scripts/            # 自動化スクリプト
│   ├── daily/         # 日次タスク
│   ├── weekly/        # 週次タスク
│   └── adhoc/         # 随時実行タスク
│
└── cron/              # 定期実行設定
    ├── schedules.yml  # スケジュール定義
    └── jobs/          # ジョブ定義
```

## 主要機能

### 🪝 Git Hooks

#### pre-commit
```bash
#!/bin/bash
# 自動実行内容:
- ESLintチェック
- Prettierフォーマット
- TypeScript型チェック
- テスト実行（軽量）
```

#### commit-msg
```bash
#!/bin/bash
# IDD準拠チェック:
- Issue番号の存在確認
- コミットメッセージフォーマット検証
- 禁止ワードチェック
```

#### pre-push
```bash
#!/bin/bash
# 包括的チェック:
- 全テストスイート実行
- ビルド確認
- セキュリティスキャン
- ドキュメント整合性
```

### 🔄 GitHub Actions統合

#### Composite Actions
```yaml
# .github/actions/setup-node
# Node.js環境の標準セットアップ

# .github/actions/quality-check
# 品質チェックの統合実行

# .github/actions/security-audit
# セキュリティ監査の実行
```

#### ワークフローテンプレート
```yaml
# templates/ci-template.yml
# CI/CDワークフローの基本テンプレート

# templates/release-template.yml
# リリースワークフローテンプレート
```

### 📝 自動化スクリプト

#### 日次タスク
```bash
# daily/cleanup.sh
- 一時ファイルクリーンアップ
- ログローテーション
- キャッシュ最適化

# daily/backup.sh
- データバックアップ
- 設定ファイルバックアップ
```

#### 週次タスク
```bash
# weekly/dependency-update.sh
- 依存関係の更新チェック
- セキュリティパッチ適用

# weekly/report-generation.sh
- 品質レポート生成
- パフォーマンスレポート
```

#### 随時実行タスク
```bash
# adhoc/release-prepare.sh
- リリース準備自動化

# adhoc/hotfix-deploy.sh
- ホットフィックスデプロイ
```

## 使用方法

### Git Hooks インストール
```bash
# 全Hooksインストール
npm run hooks:install

# 特定Hookインストール
npm run hooks:install:pre-commit

# Hooks無効化
npm run hooks:disable
```

### スクリプト実行
```bash
# 日次タスク実行
npm run automation:daily

# 週次タスク実行
npm run automation:weekly

# カスタムスクリプト実行
npm run automation:run -- scripts/custom.sh
```

### GitHub Actions管理
```bash
# ワークフロー検証
npm run workflow:validate

# ワークフロー実行状況
npm run workflow:status

# ワークフローデバッグ
npm run workflow:debug
```

## 自動化ルール

### 実行タイミング
- **即時**: コミット、プッシュ時
- **定期**: cron式で指定
- **イベント駆動**: Issue作成、PR作成時
- **手動**: 必要に応じて実行

### エラーハンドリング
```javascript
// 自動リトライ
maxRetries: 3
retryDelay: 1000 // ms

// 失敗時通知
onError: notify('slack', 'email')

// ロールバック
onFailure: rollback()
```

### パフォーマンス最適化
- 並列実行
- キャッシュ活用
- 条件付き実行
- 増分処理

## メトリクス

### 自動化率
- **現在**: 85%
- **目標**: 95%

### 実行統計
```bash
# 統計表示
npm run automation:stats

# 結果:
- 日次タスク成功率: 98%
- 週次タスク成功率: 95%
- 平均実行時間: 3分
```

## トラブルシューティング

### Hook実行失敗
```bash
# Hookスキップ（緊急時のみ）
git commit --no-verify

# Hook再インストール
npm run hooks:reinstall
```

### スクリプトエラー
```bash
# デバッグモード実行
DEBUG=* npm run automation:run

# ログ確認
cat .automation.log
```

### GitHub Actions失敗
```bash
# ローカルでの再現
act -j workflow-name

# ログ取得
gh run view --log
```

## ベストプラクティス

### ✅ 推奨
- 冪等性の確保
- 適切なログ出力
- エラー通知設定
- ドライラン機能

### ❌ 避ける
- 破壊的操作の自動化
- 認証情報のハードコード
- 無限ループの可能性
- 過度な自動化

---

最終更新: 2025-08-15  
自動化率: 85%