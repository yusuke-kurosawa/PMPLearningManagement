# GitHub Secrets設定ガイド (P0セキュリティ修正)

**重要:** このファイルの実際のキー値は例示用です。本番環境では必ず新しいキーを生成してください。

## 📋 必須のGitHub Secrets

以下のシークレットをGitHub リポジトリに設定する必要があります：

### 1. リポジトリ設定ページへアクセス

```
https://github.com/yusuke-kurosawa/PMPLearningManagement/settings/secrets/actions
```

### 2. 以下のシークレットを追加

| Secret Name | 説明 | 生成コマンド |
|------------|------|------------|
| `ENCRYPTION_MASTER_KEY` | データ暗号化用マスターキー（64文字） | `openssl rand -hex 32` |
| `HASH_PEPPER` | パスワードハッシュ用ペッパー（32文字） | `openssl rand -hex 16` |
| `APP_SECRET` | アプリケーション秘密鍵（32文字以上） | `openssl rand -base64 32` |
| `VITE_SUPABASE_URL` | Supabase プロジェクトURL | Supabaseダッシュボードから取得 |
| `VITE_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabaseダッシュボードから取得 |

### 3. オプションのシークレット

| Secret Name | 説明 | 必須度 |
|------------|------|-------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | オプション |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis トークン | オプション |
| `VITE_SENTRY_DSN` | Sentryエラートラッキング | オプション |

## 🔐 セキュリティキーの生成

### スクリプトを使用した自動生成（推奨）

```bash
# キー生成スクリプトを実行
./scripts/generate-secure-keys.sh
```

### 手動生成

```bash
# ENCRYPTION_MASTER_KEY (64文字の16進数)
openssl rand -hex 32

# HASH_PEPPER (32文字の16進数)
openssl rand -hex 16

# APP_SECRET (Base64エンコード、32文字以上)
openssl rand -base64 32
```

## 📝 GitHub Actionsワークフローの更新

`.github/workflows/02-cd-continuous-deployment.yml` に以下を追加：

```yaml
env:
  ENCRYPTION_MASTER_KEY: ${{ secrets.ENCRYPTION_MASTER_KEY }}
  HASH_PEPPER: ${{ secrets.HASH_PEPPER }}
  APP_SECRET: ${{ secrets.APP_SECRET }}
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## ⚠️ 重要な注意事項

1. **絶対にキーをコミットしない**
   - `.env.production.local` は `.gitignore` に含まれています
   - 実際のキー値をコードに直接書かない

2. **キーのローテーション**
   - 90日ごとにキーを更新することを推奨
   - 侵害が疑われる場合は即座に更新

3. **環境ごとの分離**
   - 開発環境と本番環境で異なるキーを使用
   - ステージング環境も別のキーセットを使用

4. **アクセス制限**
   - GitHub Secretsへのアクセスは管理者のみに制限
   - 定期的にアクセスログを確認

## 🚀 デプロイ前チェックリスト

- [ ] すべての必須シークレットが設定済み
- [ ] キーの長さが要件を満たしている
- [ ] `.env.production.local` がコミットされていない
- [ ] GitHub Actionsワークフローが更新済み
- [ ] セキュリティテストが成功

## 📚 関連ドキュメント

- [P0セキュリティ修正計画](./P0_SECURITY_FIX_PLAN.md)
- [セキュリティベストプラクティス](./docs/security/SECURITY_BEST_PRACTICES.md)
- [環境変数管理ガイド](./docs/deployment/ENVIRONMENT_VARIABLES.md)

---

最終更新: 2025-09-28