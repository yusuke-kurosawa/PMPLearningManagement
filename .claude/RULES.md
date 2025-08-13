# Claude Code ルール定義

## 基本ルール

### 1. コード実装ルール

#### 必須事項
- **Issue駆動開発（IDD）**: すべての変更はIssue番号を含むコミットメッセージで管理
- **再利用性**: 実装は再利用可能で完全なものにする
- **テスト駆動**: 新機能には必ず対応するテストを実装
- **ドキュメント化**: 複雑なロジックには必ずコメントを追加

#### 禁止事項
- 不要なファイルの作成（既存ファイルの編集を優先）
- プロアクティブなドキュメント作成（明示的に要求された場合のみ）
- console.log文の本番コードへの残留
- 未使用変数・関数の放置

### 2. コーディング標準

#### JavaScript/TypeScript
```javascript
// ✅ 良い例
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ 悪い例
function calc(i) {
  var total = 0;
  for(var x = 0; x < i.length; x++) {
    total += i[x].price;
  }
  return total;
}
```

#### React コンポーネント
```typescript
// ✅ 良い例: 関数コンポーネント + TypeScript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ 悪い例: any型、PropTypes
const Button = ({ onClick, children, variant }) => {
  // ...
};
```

### 3. コミットメッセージ規約

```bash
# フォーマット
<type>: <description> #<issue-number>

# 例
feat: ユーザー認証機能を追加 #123
fix: ログイン時のメモリリークを修正 #456
docs: API仕様書を更新 #789
```

#### タイプ一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: バグ修正や機能追加ではないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### 4. ファイル命名規則

```
# コンポーネント: PascalCase
UserProfile.tsx
AuthenticationForm.jsx

# ユーティリティ: camelCase
formatDate.ts
validateEmail.js

# 定数: UPPER_SNAKE_CASE
API_ENDPOINTS.ts
ERROR_MESSAGES.js

# CSS/SCSS: kebab-case
user-profile.css
authentication-form.scss
```

### 5. ディレクトリ構造

```
src/
├── components/       # UIコンポーネント
│   ├── common/      # 共通コンポーネント
│   ├── features/    # 機能別コンポーネント
│   └── layouts/     # レイアウトコンポーネント
├── hooks/           # カスタムフック
├── services/        # ビジネスロジック・API通信
├── utils/           # ユーティリティ関数
├── types/           # TypeScript型定義
└── stores/          # 状態管理

docs/
├── api/            # API仕様書
├── architecture/   # アーキテクチャ設計書
├── guides/         # 開発ガイド
└── reports/        # レポート・分析結果

.claude/
├── agents/         # エージェント定義
├── prompts/        # プロンプトテンプレート
├── context/        # プロジェクトコンテキスト
└── scripts/        # 自動化スクリプト
```

## 品質基準

### 1. コード品質メトリクス

| メトリクス | 目標値 | 現在値 |
|---------|-------|-------|
| テストカバレッジ | > 80% | 80.1% |
| 循環複雑度 | < 10 | 0 |
| 技術債務 | < 30 | 23 |
| ESLintエラー | 0 | 41 |
| TypeScript型カバレッジ | > 90% | - |

### 2. パフォーマンス基準

| メトリクス | 目標値 | 測定方法 |
|---------|-------|---------|
| First Contentful Paint | < 1.8s | Lighthouse |
| Time to Interactive | < 3.9s | Lighthouse |
| Bundle Size | < 1MB | webpack-bundle-analyzer |
| API Response Time | < 200ms | Performance monitoring |

### 3. アクセシビリティ基準

- WCAG 2.1 Level AA準拠
- キーボードナビゲーション完全対応
- スクリーンリーダー対応
- カラーコントラスト比 4.5:1以上

## セキュリティルール

### 1. 認証・認可

```typescript
// 必須: すべての保護されたルートで認証チェック
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};
```

### 2. データ検証

```typescript
// 必須: 入力値の検証とサニタイゼーション
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  name: z.string().min(1).max(100)
});

// 使用例
const validateUser = (data: unknown) => {
  return UserSchema.parse(data);
};
```

### 3. 環境変数管理

```typescript
// ✅ 良い例: 環境変数の型安全な管理
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// ❌ 悪い例: ハードコードされた機密情報
const apiKey = 'sk-1234567890abcdef';
```

## CI/CD ルール

### 1. プルリクエスト要件

- [ ] すべてのテストが通過
- [ ] ESLintエラーなし
- [ ] テストカバレッジ80%以上
- [ ] コードレビュー承認済み
- [ ] IDD準拠（Issue番号含む）

### 2. デプロイメント基準

```yaml
# 本番デプロイ前チェックリスト
- Lighthouse スコア 90以上
- セキュリティ脆弱性なし
- パフォーマンスバジェット内
- E2Eテスト通過
- ステージング環境での検証完了
```

## エラーハンドリング

### 1. グローバルエラーハンドラー

```typescript
// 必須: エラーバウンダリの実装
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // エラーログ送信
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 2. API エラー処理

```typescript
// 必須: 適切なエラーハンドリング
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  // ユーザーフレンドリーなエラーメッセージ
  toast.error('データの取得に失敗しました。しばらく後にお試しください。');
  // 詳細ログ（開発環境のみ）
  if (isDevelopment) {
    console.error('API Error:', error);
  }
  // エラー監視サービスへの送信
  reportError(error);
}
```

## モニタリング・ログ

### 1. ログレベル

```typescript
enum LogLevel {
  ERROR = 0,   // エラー: 即座に対応が必要
  WARN = 1,    // 警告: 注意が必要
  INFO = 2,    // 情報: 通常の動作
  DEBUG = 3,   // デバッグ: 開発時の詳細情報
}

// 使用例
logger.error('Payment processing failed', { userId, amount, error });
logger.warn('API rate limit approaching', { remaining: 10 });
logger.info('User login successful', { userId });
logger.debug('Cache hit', { key, value });
```

### 2. パフォーマンス監視

```typescript
// 必須: 重要な処理の計測
const measurePerformance = async (name: string, fn: () => Promise<void>) => {
  const start = performance.now();
  try {
    await fn();
  } finally {
    const duration = performance.now() - start;
    metrics.record(name, duration);
    if (duration > THRESHOLD) {
      logger.warn(`Slow operation: ${name}`, { duration });
    }
  }
};
```

## 責任範囲

### Claude Code Assistant の責任

1. **コード品質の維持**
   - ESLintエラーの解消
   - TypeScript型の適切な定義
   - テストカバレッジの維持

2. **ベストプラクティスの適用**
   - デザインパターンの適切な使用
   - パフォーマンス最適化
   - セキュリティ考慮

3. **ドキュメント管理**
   - コードコメントの追加
   - 技術仕様書の更新
   - API仕様の維持

### 開発者の責任

1. **ビジネスロジックの定義**
2. **要件の明確化**
3. **最終的な品質保証**
4. **本番環境へのデプロイ承認**

---

最終更新: 2025-08-12
バージョン: 1.0.0