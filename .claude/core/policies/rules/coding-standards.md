# コーディング標準

このドキュメントは、PMPLearningManagementプロジェクトのコーディング標準を定義します。

## 📝 基本原則

1. **言語**: TypeScriptで統一
2. **コメント**: 日本語で記述
3. **命名規則**: 英語でcamelCase/PascalCase
4. **再利用性**: DRY原則の遵守
5. **完全性**: エラーハンドリングの徹底

## 🔧 TypeScript標準

### 型定義

- `any`型の使用を最小限に
- 明示的な型定義を推奨
- ジェネリック型の活用
- `unknown`型の適切な使用

```typescript
// ❌ 悪い例
function processData(data: any) {
  return data.value
}

// ✅ 良い例
function processData<T extends { value: string }>(data: T): string {
  return data.value
}
```

### 未使用変数

- 未使用変数には`_`プレフィックスを付与
- 本当に不要な場合は削除

```typescript
// ❌ 悪い例
const result = compute() // 使用されない

// ✅ 良い例
const _result = compute() // 意図的に未使用
```

## 📁 ファイル構成

### ディレクトリ構造

```
src/
├── components/     # UIコンポーネント
├── services/       # ビジネスロジック
├── lib/           # ユーティリティ
├── types/         # 型定義
└── hooks/         # カスタムフック
```

### ファイル命名

- コンポーネント: PascalCase.tsx
- サービス: camelCase.ts
- 型定義: types.ts
- テスト: \*.test.ts

## 💬 コメント規則

### ファイルヘッダー

```typescript
/**
 * ファイル名: ComponentName.tsx
 * 概要: コンポーネントの説明
 * 作成日: YYYY-MM-DD
 * 更新履歴: Issue #XXX - 変更内容
 */
```

### 関数コメント

```typescript
/**
 * 関数の説明
 * @param {型} param - パラメータの説明
 * @returns {型} 戻り値の説明
 * @throws {Error} エラーの説明
 */
```

### インラインコメント

```typescript
// 処理の説明（日本語）
const result = complexCalculation()

// TODO: Issue #XXX - 改善予定の内容
// FIXME: Issue #XXX - 修正が必要な箇所
// NOTE: 重要な注意事項
```

## 🎨 フォーマット

### ESLint設定

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "varsIgnorePattern": "^_"
      }
    ]
  }
}
```

### Prettier設定

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## ⚛️ React/コンポーネント

### 基本構造

```typescript
import React, { FC, useState, useEffect } from 'react';

/**
 * コンポーネントの説明
 */
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export const ComponentName: FC<ComponentProps> = ({ title, onAction }) => {
  // State管理
  const [state, setState] = useState<string>('');

  // 副作用
  useEffect(() => {
    // 初期化処理
  }, []);

  // イベントハンドラー
  const handleClick = () => {
    onAction?.();
  };

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>アクション</button>
    </div>
  );
};
```

### Hooks使用規則

- カスタムフックは`use`プレフィックス
- 条件分岐内でのHooks使用禁止
- 依存配列の適切な管理

## 🔐 セキュリティ

### 基本原則

- 秘密情報のハードコーディング禁止
- 環境変数の使用
- 入力値の検証
- XSS対策の徹底

### 認証・認可

```typescript
// 認証チェック
if (!user.isAuthenticated) {
  throw new UnauthorizedError('認証が必要です')
}

// 権限チェック
if (!user.hasPermission('admin')) {
  throw new ForbiddenError('権限がありません')
}
```

## 🧪 テスト

### テスト構造

```typescript
describe('ComponentName', () => {
  // セットアップ
  beforeEach(() => {
    // 初期化
  })

  // 正常系テスト
  it('正常に動作すること', () => {
    // テスト実装
  })

  // 異常系テスト
  it('エラー時に適切に処理されること', () => {
    // テスト実装
  })
})
```

### カバレッジ目標

- 単体テスト: 80%以上
- 統合テスト: 重要フロー100%
- E2Eテスト: 主要シナリオ100%

## 📊 パフォーマンス

### 最適化原則

- 不要な再レンダリング防止
- メモ化の適切な使用
- 遅延ローディング
- バンドルサイズの最適化

```typescript
// メモ化の例
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props)
}, [props.dependency])

const memoizedCallback = useCallback(() => {
  doSomething(value)
}, [value])
```

## 🚀 デプロイメント

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### コミットメッセージ

```
<type>: <subject> #<issue-number>

<body>

<footer>
```

Types:

- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト
- chore: 雑務

## 📋 チェックリスト

### PR提出前

- [ ] ESLintエラー: 0個
- [ ] ESLint警告: 最小限
- [ ] TypeScript型エラー: 0個
- [ ] テスト: 全て成功
- [ ] カバレッジ: 80%以上
- [ ] コメント: 日本語で記述
- [ ] Issue番号: コミットに含む

### レビュー観点

- [ ] コード品質
- [ ] セキュリティ
- [ ] パフォーマンス
- [ ] 保守性
- [ ] テスト充実度

---

最終更新: 2025-08-14
Issue: #92 - コーディング標準の策定
