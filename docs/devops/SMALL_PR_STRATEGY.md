# Small PR戦略ガイドライン

## 目的
大規模な変更を小さく管理可能なPRに分割し、レビューの質を向上させ、マージ頻度を高める

## PR作成の原則

### 1. サイズの目安
- **理想**: 100-200行以内の変更
- **最大**: 400行（特別な理由がある場合のみ）
- **ファイル数**: 5ファイル以内を推奨

### 2. スコープの明確化
各PRは以下のいずれか1つに焦点を当てる：
- 1つの機能追加
- 1つのバグ修正
- 1つのリファクタリング
- 1つのドキュメント更新

### 3. 分割戦略

#### A. 機能開発の分割例
```
大きな機能: ユーザー認証システムの実装

分割されたPR:
1. PR#1: 認証用のデータモデル定義
2. PR#2: 認証APIエンドポイントの実装
3. PR#3: ログインUIコンポーネント
4. PR#4: セッション管理の実装
5. PR#5: テストの追加
```

#### B. リファクタリングの分割例
```
大規模リファクタリング: コンポーネント構造の改善

分割されたPR:
1. PR#1: 共通コンポーネントの抽出
2. PR#2: フォルダ構造の再編成
3. PR#3: import文の更新
4. PR#4: テストの更新
```

## ブランチ命名規則

```
<type>/<issue-number>-<short-description>

例:
feat/89-add-auth-system
fix/90-eslint-errors
refactor/91-component-structure
docs/92-api-documentation
chore/93-update-dependencies
```

### Type一覧
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `style`: コードスタイル
- `test`: テスト
- `chore`: 雑務・設定
- `perf`: パフォーマンス改善

## PR作成フロー

### 1. Issue作成または選択
```bash
# GitHubでIssueを確認
gh issue list --state open

# 新しいIssueを作成（必要な場合）
gh issue create --title "タイトル" --body "説明"
```

### 2. ブランチ作成
```bash
# Issue番号を含むブランチを作成
git checkout -b feat/89-feature-name

# または既存のIssueから
gh issue develop 89 --checkout
```

### 3. 小さなコミット
```bash
# 論理的な単位でコミット
git add src/components/NewComponent.jsx
git commit -m "feat: 新コンポーネント追加 #89"

git add src/components/NewComponent.test.jsx
git commit -m "test: NewComponentのテスト追加 #89"
```

### 4. PR作成
```bash
# インタラクティブにPR作成
gh pr create

# または直接作成
gh pr create --title "feat: 認証システムの基本実装 #89" \
  --body "$(cat <<EOF
## 概要
認証システムの基本機能を実装

## 変更内容
- ログインフォームの追加
- 認証APIの実装
- セッション管理

Closes #89
EOF
)"
```

## 自動化ツール

### PR自動作成スクリプト
```bash
# scripts/create-pr.sh
#!/bin/bash

ISSUE_NUMBER=$1
PR_TITLE=$2
PR_BODY=$3

# 現在のブランチ名を取得
BRANCH=$(git branch --show-current)

# Issue番号がブランチ名に含まれているか確認
if [[ ! "$BRANCH" =~ $ISSUE_NUMBER ]]; then
  echo "Error: Branch name must contain issue number #$ISSUE_NUMBER"
  exit 1
fi

# PR作成
gh pr create \
  --title "$PR_TITLE #$ISSUE_NUMBER" \
  --body "$PR_BODY" \
  --assignee @me
```

### 使用例
```bash
npm run pr:create 89 "feat: 認証システム追加" "ログイン機能の実装"
```

## レビュープロセス

### レビュアーの責任
1. **15分以内でレビュー可能**なサイズか確認
2. 単一の目的に焦点を当てているか確認
3. テストが含まれているか確認
4. ドキュメントが更新されているか確認

### 自動マージ条件
以下の条件を満たした場合、自動マージを検討：
- すべてのチェックがパス
- 承認済みレビュー1件以上
- コンフリクトなし
- 200行以下の変更

## メトリクス追跡

### 測定項目
- PR作成からマージまでの時間
- PR当たりの平均コメント数
- PR当たりの平均変更行数
- 週当たりのマージ数

### 目標値
- **マージまでの時間**: 24時間以内
- **PR当たりの変更行数**: 200行以下
- **週当たりのマージ数**: 10以上

## よくある質問

### Q: 大きな機能をどう分割すればいい？
A: まず垂直スライス（エンドツーエンドの小さな機能）で分割し、それでも大きい場合は水平スライス（レイヤーごと）で分割します。

### Q: 依存関係のあるPRはどう管理する？
A: ベースブランチを指定してPRを作成し、マージ順序を明確にします：
```bash
gh pr create --base feature/base-branch
```

### Q: 緊急の修正はどうする？
A: hotfixブランチを使用し、通常のフローをバイパスしますが、後でドキュメント化します：
```bash
git checkout -b hotfix/critical-bug
```

## 参考リンク
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Effective Pull Requests](https://github.blog/2015-01-21-how-to-write-the-perfect-pull-request/)