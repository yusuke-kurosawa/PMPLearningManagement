# インフラストラクチャ・DevOps設計書

## エグゼクティブサマリー

PMPLearningManagementは、GitHub Pagesでホストされる静的React SPAです。本ドキュメントは、現在の**ゼロコスト**インフラストラクチャの実態と、将来の段階的な成長戦略を提供します。

### 現在の構成
- **ホスティング**: GitHub Pages（無料）
- **CI/CD**: GitHub Actions（無料枠内）
- **データ永続化**: ブラウザのLocalStorage
- **月額コスト**: $0

## 1. 現在のインフラストラクチャ構成

### 1.1 静的サイトホスティング

```yaml
# 現在の構成
Infrastructure:
  Hosting:
    Provider: GitHub Pages
    URL: https://yusuke-kurosawa.github.io/PMPLearningManagement/
    Cost: $0/月
    
  Build:
    Tool: Vite
    Output: dist/
    
  Deployment:
    Method: GitHub Actions
    Trigger: mainブランチへのpush
    
  CDN:
    Provider: GitHub Pages内蔵CDN (Fastly)
    Coverage: グローバル
    Cost: $0
```

### 1.2 技術スタック

```javascript
// 現在の技術スタック
const currentStack = {
  frontend: {
    framework: "React 18.2",
    routing: "React Router v6 (HashRouter)",
    styling: "Tailwind CSS v3",
    visualization: "D3.js v7",
    buildTool: "Vite v5"
  },
  
  backend: null, // バックエンドなし
  
  storage: {
    type: "Client-side only",
    method: "LocalStorage API",
    capacity: "~5-10MB per domain"
  },
  
  hosting: {
    platform: "GitHub Pages",
    deployment: "gh-pages branch",
    ssl: "自動提供",
    customDomain: "サポート（CNAME設定可能）"
  }
};
```

## 2. 現在のCI/CDパイプライン

### 2.1 GitHub Actions デプロイメント設定

```yaml
# .github/workflows/deploy.yml (現在の実装)
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          CI: true
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: # オプション: カスタムドメイン
```

### 2.2 ビルド最適化

```javascript
// vite.config.js - 現在の設定
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PMPLearningManagement/',
  build: {
    outDir: 'dist',
    sourcemap: false, // 本番環境ではソースマップ無効化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'd3-vendor': ['d3', 'd3-sankey'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    // パフォーマンス最適化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true
  }
});
```

## 3. パフォーマンス最適化（静的サイト向け）

### 3.1 フロントエンド最適化

```javascript
// パフォーマンス最適化の実装例

// 1. コード分割とLazy Loading
const PMBOKMatrix = lazy(() => import('./components/PMBOKMatrix'));
const ITTOForceGraph = lazy(() => import('./components/ITTOForceGraph'));
const MockExam = lazy(() => import('./components/MockExam'));

// 2. 画像最適化
const imageOptimization = {
  formats: ['webp', 'avif'], // 次世代フォーマット
  lazy: true,               // 遅延読み込み
  responsive: true,          // レスポンシブ画像
  compression: 85            // 品質設定
};

// 3. キャッシュ戦略
const cacheStrategy = {
  assets: {
    'js/css': 'max-age=31536000, immutable', // 1年（ハッシュ付き）
    'images': 'max-age=86400, must-revalidate', // 1日
    'html': 'no-cache, no-store, must-revalidate' // 常に最新
  }
};

// 4. Service Worker（PWA化）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3.2 バンドルサイズ最適化

```bash
# バンドルサイズ分析
npm run build -- --report

# 最適化目標
# - 初期バンドル: < 200KB (gzipped)
# - 最大チャンク: < 100KB
# - First Contentful Paint: < 1.5s
# - Time to Interactive: < 3.5s
```

## 4. モニタリング戦略（静的サイト向け）

### 4.1 無料モニタリングツール

```javascript
// 1. Google Analytics 4（無料）
const GA4_CONFIG = {
  measurementId: 'G-XXXXXXXXXX',
  events: [
    'page_view',
    'quiz_start',
    'quiz_complete',
    'study_progress'
  ]
};

// 2. Sentry（無料枠）- エラー監視
Sentry.init({
  dsn: 'https://xxx@xxx.ingest.sentry.io/xxx',
  environment: 'production',
  tracesSampleRate: 0.1, // 10%サンプリング
  beforeSend(event) {
    // PII除去
    if (event.user) {
      delete event.user.email;
    }
    return event;
  }
});

// 3. Web Vitals測定
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Google Analyticsに送信
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 4.2 ヘルスチェックとアップタイム監視

```yaml
# GitHub Actions - 定期的なヘルスチェック
name: Health Check

on:
  schedule:
    - cron: '*/30 * * * *' # 30分ごと
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check site availability
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            https://yusuke-kurosawa.github.io/PMPLearningManagement/)
          if [ $response != "200" ]; then
            echo "Site is down! HTTP Status: $response"
            exit 1
          fi
          
      - name: Performance check
        run: |
          # Lighthouse CI
          npm install -g @lhci/cli
          lhci autorun --collect.url=https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

## 5. 段階的成長戦略

### 5.1 Phase 1: 現在の最適化（コスト: $0）

```markdown
## 実装可能な改善（すべて無料）

1. **パフォーマンス向上**
   - Service Worker追加（オフライン対応）
   - 画像の遅延読み込み
   - リソースのプリロード/プリフェッチ

2. **SEO改善**
   - メタタグの最適化
   - sitemap.xml生成
   - robots.txt設定

3. **アナリティクス強化**
   - Google Analytics 4導入
   - カスタムイベントトラッキング
   - ユーザー行動分析

4. **開発体験向上**
   - ESLint/Prettier設定
   - pre-commitフック
   - 自動テスト追加
```

### 5.2 Phase 2: 軽量バックエンド追加（コスト: $0-20/月）

```javascript
// Serverless Functions（Vercel/Netlify Functions）
// コスト: 無料枠で十分カバー可能

// api/progress.js - Vercel Function例
export default async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Vercel KVから進捗データ取得
      const progress = await kv.get(`progress:${req.query.userId}`);
      return res.json(progress);
      
    case 'POST':
      // 進捗データ保存
      await kv.set(`progress:${req.body.userId}`, req.body.progress);
      return res.json({ success: true });
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// インフラ構成
const phase2Infrastructure = {
  hosting: "Vercel (無料) or Netlify (無料)",
  serverless: "Vercel Functions / Netlify Functions",
  database: "Vercel KV (無料枠: 30MB) / Supabase (無料枠: 500MB)",
  authentication: "Clerk (無料枠: 5000 MAU) / Auth0 (無料枠: 7000 MAU)",
  estimatedCost: "$0-20/月（トラフィックによる）"
};
```

### 5.3 Phase 3: フルスタックアプリケーション（コスト: $20-100/月）

```yaml
# コスト効率的なフルスタック構成
Infrastructure:
  Frontend:
    Hosting: Vercel/Netlify
    CDN: 組み込み
    Cost: $0-20/月
    
  Backend:
    Platform: Railway/Render/Fly.io
    Type: Container (Node.js)
    Instances: 1-2
    Cost: $5-20/月
    
  Database:
    Primary: PostgreSQL (Supabase/Neon)
    Cache: Redis (Upstash)
    Cost: $0-25/月
    
  Storage:
    Files: Cloudinary (画像)
    Documents: S3-compatible (Backblaze B2)
    Cost: $0-10/月
    
  Monitoring:
    APM: Sentry
    Analytics: Plausible/Umami
    Logs: LogTail
    Cost: $0-20/月
    
  Total: $20-100/月
```

### 5.4 Phase 4: エンタープライズ対応（コスト: $200-500/月）

```yaml
# エンタープライズ向け構成（必要になった場合のみ）
Infrastructure:
  CloudProvider: AWS
  
  Compute:
    ECS Fargate: 2 tasks (0.5 vCPU, 1GB)
    Cost: ~$40/月
    
  Database:
    RDS PostgreSQL: db.t3.micro (Multi-AZ)
    Cost: ~$50/月
    
  Storage:
    S3: 100GB + CloudFront
    Cost: ~$25/月
    
  Networking:
    ALB: 1 instance
    NAT Gateway: 1 instance  
    Cost: ~$70/月
    
  Monitoring:
    CloudWatch + X-Ray
    Cost: ~$30/月
    
  Backup:
    AWS Backup
    Cost: ~$20/月
    
  Security:
    WAF + Shield Standard
    Cost: ~$40/月
    
  Total: $275/月 + 転送料
```

## 6. セキュリティ実装（静的サイト向け）

### 6.1 現在実装可能なセキュリティ対策

```javascript
// 1. Content Security Policy
const CSP = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' https://www.googletagmanager.com",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'connect-src': "'self' https://api.github.com",
  'font-src': "'self'",
  'object-src': "'none'",
  'frame-ancestors': "'none'"
};

// 2. セキュリティヘッダー（GitHub Pages制限内）
// _headers ファイル（Netlify/Vercelの場合）
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

// 3. クライアントサイドのデータ暗号化
import CryptoJS from 'crypto-js';

class SecureStorage {
  static encrypt(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }
  
  static decrypt(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  
  static save(key, data, password) {
    const encrypted = this.encrypt(data, password);
    localStorage.setItem(key, encrypted);
  }
  
  static load(key, password) {
    const encrypted = localStorage.getItem(key);
    return encrypted ? this.decrypt(encrypted, password) : null;
  }
}
```

### 6.2 依存関係のセキュリティ

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1' # 週次スキャン

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: |
          npm audit --production
          
      - name: Check with Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Update dependencies
        if: github.event_name == 'schedule'
        run: |
          npx npm-check-updates -u
          npm install
          npm audit fix
```

## 7. 災害復旧とバックアップ（静的サイト向け）

### 7.1 現在のバックアップ戦略

```bash
#!/bin/bash
# scripts/backup-static-site.sh

# GitHubリポジトリ自体がバックアップとして機能
# 追加のバックアップ戦略

# 1. リポジトリのミラーリング
git clone --mirror https://github.com/username/PMPLearningManagement.git
tar -czf pmp-backup-$(date +%Y%m%d).tar.gz PMPLearningManagement.git

# 2. ビルド成果物のバックアップ
npm run build
tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/

# 3. 別のGitプロバイダーへのミラー
git remote add backup https://gitlab.com/username/PMPLearningManagement.git
git push --mirror backup
```

### 7.2 復旧手順

```markdown
## 復旧シナリオと対応

### シナリオ1: GitHub Pages障害
- **影響**: サイトにアクセス不可
- **復旧時間**: 即座
- **手順**:
  1. Vercel/Netlifyに一時デプロイ
  2. DNSをVercel/Netlifyに向ける
  3. GitHub Pages復旧後に戻す

### シナリオ2: リポジトリ削除/破損
- **影響**: ソースコード喪失
- **復旧時間**: 30分
- **手順**:
  1. ローカルバックアップから復元
  2. 新規リポジトリ作成
  3. コードをプッシュ
  4. GitHub Pages再設定

### シナリオ3: ビルド失敗
- **影響**: 新機能デプロイ不可
- **復旧時間**: 即座
- **手順**:
  1. 前のコミットにロールバック
  2. ビルドエラー修正
  3. 再デプロイ
```

## 8. コスト管理と最適化

### 8.1 現在のコスト構造

```javascript
const currentCosts = {
  infrastructure: {
    hosting: 0,        // GitHub Pages
    cdn: 0,           // 組み込み
    ssl: 0,           // 自動提供
    cicd: 0,          // GitHub Actions無料枠
    monitoring: 0,     // Google Analytics
    total: 0
  },
  
  future_options: {
    custom_domain: 10, // 年間（オプション）
    enhanced_monitoring: 10, // Sentry Pro（オプション）
    backup_storage: 5   // クラウドストレージ（オプション）
  }
};
```

### 8.2 コスト最適化のベストプラクティス

```markdown
## 静的サイトのコスト最適化

1. **無料サービスの最大活用**
   - GitHub Pages (100GB/月の帯域幅)
   - Cloudflare (無料CDN/WAF)
   - Google Analytics (無料)
   - Sentry (5000エラー/月無料)

2. **段階的な投資**
   - ユーザー数 < 1000: 完全無料
   - ユーザー数 1000-10000: $0-20/月
   - ユーザー数 10000+: $20-100/月

3. **不要なサービスの回避**
   - ❌ Kubernetes（過剰）
   - ❌ マイクロサービス（不要）
   - ❌ 複数のデータベース（過剰）
   - ✅ 静的サイト + Serverless API
   - ✅ JAMstack アーキテクチャ
```

## 9. 開発・運用のベストプラクティス

### 9.1 開発ワークフロー

```yaml
# 推奨される開発フロー
Development Workflow:
  1. Feature Branch:
    - feature/xxx ブランチ作成
    - ローカル開発・テスト
    
  2. Pull Request:
    - mainブランチへのPR作成
    - 自動テスト実行
    - コードレビュー
    
  3. Merge & Deploy:
    - mainブランチにマージ
    - GitHub Actions自動デプロイ
    - 本番環境反映（2-5分）
    
  4. Monitoring:
    - Google Analyticsで利用状況確認
    - Sentryでエラー監視
    - ユーザーフィードバック収集
```

### 9.2 運用チェックリスト

```markdown
## 日次チェック
- [ ] サイトアクセス可能性確認
- [ ] エラーログ確認（Sentry）
- [ ] パフォーマンス指標確認

## 週次チェック
- [ ] Google Analytics レポート確認
- [ ] 依存関係の更新確認
- [ ] セキュリティアラート確認

## 月次チェック
- [ ] バックアップ実行
- [ ] パフォーマンス最適化レビュー
- [ ] コスト分析（将来のサービス利用時）
```

## 10. 将来の拡張オプション

### 10.1 機能拡張ロードマップ

```javascript
const expansionRoadmap = {
  phase1: {
    timeline: "0-3ヶ月",
    features: [
      "PWA化（オフライン対応）",
      "Web Share API統合",
      "プッシュ通知（Web Push）"
    ],
    cost: 0
  },
  
  phase2: {
    timeline: "3-6ヶ月",
    features: [
      "ユーザー認証",
      "クラウド同期",
      "協調学習機能"
    ],
    infrastructure: "Supabase or Firebase",
    cost: "$0-20/月"
  },
  
  phase3: {
    timeline: "6-12ヶ月",
    features: [
      "AI学習アシスタント",
      "リアルタイム共同編集",
      "動画コンテンツ配信"
    ],
    infrastructure: "Vercel + Edge Functions",
    cost: "$50-100/月"
  }
};
```

### 10.2 技術選定ガイドライン

```markdown
## 技術選定の原則

### 採用すべき技術
✅ **JAMstack**: 高速、セキュア、スケーラブル
✅ **Serverless**: 使用分のみ課金、自動スケール
✅ **Edge Computing**: 低レイテンシ、グローバル配信
✅ **Progressive Enhancement**: 段階的な機能追加
✅ **Static First**: 可能な限り静的に生成

### 避けるべき技術（このプロジェクトでは）
❌ **従来型サーバー**: 管理コスト高、スケール困難
❌ **Kubernetes**: 複雑性が価値を上回らない
❌ **マイクロサービス**: 単一アプリには過剰
❌ **自前インフラ**: 運用負荷大
```

## まとめ

PMPLearningManagementは、現在GitHub Pagesで完全無料で運用されている効率的な静的サイトです。このインフラ設計書は以下を提供します：

1. **現実的なアプローチ**: 現在の$0運用から段階的に拡張
2. **コスト意識**: 必要最小限のリソースで最大の価値
3. **将来性**: ユーザー増加に応じた柔軟な拡張パス
4. **シンプルさ**: 複雑性を避け、保守性を重視

**重要な原則**:
- 静的ファーストのアプローチを維持
- 必要になるまで複雑性を追加しない
- 無料サービスを最大限活用
- ユーザー価値に直結する投資を優先

この設計により、学習プラットフォームとしての本質的な価値提供に集中しながら、必要に応じて段階的に機能とインフラを拡張できます。