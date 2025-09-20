# Performance Optimization Guide

## 🚀 Core Web Vitals 最適化

### 目標値
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: < 200ms

### 測定方法
```javascript
// src/utils/performance-monitor.ts
import { getCLS, getFID, getLCP, getINP } from 'web-vitals'

export const reportWebVitals = (onReport) => {
  getCLS(onReport)
  getFID(onReport)
  getLCP(onReport)
  getINP(onReport)
}

// main.tsx で使用
reportWebVitals((metric) => {
  console.log(metric)
  // Google Analytics送信など
})
```

## 📦 バンドルサイズ最適化

### 現在の目標: 1.3MB → 1.0MB以下

### 1. Code Splitting 戦略
```javascript
// ルートレベル分割
const PMBOKMatrix = lazy(() => import('./pages/PMBOKMatrix'))
const MockExam = lazy(() => import('./components/learning/MockExam'))

// 重いライブラリの分割
const D3Visualization = lazy(() => 
  import('./components/visualizations/D3Visualization')
)

// Suspense でラップ
<Suspense fallback={<LoadingSpinner />}>
  <PMBOKMatrix />
</Suspense>
```

### 2. Tree Shaking 最適化
```javascript
// ❌ Bad - 全体インポート
import * as d3 from 'd3'

// ✅ Good - 必要な関数のみ
import { select, scaleLinear, axisBottom } from 'd3'

// Lodashの場合
import debounce from 'lodash/debounce' // 個別インポート
```

### 3. Dynamic Imports
```javascript
// 条件付きインポート
const loadHeavyFeature = async () => {
  if (userNeedsFeature) {
    const { HeavyComponent } = await import('./HeavyComponent')
    return HeavyComponent
  }
}
```

## ⚡ レンダリング最適化

### 1. React.memo 使用
```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.data.id === nextProps.data.id
})
```

### 2. useMemo/useCallback
```javascript
// 重い計算のメモ化
const processedData = useMemo(() => {
  return heavyProcessing(rawData)
}, [rawData])

// 関数のメモ化
const handleClick = useCallback((id) => {
  dispatch({ type: 'SELECT', id })
}, [dispatch])
```

### 3. Virtual Scrolling
```javascript
// react-window 使用例
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
  width='100%'
>
  {({ index, style }) => (
    <div style={style}>
      Row {index}
    </div>
  )}
</FixedSizeList>
```

## 🎨 画像最適化

### 1. 最適なフォーマット選択
```javascript
// 次世代フォーマット対応
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.avif" type="image/avif" />
  <img src="image.jpg" alt="" loading="lazy" />
</picture>
```

### 2. レスポンシブ画像
```javascript
<img
  srcSet="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
  src="medium.jpg"
  loading="lazy"
  decoding="async"
/>
```

## 💾 キャッシュ戦略

### 1. Service Worker 実装
```javascript
// public/sw-optimized.js
const CACHE_NAME = 'pmp-v1'
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})
```

### 2. HTTP キャッシュヘッダー
```javascript
// Vite設定でhash付きファイル名
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]'
    }
  }
}
```

## 🔄 状態管理最適化

### 1. Zustand セレクター最適化
```javascript
// ❌ Bad - 全体購読
const state = useStore()

// ✅ Good - 必要な部分のみ
const items = useStore(state => state.items)
const count = useStore(state => state.items.length)
```

### 2. Context 分割
```javascript
// 大きなContextを分割
<ThemeContext.Provider>
  <AuthContext.Provider>
    <DataContext.Provider>
      <App />
    </DataContext.Provider>
  </AuthContext.Provider>
</ThemeContext.Provider>
```

## 📊 パフォーマンス監視

### 1. React DevTools Profiler
```javascript
import { Profiler } from 'react'

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
}
```

### 2. Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://yusuke-kurosawa.github.io/PMPLearningManagement/
    uploadArtifacts: true
    temporaryPublicStorage: true
```

## 🛠️ Vite 最適化設定

```javascript
// vite.config.mjs
export default defineConfig({
  build: {
    // Terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    // チャンク分割戦略
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          d3: ['d3', 'd3-sankey'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    
    // アセット最適化
    assetsInlineLimit: 4096, // 4KB以下はインライン化
    chunkSizeWarningLimit: 500
  },
  
  // 依存関係の事前最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'd3'],
    exclude: ['@stryker-mutator/core']
  }
})
```

## 📈 測定コマンド

```bash
# バンドルサイズ分析
npm run build:analyze

# Lighthouse実行
npx lighthouse https://localhost:5173 --view

# パフォーマンステスト
npm run test:e2e:performance

# メモリリーク検出
npm run test:memory
```

## ⚠️ よくある問題と解決策

### 1. 初期ロードが遅い
- Code Splitting実装
- Critical CSSのインライン化
- Preload/Prefetch使用

### 2. インタラクションが遅い
- デバウンス/スロットル実装
- Virtual Scrolling導入
- Web Worker活用

### 3. メモリリーク
- useEffectクリーンアップ確認
- イベントリスナー削除
- タイマークリア

## 🎯 チェックリスト

- [ ] Core Web Vitals 目標値達成
- [ ] バンドルサイズ 1.5MB以下
- [ ] Lighthouse スコア 90以上
- [ ] 初期ロード 3秒以内
- [ ] TTI (Time to Interactive) 5秒以内
- [ ] メモリ使用量監視
- [ ] Service Worker実装
- [ ] 画像最適化完了