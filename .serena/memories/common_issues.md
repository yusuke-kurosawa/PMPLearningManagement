# Common Issues and Solutions

## 🔧 ビルド・デプロイエラー

### 1. GitHub Pages 404エラー
**症状**: デプロイ後、ページが表示されない
```bash
# 解決方法
1. HashRouterの使用を確認
2. vite.config.mjsのbase設定確認: base: '/PMPLearningManagement/'
3. npm run deploy を実行
4. 2-5分待ってからリロード
```

### 2. Viteビルドエラー
**症状**: npm run build が失敗
```bash
# 解決方法
npm run clean:all
npm install
npm run build

# TypeScriptエラーの場合
npm run typecheck
# エラーを修正後、再度ビルド
```

### 3. メモリ不足エラー
**症状**: JavaScript heap out of memory
```bash
# 解決方法
NODE_OPTIONS="--max-old-space-size=4096" npm run build
# または package.json のスクリプトに追加
```

## 🔐 認証関連

### 1. Supabase接続エラー
**症状**: Authentication failed
```bash
# 環境変数確認
cat .env | grep SUPABASE

# .envファイル作成（未作成の場合）
cp .env.example .env
# Supabaseの認証情報を設定
```

### 2. JWT トークン期限切れ
**症状**: Unauthorized after login
```javascript
// src/lib/auth/supabase.js で設定確認
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
})
```

## ⚡ パフォーマンス問題

### 1. 初期ロードが遅い
```bash
# バンドル分析
npm run build:analyze

# 不要な依存関係削除
npm ls --depth=0
# 未使用パッケージ削除

# Code Splitting確認
# React.lazyの使用を増やす
```

### 2. D3.js レンダリング遅延
```javascript
// メモ化を適用
const MemoizedGraph = React.memo(D3Graph, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data
})

// デバウンスを適用
const debouncedUpdate = useDebounce(updateGraph, 300)
```

## 🧪 テスト関連

### 1. Playwright インストールエラー
```bash
# ブラウザのインストール
npx playwright install --with-deps

# 特定ブラウザのみ
npx playwright install chromium
```

### 2. Vitest カバレッジエラー
```bash
# カバレッジレポーターの再インストール
npm install -D @vitest/coverage-v8

# カバレッジ実行
npm run test:coverage
```

## 📱 モバイル対応

### 1. タッチイベントが動作しない
```javascript
// src/hooks/useTouchGestures.ts 確認
// PointerEvents APIの使用を推奨
```

### 2. PWA インストールできない
```bash
# Service Worker確認
# public/sw-optimized.js が存在することを確認

# manifest.json 検証
# public/manifest.json のアイコンパス確認
```

## 🔄 状態管理

### 1. Zustand ストア更新されない
```javascript
// useShallow比較を追加
import { shallow } from 'zustand/shallow'

const data = useStore(
  (state) => ({ items: state.items }),
  shallow
)
```

### 2. Context 再レンダリング過多
```javascript
// Context分割を検討
// 大きなContextを小さく分割

// useMemo使用
const contextValue = useMemo(() => ({
  // values
}), [dependencies])
```

## 🛠️ 開発環境

### 1. ESLint エラーが消えない
```bash
# ESLintキャッシュクリア
rm -rf node_modules/.cache/eslint-loader
npm run lint:fix

# VSCode再起動
```

### 2. Hot Reloadが効かない
```bash
# Vite キャッシュクリア
rm -rf node_modules/.vite
npm run dev

# ポート変更
vite --port 3000
```

## 🚀 トラブルシューティングコマンド

```bash
# 完全リセット
npm run clean:all && npm install

# 依存関係チェック
npm audit fix
npm outdated

# プロジェクト検証
npm run idd:check
npm run quality:check

# ログ確認
tail -f *.log

# プロセス確認（ポート使用）
lsof -i :5173
```

## 📞 サポート

問題が解決しない場合：
1. GitHub Issues で報告
2. エラーログを含める
3. 再現手順を記載
4. 環境情報を追加（Node version等）