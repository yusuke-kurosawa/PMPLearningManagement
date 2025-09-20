# セキュリティアーキテクチャチェックリスト

## 認証・認可セキュリティ

### Supabase認証統合
```typescript
// 安全な認証フロー
const { data: { user }, error } = await supabase.auth.getUser();
if (error) {
  // エラーハンドリング
  console.error('認証エラー:', error.message);
  redirectToLogin();
}

// JWTトークンの検証
const { data, error } = await supabase
  .from('protected_table')
  .select('*')
  .eq('user_id', user.id); // RLS (Row Level Security) 適用
```

### JWT セキュリティ
- [ ] トークンの適切な保存（HttpOnly Cookieまたはメモリ）
- [ ] 短期間の有効期限設定（15-30分）
- [ ] Refresh Tokenによる自動更新
- [ ] トークン無効化メカニズム

## フロントエンドセキュリティ

### XSS (Cross-Site Scripting) 対策
```typescript
// 安全なHTML出力（React標準）
const SafeComponent = ({ userInput }: { userInput: string }) => {
  return <div>{userInput}</div>; // 自動エスケープ
};

// 危険なパターン（避ける）
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // XSS脆弱性
};

// 安全なHTML表示（必要な場合）
import DOMPurify from 'dompurify';
const SafeHTMLComponent = ({ html }: { html: string }) => {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

### 入力検証 (Zod Schema)
```typescript
import { z } from 'zod';

// ユーザー入力の検証
const UserInputSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  age: z.number().min(18).max(120),
  profile: z.string().max(500, 'プロフィールは500文字以内で入力してください')
});

// フォーム検証の実装
const validateUserInput = (input: unknown) => {
  try {
    const validatedData = UserInputSchema.parse(input);
    return { success: true, data: validatedData };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};
```

## GitHub Pages セキュリティ

### Content Security Policy (CSP)
```html
<!-- index.html に追加 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### HTTPS強制
```javascript
// Service Worker での HTTPS リダイレクト
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    const httpsUrl = url.href.replace('http:', 'https:');
    event.respondWith(Response.redirect(httpsUrl, 301));
  }
});
```

## API セキュリティ

### 安全なAPIコール
```typescript
// APIクライアントの設定
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 認証ヘッダーの追加
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー時の処理
      handleAuthError();
    }
    return Promise.reject(error);
  }
);
```

### レート制限対策
```typescript
// クライアントサイドのレート制限
import { throttle } from 'lodash';

const throttledApiCall = throttle(async (data) => {
  return await apiClient.post('/api/data', data);
}, 1000); // 1秒に1回まで
```

## セキュリティ監査チェックリスト

### 定期的な確認項目
- [ ] 依存関係の脆弱性チェック（npm audit）
- [ ] OWASP Top 10の対策確認
- [ ] 認証フローのセキュリティテスト
- [ ] XSS・CSRF攻撃のテストケース実行
- [ ] セキュリティヘッダーの設定確認

### ツールによる自動チェック
```bash
# セキュリティ脆弱性スキャン
npm audit --audit-level moderate

# ESLintセキュリティルール
npm install --save-dev eslint-plugin-security
# .eslintrc.js に追加: "plugin:security/recommended"

# Snyk による依存関係チェック
npx snyk test
```

## インシデント対応

### セキュリティインシデント発生時の対応手順
1. **即座の対応**
   - 影響範囲の特定
   - サービスの一時停止（必要に応じて）
   - 関係者への通知

2. **調査・分析**
   - ログの確認と保存
   - 攻撃手法の特定
   - 影響を受けたデータの特定

3. **復旧・対策**
   - 脆弱性の修正
   - セキュリティパッチの適用
   - 追加のセキュリティ対策実装

4. **事後対応**
   - インシデントレポートの作成
   - 再発防止策の策定
   - セキュリティポリシーの見直し