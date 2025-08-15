# 📄 Templates ディレクトリ

## 概要

プロジェクトで使用する各種テンプレート（コンポーネント、サービス、テスト、ドキュメント）を管理します。

## ディレクトリ構造

```
templates/
├── component/           # Reactコンポーネントテンプレート
│   ├── basic/          # 基本コンポーネント
│   ├── page/           # ページコンポーネント
│   ├── layout/         # レイアウトコンポーネント
│   └── hook/           # カスタムフック
│
├── service/            # サービス層テンプレート
│   ├── api/           # API統合サービス
│   ├── auth/          # 認証サービス
│   ├── data/          # データ管理サービス
│   └── utility/       # ユーティリティサービス
│
├── test/              # テストテンプレート
│   ├── unit/          # 単体テスト
│   ├── integration/   # 統合テスト
│   ├── e2e/           # E2Eテスト
│   └── performance/   # パフォーマンステスト
│
├── documentation/     # ドキュメントテンプレート
│   ├── api/          # API仕様書
│   ├── architecture/ # アーキテクチャ文書
│   ├── guide/        # ガイド文書
│   └── readme/       # README
│
└── config/           # 設定ファイルテンプレート
    ├── eslint/       # ESLint設定
    ├── prettier/     # Prettier設定
    ├── typescript/   # TypeScript設定
    └── vite/         # Vite設定
```

## テンプレート使用方法

### コンポーネント作成

```bash
# 基本コンポーネント作成
npm run generate:component -- --name MyComponent --type basic

# ページコンポーネント作成
npm run generate:page -- --name HomePage --route /home

# カスタムフック作成
npm run generate:hook -- --name useMyHook
```

### サービス作成

```bash
# APIサービス作成
npm run generate:service -- --name UserService --type api

# 認証サービス作成
npm run generate:auth-service -- --provider supabase
```

### テスト作成

```bash
# 単体テスト作成
npm run generate:test -- --target ComponentName --type unit

# E2Eテスト作成
npm run generate:e2e -- --flow user-registration
```

## テンプレート例

### 📦 Reactコンポーネント

```typescript
// templates/component/basic/Component.tsx.template
import React, { FC, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface {{ComponentName}}Props {
  className?: string
  // プロパティ定義
}

/**
 * {{ComponentName}} コンポーネント
 * 
 * @description {{Description}}
 */
export const {{ComponentName}}: FC<{{ComponentName}}Props> = ({
  className,
  ...props
}) => {
  // 状態管理
  const [state, setState] = useState<unknown>(null)

  // 副作用
  useEffect(() => {
    // 初期化処理
  }, [])

  return (
    <div className={cn('{{component-name}}', className)} {...props}>
      {/* コンポーネント内容 */}
    </div>
  )
}

{{ComponentName}}.displayName = '{{ComponentName}}'

export default {{ComponentName}}
```

### 🧪 テストテンプレート

```typescript
// templates/test/unit/Component.test.tsx.template
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { {{ComponentName}} } from '../{{ComponentName}}'

describe('{{ComponentName}}', () => {
  // セットアップ
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(<{{ComponentName}} />)
      expect(screen.getByRole('{{role}}')).toBeInTheDocument()
    })
  })

  describe('インタラクション', () => {
    it('クリック時に正しく動作する', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<{{ComponentName}} onClick={handleClick} />)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('プロパティ', () => {
    it('カスタムクラスが適用される', () => {
      const { container } = render(
        <{{ComponentName}} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
```

### 📑 ドキュメントテンプレート

```markdown
# {{DocumentTitle}}

## 概要

{{Overview}}

## 目的

{{Purpose}}

## 詳細

### セクション1

{{Section1Content}}

### セクション2

{{Section2Content}}

## 使用方法

\`\`\`bash
# コマンド例
{{CommandExample}}
\`\`\`

## API仕様

| エンドポイント | メソッド | 説明 |
|--------------|--------|------|
| {{Endpoint}} | {{Method}} | {{Description}} |

## 注意事項

- {{Note1}}
- {{Note2}}

## 参考資料

- [リンク1]({{Link1}})
- [リンク2]({{Link2}})

---

最終更新: {{UpdateDate}}
作成者: {{Author}}
```

## テンプレート変数

### 利用可能な変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{{ComponentName}}` | コンポーネント名 | `UserProfile` |
| `{{component-name}}` | ケバブケース名 | `user-profile` |
| `{{Description}}` | 説明文 | `ユーザープロフィール表示` |
| `{{Author}}` | 作成者 | `開発チーム` |
| `{{Date}}` | 作成日 | `2025-08-15` |

### カスタム変数定義

```json
// template.config.json
{
  "variables": {
    "projectName": "PMPLearningManagement",
    "organization": "PMP Learning Team",
    "defaultLicense": "MIT"
  }
}
```

## 生成スクリプト

### CLIツール

```bash
# インタラクティブモード
npm run generate

# 選択肢:
? What would you like to generate?
  > Component
    Service
    Test
    Documentation
```

### プログラマティック使用

```javascript
// scripts/generate.js
const { generateFromTemplate } = require('./.claude/templates/generator')

generateFromTemplate({
  template: 'component/basic',
  output: 'src/components/MyComponent',
  variables: {
    ComponentName: 'MyComponent',
    Description: 'カスタムコンポーネント'
  }
})
```

## ベストプラクティス

### ✅ 推奨事項

1. **一貫性の維持**
   - テンプレートを使用して統一性確保
   - プロジェクト規約の遵守

2. **カスタマイズ**
   - プロジェクト固有の要件に合わせて調整
   - 不要な部分は削除

3. **更新管理**
   - テンプレートの定期的な見直し
   - 新しいパターンの追加

### ❌ 避けるべきこと

1. **過度な汎用化**
   - 複雑すぎるテンプレート
   - 使いにくい抽象化

2. **古いパターン**
   - 非推奨のAPIの使用
   - アンチパターンの含有

---

最終更新: 2025-08-15  
テンプレート数: 25+