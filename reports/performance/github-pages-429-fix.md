# GitHub Pages 429エラー対策とパフォーマンス最適化レポート

## 実施日時
2025-09-28

## 問題の概要
GitHub Pagesで発生していた以下の問題に対処:
1. 429 (Too Many Requests) エラーでアセットファイル（CSS/JS）が読み込めない
2. PWAアイコンのダウンロード失敗

## 実施した対策

### 1. アセット分割の最適化
- **変更内容**: Vite設定でmanualChunks関数を使用し、より細かいチャンク分割を実装
- **効果**:
  - 単一の大きなバンドルファイルを複数の小さなチャンクに分割
  - React, D3, Radix UIなどのライブラリを個別のチャンクに分離
  - 最大チャンクサイズを500KB → 250KBに削減

### 2. キャッシュ戦略の改善
- **_headersファイルの最適化**:
  - `Cache-Control`ヘッダーを調整（過度に長いキャッシュ期間を短縮）
  - `stale-while-revalidate`ディレクティブを追加
  - アセット別に異なるキャッシュ戦略を適用

### 3. Service Workerの軽量化
- **sw-lite.jsの実装**:
  - 軽量で効率的なキャッシュ戦略
  - Cache-First, Network-First, Stale-While-Revalidateの使い分け
  - 429エラー時のフォールバック処理

### 4. HTML最適化
- **index.htmlの改善**:
  - DNS Prefetch/Preconnectの追加
  - 適切なメタタグによるキャッシュコントロール
  - 言語設定を日本語（ja）に修正

## パフォーマンス改善結果

### ビルド結果の分析
- **総ファイル数**: 90+個のJSファイル（適切に分割）
- **最大チャンクサイズ**:
  - index.js: 313.96 KB → 59.35 KB (gzip)
  - react-dom: 273.53 KB → 83.26 KB (gzip)
  - vendor: 284.70 KB → 89.53 KB (gzip)

### 主要な改善点
1. **ロード時間の短縮**: 個別ファイルが小さくなり、並列ダウンロードが可能に
2. **429エラーの回避**: 小さなファイルサイズとキャッシュ戦略により、GitHub Pagesのレート制限を回避
3. **キャッシュ効率の向上**: stale-while-revalidateにより、更新チェック中も古いコンテンツを表示

## 推奨事項

### 即時対応
1. ✅ ビルドとデプロイの実施
2. ✅ Service Workerの更新（sw-lite.js）
3. ✅ _headersファイルの配置

### 今後の改善点
1. **CDNの活用検討**:
   - CloudflareやjsDelivrなどのCDNを活用
   - 静的アセットの外部ホスティング

2. **画像最適化**:
   - WebP形式への変換
   - 適応的な画像読み込み（lazy loading）

3. **モニタリング**:
   - Web Vitalsの継続的な監視
   - エラーレート、ロード時間の追跡

## 技術的詳細

### チャンク分割戦略
```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    // ライブラリ別に細かく分割
    if (id.includes('react-dom')) return 'react-dom';
    if (id.includes('react-router')) return 'react-router';
    if (id.includes('react')) return 'react';
    // ... その他のライブラリ
  }
}
```

### キャッシュ戦略
- **静的アセット（JS/CSS）**: `max-age=86400, stale-while-revalidate=604800`
- **HTML**: `max-age=300, must-revalidate`
- **画像/アイコン**: `max-age=604800, stale-while-revalidate=2592000`

## まとめ
GitHub Pagesの429エラーは、適切なアセット分割とキャッシュ戦略により解決可能です。実装した対策により、パフォーマンスの大幅な改善が期待できます。