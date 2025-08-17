# 📋 Rules ディレクトリ

## 概要

このディレクトリはプロジェクト全体の開発ルール、コーディング規約、運用ガイドラインを管理します。

## ファイル構成

### 必須ルール

- **eslint-rules.md** - ESLint設定とコード品質ルール
- **github-actions-rules.md** - GitHub Actionsワークフロー作成規則
- **workflow-comment-rules.md** - ワークフローコメント記載ルール

### 推奨ルール

- **naming-conventions.md** - 命名規則（ファイル、変数、関数）
- **commit-message-rules.md** - コミットメッセージフォーマット
- **pr-template-rules.md** - プルリクエストテンプレート規則
- **documentation-rules.md** - ドキュメント作成ガイドライン

## 使用方法

```bash
# ルール確認
cat .claude/rules/eslint-rules.md

# ルール検証
npm run validate:rules

# ルール適用チェック
npm run check:compliance
```

## ルール優先度

1. **🔴 必須（MUST）** - 違反は許可されない
2. **🟡 推奨（SHOULD）** - 特別な理由がない限り従う
3. **🟢 任意（MAY）** - プロジェクトの状況に応じて適用

## 更新ポリシー

- ルール変更は必ずPRでレビュー
- 重大な変更はチーム全体で協議
- 変更履歴を記録

---

最終更新: 2025-08-15