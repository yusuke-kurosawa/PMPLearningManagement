# Claude Code AI Integration - セットアップガイド

このガイドでは、PMPLearningManagementプロジェクトでClaude Code AI Assistantとの統合を設定する手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [GitHub設定](#github設定)
3. [Anthropic API設定](#anthropic-api設定)
4. [ワークフロー有効化](#ワークフロー有効化)
5. [動作確認](#動作確認)
6. [トラブルシューティング](#トラブルシューティング)
7. [高度な設定](#高度な設定)

## 🔧 前提条件

### 必要な権限・アカウント

- **GitHub**：リポジトリの管理者権限
- **Anthropic**：Claude API アカウント（APIキーの取得が必要）
- **Node.js**：18.x 以降（スクリプト実行用）

### 確認事項

- [ ] GitHubリポジトリへの管理者権限がある
- [ ] GitHub Actionsが有効になっている
- [ ] リポジトリがPublicまたはGitHub Pro/Team/Enterpriseプランである
- [ ] Anthropic Console へのアクセスができる

## ⚙️ GitHub設定

### 1. リポジトリ設定の確認

1. GitHubリポジトリにアクセス
2. **Settings** タブをクリック
3. **Actions** → **General** を選択
4. 以下の設定を確認・変更：

```yaml
Workflow permissions:
☑ Read and write permissions
☑ Allow GitHub Actions to create and approve pull requests
```

### 2. GitHub Actionsワークフロー権限

**Actions** → **General** → **Workflow permissions** で以下を設定：

- **Read and write permissions**: 有効
- **Allow GitHub Actions to create and approve pull requests**: 有効

これにより、Claude AI がIssue/PRにコメントを追加できるようになります。

### 3. Branch Protection Rules（推奨）

メインブランチの保護設定（**Settings** → **Branches**）：

```yaml
Branch name pattern: main
Settings:
☑ Require a pull request before merging
☑ Require status checks to pass before merging
  - lint-and-format
  - build-test
  - security-audit
☑ Require branches to be up to date before merging
☑ Include administrators
```

## 🔑 Anthropic API設定

### 1. APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウント作成・ログイン
3. **API Keys** セクションに移動
4. **Create Key** をクリック
5. キー名を入力（例：`PMPLearning-GitHub-Integration`）
6. APIキーをコピーして安全に保存

### 2. 使用量・制限の確認

- **Usage**: 現在の使用量を確認
- **Rate Limits**: API呼び出し制限を確認
- **Billing**: 課金設定を確認

推奨設定：

- Monthly spend limit: $50-100（使用量に応じて調整）
- Rate limit alerts: 有効

## 🔐 GitHub Secrets設定

### 1. 必須Secrets

GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions** で以下を追加：

| Secret名            | 値                 | 説明                                   |
| ------------------- | ------------------ | -------------------------------------- |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Anthropic APIキー                      |
| `GITHUB_TOKEN`      | _自動生成_         | GitHub Actions用トークン（通常は自動） |

### 2. オプションSecrets

必要に応じて追加：

| Secret名              | 値                                     | 説明            |
| --------------------- | -------------------------------------- | --------------- |
| `SLACK_WEBHOOK_URL`   | `https://hooks.slack.com/...`          | Slack通知用     |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Discord通知用   |
| `LIGHTHOUSE_CI_TOKEN` | `lhci_token_...`                       | Lighthouse CI用 |

### 3. Secretsの設定手順

1. GitHubリポジトリで **Settings** をクリック
2. 左サイドバーで **Secrets and variables** → **Actions** をクリック
3. **New repository secret** をクリック
4. Name: `ANTHROPIC_API_KEY`
5. Secret: AnthropicからコピーしたAPIキーを貼り付け
6. **Add secret** をクリック

## 🚀 ワークフロー有効化

### 1. ワークフローファイルの確認

以下のファイルが存在することを確認：

```bash
.github/workflows/
├── claude-assistant.yml          # メインAI統合
├── claude-issue-handler.yml      # Issue処理
├── claude-pr-review.yml          # PR自動レビュー
└── deploy.yml                    # 既存デプロイメント
```

### 2. ワークフローの手動実行テスト

1. GitHubリポジトリで **Actions** タブをクリック
2. **Claude Code AI Assistant** ワークフローを選択
3. **Run workflow** → **Run workflow** をクリック
4. 実行結果を確認

### 3. 初回設定の実行

新しいIssueを作成してAI機能をテスト：

1. **Issues** → **New issue** をクリック
2. **Bug Report** テンプレートを選択
3. 必要な情報を入力して作成
4. 数分後にAIによる自動分類コメントが追加されることを確認

## ✅ 動作確認

### 1. Issue自動分類のテスト

新しいIssueを作成：

```markdown
Title: [Bug]: PWA version crashes on iOS Safari
Labels: (空欄のまま)
```

期待結果：

- 自動的に `bug` ラベルが追加される
- 優先度ラベル（`priority:high`）が追加される
- AIによる分類コメントが投稿される

### 2. @claudeメンションテスト

既存のIssueに以下をコメント：

```markdown
@claude analyze

この問題の影響範囲と解決策を分析してください。
```

期待結果：

- Claude AIからの返答コメントが数分以内に投稿される
- 影響範囲の分析と解決提案が含まれる

### 3. PR自動レビューテスト

1. 新しいブランチを作成
2. 小さな変更をコミット
3. Pull Requestを作成
4. 自動レビューコメントが投稿されることを確認

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. AI応答がない

**症状**: `@claude`でメンションしても応答がない

**解決方法**:

1. Secretsの設定を確認：

   ```bash
   # Actions履歴でSecret masking を確認
   ANTHROPIC_API_KEY: ***
   ```

2. ワークフローの実行ログを確認：

   ```yaml
   # エラー例と対処法
   Error: Invalid API key → APIキーを再生成・設定
   Error: Rate limit → API使用量制限を確認
   Error: Permission denied → GitHub Actions権限を確認
   ```

3. APIキーの権限確認：
   - Anthropic Console でキーの状態確認
   - 使用量制限の確認

#### 2. ワークフローが実行されない

**症状**: Issue作成時に自動処理が起動しない

**解決方法**:

1. GitHub Actions設定確認：

   ```yaml
   Settings → Actions → General
   Actions permissions: Allow all actions and reusable workflows
   ```

2. ワークフロー権限確認：

   ```yaml
   Workflow permissions: Read and write permissions
   ☑ Allow GitHub Actions to create and approve pull requests
   ```

3. ワークフローファイルの構文確認：
   ```bash
   # YAML構文チェック
   yamllint .github/workflows/claude-assistant.yml
   ```

#### 3. レート制限エラー

**症状**: `Rate limit exceeded` エラー

**解決方法**:

1. Anthropic Console で使用量確認
2. ワークフロー実行頻度の調整：

   ```yaml
   # リクエスト間の待機時間を増加
   delay: 2000 # 2秒 → 5秒
   ```

3. 一時的な使用制限の設定：
   ```yaml
   env:
     MAX_CONCURRENT_REQUESTS: 3 # 同時実行数制限
   ```

#### 4. 権限エラー

**症状**: `Permission denied` エラー

**解決方法**:

1. GitHub Personal Access Token の確認
2. リポジトリ権限の確認：
   ```bash
   # 必要な権限
   - issues: write
   - pull-requests: write
   - contents: read
   ```

### デバッグ用ワークフロー実行

問題の特定のため、デバッグモードでワークフローを実行：

```yaml
# .github/workflows/claude-debug.yml
name: Claude Debug

on:
  workflow_dispatch:
    inputs:
      debug_level:
        description: 'Debug level'
        default: 'verbose'

jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Debug Environment
        run: |
          echo "GITHUB_TOKEN status: ${{ secrets.GITHUB_TOKEN != '' }}"
          echo "ANTHROPIC_API_KEY status: ${{ secrets.ANTHROPIC_API_KEY != '' }}"
          echo "Repository: ${{ github.repository }}"
          echo "Actor: ${{ github.actor }}"
```

## 🔧 高度な設定

### 1. カスタム通知設定

Slack/Discord通知の設定：

```yaml
# Slack通知用ワークフロー追加
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    text: 'Claude AI processing completed: ${{ job.status }}'
```

### 2. カスタムラベルルール

Issue分類ルールのカスタマイズ（`scripts/claude-batch-process.js`）：

```javascript
const CUSTOM_CLASSIFICATION_RULES = {
  'pmbok-v7': {
    keywords: ['pmbok', '7版', 'performance domain'],
    priority: 'high',
    labels: ['pmbok-v7', 'enhancement'],
  },
  'mobile-pwa': {
    keywords: ['mobile', 'pwa', 'offline'],
    priority: 'high',
    labels: ['mobile', 'pwa', 'enhancement'],
  },
}
```

### 3. メトリクス収集の自動化

定期メトリクス収集の設定：

```yaml
# .github/workflows/metrics-collection.yml
on:
  schedule:
    - cron: '0 9 * * 1' # 毎週月曜日 9:00 JST

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Collect Metrics
        run: node scripts/claude-metrics.js --period=7d --output=dashboard
```

### 4. A/Bテスト設定

AI機能の効果測定：

```yaml
# 一部のIssueでのみAI機能を有効化
if: |
  github.event.issue.number % 10 < 5  # 50%のIssueでテスト
```

## 📊 監視・メンテナンス

### 1. 定期チェック項目

毎週確認すること：

- [ ] API使用量の確認（Anthropic Console）
- [ ] ワークフロー実行状況（GitHub Actions）
- [ ] エラーログの確認
- [ ] AI応答品質の確認

### 2. メトリクス監視

```bash
# 週次レポート生成
node scripts/claude-metrics.js --period=7d --output=file --format=csv

# ダッシュボード用データ生成
node scripts/claude-metrics.js --period=30d --output=dashboard
```

### 3. アップデート手順

Claude Code新機能の適用：

1. リリースノートの確認
2. テスト環境での動作確認
3. 段階的な本番適用
4. 効果測定とフィードバック収集

## 🆘 サポート・ヘルプ

### 問題報告

問題が発生した場合：

1. **GitHub Issue作成**: `AI Integration Feedback` ラベルを付けて報告
2. **ログの添付**: Actions実行ログの関連部分を添付
3. **再現手順**: 問題の再現手順を詳細に記載

### コミュニティサポート

- **GitHub Discussions**: 質問・情報共有
- **Slack/Discord**: リアルタイムサポート（設定されている場合）

### 追加リソース

- [Anthropic Documentation](https://docs.anthropic.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Claude Code AI Best Practices](https://github.com/anthropics/claude-code-examples)

---

## ✅ セットアップ完了チェックリスト

設定完了後、以下をすべてチェック：

- [ ] Anthropic APIキーを取得・設定完了
- [ ] GitHub SecretsにAPIキーを追加完了
- [ ] GitHub Actions権限設定完了
- [ ] ワークフローファイルがすべて配置完了
- [ ] Issue自動分類の動作確認完了
- [ ] @claudeメンション応答の動作確認完了
- [ ] PR自動レビューの動作確認完了
- [ ] エラーログの確認・問題解決完了
- [ ] メトリクス収集の動作確認完了（オプション）
- [ ] 通知設定の動作確認完了（オプション）

**すべてチェックが完了したら、Claude Code AI統合のセットアップは完了です！** 🎉

開発チームでの効率的な活用をお楽しみください。
