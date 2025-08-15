# Claude AI統合クイックスタートガイド

## 🚀 はじめに

このガイドでは、PMPLearningManagementプロジェクトでClaude AI統合を使い始める方法を説明します。

## 📋 前提条件

### 必須要件

- GitHubリポジトリへのアクセス権限
- Anthropic API Key（Claude API）
- GitHub CLI（オプション、テスト用）

## 🔧 セットアップ手順

### ステップ1: APIキーの設定

1. GitHubリポジトリにアクセス
2. **Settings** → **Secrets and variables** → **Actions** を開く
3. **New repository secret** をクリック
4. 以下を入力:
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのClaude APIキー
5. **Add secret** をクリック

### ステップ2: GitHub Actions権限の確認

1. **Settings** → **Actions** → **General** を開く
2. 以下を設定:
   - Actions permissions: **Allow all actions and reusable workflows**
   - Workflow permissions: **Read and write permissions**
3. **Save** をクリック

### ステップ3: 動作確認

```bash
# テストスクリプトを実行
./scripts/test-claude-integration.sh

# または手動でテスト
gh issue create --title "Test" --body "@claude Hello!"
```

## 💬 使い方

### 1. Claude Assistantの使用（@claudeメンション）

#### Issueでの質問

```markdown
@claude このバグの原因を分析してください

詳細:

- エラーメッセージ: ...
- 再現手順: ...
```

#### コメントでの相談

````markdown
@claude このコードの改善点を教えてください

```javascript
// コードをここに貼り付け
```
````

````

### 2. 自動Issue分析

新しいIssueを作成すると、自動的に:
- 適切なラベルが付与されます
- 優先度が設定されます
- 分析結果がコメントされます

### 3. 自動PRレビュー

Pull Requestを作成すると、自動的に:
- コード変更が分析されます
- レビューコメントが投稿されます
- 改善提案が提供されます

## 📊 監視とレポート

### ステータス確認
```bash
# 監視スクリプトを実行
./scripts/monitor-claude-integration.sh
````

### GitHub Actionsでの確認

1. リポジトリの **Actions** タブを開く
2. ワークフロー実行履歴を確認
3. 各ワークフローのログを確認

## 🎯 ベストプラクティス

### 効果的な@claudeメンションの書き方

#### 良い例 ✅

```markdown
@claude このエラーを解決する方法を教えてください:

エラー内容:
TypeError: Cannot read property 'map' of undefined

発生箇所:
src/components/List.jsx line 42

コンテキスト:
APIからデータを取得した後に発生
```

#### 悪い例 ❌

```markdown
@claude バグがあります。助けて！
```

### Issue作成のコツ

#### 構造化された情報提供

```markdown
## 問題の概要

[簡潔な説明]

## 期待される動作

[どうあるべきか]

## 実際の動作

[現在どうなっているか]

## 再現手順

1. [ステップ1]
2. [ステップ2]

## 環境

- OS:
- ブラウザ:
- バージョン:
```

## ⚠️ トラブルシューティング

### Claude応答がない場合

1. **APIキーを確認**
   - Settings → Secrets → ANTHROPIC_API_KEY が設定されているか

2. **Actions権限を確認**
   - ワークフローの書き込み権限があるか

3. **ワークフローログを確認**
   - Actions タブでエラーメッセージを確認

### よくあるエラーと解決方法

| エラー                       | 原因               | 解決方法                           |
| ---------------------------- | ------------------ | ---------------------------------- |
| `Error: Bad credentials`     | GitHub権限不足     | Workflow permissionsを確認         |
| `Error: API key invalid`     | APIキー設定ミス    | Secretsを再設定                    |
| `Error: Rate limit exceeded` | API制限超過        | 時間を置いて再試行                 |
| `Workflow not triggered`     | トリガー条件不一致 | Issueに@claudeが含まれているか確認 |

## 📈 使用制限と注意事項

### API使用量

- Claude API: 月間制限あり（プランによる）
- 1リクエストあたり最大1024トークン

### レスポンス時間

- 通常: 10-30秒
- 高負荷時: 最大60秒

### セキュリティ

- センシティブ情報を含めない
- 個人情報を共有しない
- コードの機密部分は除外する

## 🔄 アップデートとメンテナンス

### ワークフローの更新

```bash
# 最新版を取得
git pull origin main

# ワークフローを確認
ls -la .github/workflows/
```

### モデルのアップグレード

現在使用中: `claude-3-sonnet-20240229`

より高性能なモデルへの変更:

1. ワークフローファイルを編集
2. `model` パラメータを変更
3. コミット&プッシュ

## 📚 関連リソース

- [Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [プロジェクトREADME](../README.md)
- [詳細な検証レポート](./CLAUDE_INTEGRATION_VERIFICATION_REPORT.md)

## 🆘 サポート

問題が発生した場合:

1. [トラブルシューティングガイド](./CLAUDE_INTEGRATION_VERIFICATION_REPORT.md#トラブルシューティング)を確認
2. [GitHub Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)で質問
3. 監視スクリプトでステータス確認: `./scripts/monitor-claude-integration.sh`

---

_最終更新: 2025年1月9日_  
_バージョン: 1.0.0_
