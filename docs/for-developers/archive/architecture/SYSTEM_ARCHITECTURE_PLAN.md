# PMPLearningManagement システムアーキテクチャ計画書 v2.0

## エグゼクティブサマリー

本文書は、PMPLearningManagementプロジェクトの現実的かつ段階的なシステムアーキテクチャ計画を定義します。既存のGitHub Pages上のReact SPAから、モノリスファーストアプローチで商用サービスへと進化させ、必要に応じて段階的にスケールアウトする戦略を提示します。

**関連文書:**

- [MODULAR_ARCHITECTURE_DESIGN.md](./MODULAR_ARCHITECTURE_DESIGN.md) - モジュラーアーキテクチャ詳細
- [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md) - フロントエンド移行ガイド
- [INFRASTRUCTURE_DEVOPS.md](./INFRASTRUCTURE_DEVOPS.md) - インフラ・DevOps設計
- [PROJECT_MANAGEMENT_PLAN.md](../PROJECT_MANAGEMENT_PLAN.md) - プロジェクト管理計画

### 主要な戦略

- **モノリスファースト**: 初期は単一アプリケーションとして構築
- **段階的成長**: GitHub Pages（$0）→ Vercel/Netlify（$0-20/月）→ フルスタック（$20-100/月）
- **技術統一**: TypeScript/Node.jsエコシステムに統一
- **既存資産最大活用**: 30+のReactコンポーネントを再利用
- **実績ベースの拡張**: ユーザー数とビジネス成長に応じて段階的に複雑性を追加

## 1. 現状分析とギャップ分析

### 1.1 現在のシステムアーキテクチャ

#### 技術スタック

- **フロントエンド**: React 18.2, D3.js, Tailwind CSS
- **ホスティング**: GitHub Pages (静的サイト)
- **データ永続化**: LocalStorage (ブラウザローカル)
- **ビルドツール**: Vite
- **デプロイメント**: GitHub Actions

#### アーキテクチャ特性

- **パターン**: SPA (Single Page Application)
- **データフロー**: クライアントサイドのみ
- **状態管理**: React Hooks (useState, useContext)
- **ルーティング**: HashRouter (GitHub Pages互換)

### 1.2 技術的ギャップ分析（現実的評価）

| カテゴリ         | 現状            | 短期目標（3ヶ月）         | 中期目標（6ヶ月）        | ギャップ対応優先度 |
| ---------------- | --------------- | ------------------------- | ------------------------ | ------------------ |
| **バックエンド** | なし            | Next.js API Routes        | tRPC/GraphQL統合         | 高（必須）         |
| **データ永続化** | LocalStorage    | PostgreSQL（単一DB）      | Redis追加（キャッシュ）  | 高（必須）         |
| **認証・認可**   | なし            | NextAuth.js               | SSO対応（オプション）    | 高（必須）         |
| **決済**         | なし            | Stripe基本統合            | サブスク管理強化         | 中（3ヶ月後）      |
| **外部連携**     | なし            | 基本Webhook               | Excel/Jira連携           | 低（6ヶ月後）      |
| **AI/ML**        | なし            | OpenAI API活用            | カスタムモデル（将来）   | 低（6ヶ月後）      |
| **モバイル**     | レスポンシブWeb | PWA化                     | ネイティブアプリ（将来） | 中（3ヶ月後）      |
| **監視・運用**   | なし            | Sentry + Vercel Analytics | DataDog（成長後）        | 中（即時対応）     |

### 1.3 ビジネス要件とのギャップ

- **スケーラビリティ**: 現在は静的サイトのため、動的コンテンツやユーザー別データの管理が不可
- **同時接続数**: CDNによる静的配信は可能だが、リアルタイム機能なし
- **データ規模**: LocalStorageの5-10MB制限 vs 100万タスク規模の要件
- **可用性**: GitHub Pagesの可用性に依存、SLA保証なし
- **セキュリティ**: クライアントサイドのみのため、データ保護が不十分

## 2. 段階的アーキテクチャ進化戦略

### 2.1 Phase 1: モノリスMVP（月1-3）

```
┌─────────────────────────────────────────────────────────────┐
│                     クライアント層                            │
│                  Next.js 14 (App Router)                     │
│              既存30+ Reactコンポーネント移行                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   統合アプリケーション                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Next.js API Routes                      │  │
│  │         tRPC または GraphQL (Pothos)                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │            ビジネスロジック層                          │  │
│  │     認証 | 学習管理 | 決済 | 通知 | PMIS基本機能      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                        データ層                              │
│           PostgreSQL (Supabase/Neon/Railway)                │
│                 Redis (Upstash) - オプション                 │
└──────────────────────────────────────────────────────────────┘

ホスティング: Vercel/Netlify (無料枠〜$20/月)
```

### 2.2 Phase 2: モジュラーモノリス（月4-6）

```
┌─────────────────────────────────────────────────────────────┐
│                     クライアント層                            │
│            Next.js 14 + PWA + モバイル最適化                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 モジュラーモノリス                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API層 (tRPC/GraphQL)                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              ドメインモジュール                        │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │  │
│  │  │  認証   │ │学習管理 │ │ PMIS   │ │  AI    │    │  │
│  │  │モジュール│ │モジュール│ │モジュール│ │モジュール│    │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│      PostgreSQL + Redis + S3互換ストレージ (Cloudflare R2)    │
└──────────────────────────────────────────────────────────────┘

ホスティング: Vercel + Railway/Render ($20-50/月)
```

### 2.3 Phase 3: 選択的サービス分離（月7-12、必要な場合のみ）

```
┌─────────────────────────────────────────────────────────────┐
│                     クライアント層                            │
│              Next.js + React Native (オプション)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API Gateway (軽量)                        │
│                   Cloudflare Workers                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               ハイブリッドアーキテクチャ                       │
│  ┌────────────────────────────────┐  ┌─────────────────┐  │
│  │     メインモノリス              │  │  AIサービス      │  │
│  │  (認証/学習/PMIS/決済)         │  │  (分離)         │  │
│  │     Next.js/Node.js            │  │  Python/FastAPI  │  │
│  └────────────────────────────────┘  └─────────────────┘  │
│           必要に応じて重い処理のみ分離                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│        PostgreSQL + Redis + S3 + ベクトルDB (AI用)           │
└──────────────────────────────────────────────────────────────┘

ホスティング: Vercel + Railway + Cloudflare ($50-100/月)
```

### 2.4 技術選定（統一エコシステム）

#### Phase 1-2共通技術スタック

1. **フロントエンド**
   - **フレームワーク**: Next.js 14 (App Router)
   - **言語**: TypeScript (段階的移行)
   - **スタイリング**: Tailwind CSS
   - **状態管理**: Zustand/Jotai
   - **データフェッチ**: tRPC or GraphQL (Apollo Client)

2. **バックエンド**
   - **言語**: TypeScript/Node.js (統一)
   - **API**: Next.js API Routes → tRPC/GraphQL
   - **ORM**: Prisma
   - **認証**: NextAuth.js
   - **決済**: Stripe

3. **データストア**
   - **メインDB**: PostgreSQL (Supabase/Neon/Railway)
   - **キャッシュ**: Redis (Upstash) - Phase 2から
   - **ファイル**: Cloudflare R2 / AWS S3

4. **インフラ**
   - **ホスティング**: Vercel (フロントエンド)
   - **バックエンド**: Railway/Render (Phase 2から)
   - **CDN**: Cloudflare
   - **監視**: Sentry + Vercel Analytics

### 2.5 段階的実装戦略

#### Month 1-3: MVP構築

- Next.js環境構築
- 既存30+コンポーネントの移行
- 基本認証・決済機能
- PostgreSQL導入
- LocalStorageデータ移行ツール

#### Month 4-6: 機能拡張

- PMBOK第7版対応
- AI機能統合 (OpenAI API)
- 企業向け機能追加
- PWA化
- パフォーマンス最適化

#### Month 7-12: スケール対応（必要に応じて）

- モジュラーモノリス化
- 負荷の高い機能のみサービス分離
- キャッシュ層強化
- グローバル展開準備

## 3. 実装アーキテクチャ詳細

### 3.1 フロントエンドアーキテクチャ拡張

#### 現行システムの段階的拡張戦略

```typescript
// 新しいフォルダ構造
src/
├── features/           # 機能別モジュール
│   ├── auth/          # 認証機能
│   ├── learning/      # 学習管理（既存）
│   ├── pmis/          # PMIS新機能
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── resources/
│   │   └── risks/
│   └── analytics/     # 分析・ダッシュボード
├── shared/            # 共通コンポーネント
├── services/          # APIクライアント層
│   ├── api/          # REST/GraphQLクライアント
│   ├── websocket/    # リアルタイム通信
│   └── offline/      # オフライン対応
└── stores/           # 状態管理（Zustand）
```

#### API層の抽象化

```typescript
// services/api/client.ts
class APIClient {
  private baseURL: string
  private authToken: string | null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL
    this.authToken = this.getStoredToken()
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const config = {
      ...options,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      return this.handleResponse<T>(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // オフライン対応
  async cachedRequest<T>(endpoint: string, options: CachedRequestOptions): Promise<T> {
    if (!navigator.onLine) {
      return this.getFromCache(endpoint)
    }

    const data = await this.request<T>(endpoint, options)
    await this.saveToCache(endpoint, data)
    return data
  }
}
```

### 3.2 バックエンドアーキテクチャ実装

#### マイクロサービステンプレート

```javascript
// services/base/service-template.js (NestJS)
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dbConfig),
    PrometheusModule.register(),
    HealthModule,
    LoggerModule
  ],
  controllers: [ServiceController],
  providers: [
    ServiceRepository,
    ServiceBusinessLogic,
    EventPublisher,
    CacheManager
  ]
})
export class ServiceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        AuthenticationMiddleware,
        RateLimitMiddleware,
        LoggingMiddleware
      )
      .forRoutes('*');
  }
}
```

#### イベント駆動通信

```python
# services/events/event_publisher.py (Python/FastAPI)
from aiokafka import AIOKafkaProducer
import json
from typing import Any, Dict

class EventPublisher:
    def __init__(self, bootstrap_servers: str):
        self.producer = None
        self.bootstrap_servers = bootstrap_servers

    async def connect(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode()
        )
        await self.producer.start()

    async def publish_event(
        self,
        topic: str,
        event_type: str,
        payload: Dict[str, Any],
        correlation_id: str = None
    ):
        event = {
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat(),
            'correlation_id': correlation_id or str(uuid.uuid4()),
            'payload': payload
        }

        await self.producer.send(topic, value=event)

    async def close(self):
        await self.producer.stop()
```

### 3.3 データアーキテクチャ

#### マルチテナンシー戦略

```sql
-- PostgreSQL: Row Level Security実装
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テナント分離ポリシー
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

#### キャッシング戦略

```javascript
// services/cache/cache-strategy.js
class CacheStrategy {
  constructor(redisClient) {
    this.redis = redisClient
    this.ttl = {
      user: 3600, // 1時間
      project: 1800, // 30分
      analytics: 300, // 5分
      static: 86400, // 24時間
    }
  }

  async getOrSet(key, fetchFunction, category = 'default') {
    // キャッシュチェック
    const cached = await this.redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // データ取得とキャッシュ
    const data = await fetchFunction()
    await this.redis.setex(key, this.ttl[category] || 600, JSON.stringify(data))

    return data
  }

  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
```

## 4. 統合・インフラアーキテクチャ

### 4.1 API Gateway設計

```yaml
# kong/kong.yml
services:
  - name: auth-service
    url: http://auth-service:3000
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth
        methods:
          - GET
          - POST
        plugins:
          - name: rate-limiting
            config:
              minute: 100
              policy: local
          - name: jwt
          - name: cors
            config:
              origins:
                - https://pmp.example.com
              credentials: true

  - name: pmis-service
    url: http://pmis-service:3001
    routes:
      - name: pmis-routes
        paths:
          - /api/v1/pmis
        plugins:
          - name: key-auth
          - name: request-transformer
            config:
              add:
                headers:
                  - X-Tenant-ID:$(tenant_id)
```

### 4.2 Kubernetes デプロイメント

```yaml
# k8s/microservices/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: pmp-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: pmp-system/auth-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: redis-config
                  key: url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: pmp-system
spec:
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: pmp-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 4.3 CI/CDパイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth, learning, pmis, analytics]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd services/${{ matrix.service }}
          npm ci

      - name: Run tests
        run: |
          cd services/${{ matrix.service }}
          npm run test:ci

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            pmp-system/${{ matrix.service }}:latest
            pmp-system/${{ matrix.service }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/microservices/
          images: |
            pmp-system/${{ matrix.service }}:${{ github.sha }}
          namespace: pmp-system
```

## 5. 現実的な移行戦略

### 5.1 3ヶ月MVP計画

#### Month 1: 基盤構築

- **Week 1-2**: Next.js環境構築、開発環境整備
- **Week 3-4**: 認証システム（NextAuth.js）実装

#### Month 2: コア機能移行

- **Week 1-2**: 既存Reactコンポーネント移行（30+）
- **Week 3-4**: データ移行ツール、API実装

#### Month 3: 統合とリリース

- **Week 1-2**: 決済システム統合（Stripe）
- **Week 3-4**: テスト、最適化、デプロイ

### 5.2 6ヶ月本格リリース計画

#### Month 4-5: 機能拡張

- PMBOK第7版対応
- AI学習アシスタント（OpenAI API）
- 企業向け管理機能

#### Month 6: 品質向上

- パフォーマンス最適化
- セキュリティ強化
- ユーザビリティ改善

### 5.2 リスク軽減策

| リスク             | 影響度 | 軽減策                                     |
| ------------------ | ------ | ------------------------------------------ |
| データ移行失敗     | 高     | 段階的移行、ロールバック計画、並行稼働期間 |
| パフォーマンス劣化 | 中     | キャッシュ戦略、CDN活用、負荷テスト        |
| 互換性問題         | 中     | API versioning、後方互換性維持             |
| セキュリティ脆弱性 | 高     | セキュリティテスト、ペネトレーションテスト |

## 6. 品質属性と非機能要件

### 6.1 パフォーマンス要件と最適化

#### レスポンスタイム目標

- API応答: 95パーセンタイル < 200ms
- ページロード: 3秒以内（3G接続）
- リアルタイム更新: < 100ms遅延

#### 最適化戦略

```javascript
// パフォーマンス最適化設定
const performanceConfig = {
  caching: {
    cdn: {
      static: '1 year',
      api: '5 minutes',
    },
    browser: {
      serviceWorker: true,
      indexedDB: true,
    },
    server: {
      redis: true,
      memcached: false,
    },
  },

  optimization: {
    bundleSize: {
      maxInitial: '500kb',
      maxAsync: '300kb',
    },
    lazyLoading: true,
    codeSplitting: true,
    treeShaking: true,
    preloading: ['critical-paths'],
    prefetching: ['likely-paths'],
  },

  database: {
    connectionPooling: {
      min: 10,
      max: 100,
    },
    queryOptimization: true,
    indexing: 'automatic',
    partitioning: 'by-tenant',
  },
}
```

### 6.2 可用性とディザスタリカバリ

#### 高可用性アーキテクチャ

```yaml
# 可用性設計
availability:
  target: 99.5% # 年間ダウンタイム: 43.8時間

  strategies:
    - multi-region-deployment:
        primary: ap-northeast-1 # 東京
        secondary: us-west-2 # オレゴン
        failover: automatic

    - load-balancing:
        type: round-robin
        health-checks: enabled
        sticky-sessions: true

    - database-replication:
        type: master-slave
        slaves: 2
        async-replication: true

    - circuit-breaker:
        failure-threshold: 5
        timeout: 30s
        half-open-attempts: 3
```

#### バックアップとリカバリ

```bash
#!/bin/bash
# backup-strategy.sh

# データベースバックアップ
backup_database() {
  # フルバックアップ（毎日）
  pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --format=custom --blobs --verbose \
    --file="/backup/db/full_$(date +%Y%m%d).dump"

  # 増分バックアップ（毎時）
  pg_basebackup -h $DB_HOST -U $DB_USER \
    -D /backup/db/incremental/$(date +%Y%m%d_%H) \
    --checkpoint=fast --write-recovery-conf
}

# S3へのアップロード
upload_to_s3() {
  aws s3 sync /backup/db/ s3://pmp-backups/db/ \
    --storage-class GLACIER_IR \
    --encryption AES256
}

# リテンション管理
manage_retention() {
  # 30日以上前のバックアップを削除
  find /backup/db/ -type f -mtime +30 -delete

  # S3ライフサイクルポリシー適用
  aws s3api put-bucket-lifecycle-configuration \
    --bucket pmp-backups \
    --lifecycle-configuration file://lifecycle.json
}
```

### 6.3 セキュリティアーキテクチャ

#### 多層防御戦略

```typescript
// security/security-layers.ts
export const securityLayers = {
  // 1. ネットワーク層
  network: {
    waf: 'CloudFlare/AWS WAF',
    ddosProtection: true,
    tlsVersion: 'TLS 1.3',
    certificatePinning: true,
  },

  // 2. アプリケーション層
  application: {
    authentication: {
      methods: ['OAuth2', 'SAML2', 'MFA'],
      sessionManagement: 'JWT with refresh tokens',
      passwordPolicy: {
        minLength: 12,
        complexity: 'high',
        rotation: 90, // days
      },
    },
    authorization: {
      model: 'RBAC + ABAC',
      finegrainedPermissions: true,
      dynamicPolicies: true,
    },
    inputValidation: {
      sanitization: true,
      parameterizedQueries: true,
      xssProtection: true,
      csrfProtection: true,
    },
  },

  // 3. データ層
  data: {
    encryptionAtRest: {
      algorithm: 'AES-256-GCM',
      keyManagement: 'AWS KMS/HashiCorp Vault',
    },
    encryptionInTransit: {
      internal: 'mTLS',
      external: 'TLS 1.3',
    },
    dataClassification: {
      levels: ['Public', 'Internal', 'Confidential', 'Restricted'],
      handling: 'Automated based on classification',
    },
  },

  // 4. 監査・コンプライアンス
  compliance: {
    standards: ['ISO 27001', 'SOC 2', 'GDPR'],
    auditLogging: {
      events: ['authentication', 'authorization', 'dataAccess', 'configuration'],
      retention: '7 years',
      tamperProof: true,
    },
    monitoring: {
      siem: 'Splunk/ELK Stack',
      anomalyDetection: 'ML-based',
      alerting: 'Real-time',
    },
  },
}
```

## 7. 技術的決定事項（ADR）

### ADR-001: モノリスファーストアプローチの採用

**ステータス**: 承認済み

**コンテキスト**:
2-3名の小規模チームで、既存30+のReactコンポーネントを活用して、短期間でMVPを構築する必要がある。

**決定**:
モノリスファーストアプローチを採用し、Next.js 14をベースに単一アプリケーションとして実装する。

**理由**:

- 開発速度の最大化
- 運用の単純化
- コスト効率性（$0-20/月から開始）
- チーム規模に適合

**トレードオフ**:

- 将来的なスケーリングの課題
- 技術スタックの統一
- モジュール境界の管理

**軽減策**:

- モジュラー設計による内部構造化
- 必要時のサービス分離パスを確保
- tRPC/GraphQLによるAPI層の抽象化

### ADR-002: イベント駆動アーキテクチャの採用

**ステータス**: 承認済み

**コンテキスト**:
サービス間の疎結合を維持しながら、リアルタイム性と拡張性を確保する必要がある。

**決定**:
Apache Kafka/AWS EventBridgeをベースとしたイベント駆動アーキテクチャを採用。

**理由**:

- サービス間の疎結合
- 非同期処理による応答性向上
- イベントソーシングによる監査証跡
- 複数のコンシューマーへの配信

**実装例**:

```javascript
// events/event-schema.js
const projectEventSchema = {
  eventType: 'project.created',
  version: '1.0.0',
  payload: {
    projectId: 'uuid',
    name: 'string',
    createdBy: 'uuid',
    createdAt: 'timestamp',
    metadata: {
      source: 'web-app',
      correlationId: 'uuid',
    },
  },
}
```

### ADR-003: クラウドファースト戦略

**ステータス**: 承認済み

**コンテキスト**:
コスト効率性とスケーラビリティを両立し、小規模チームで管理可能なインフラが必要。

**決定**:
Vercel + PaaSサービスを中心としたクラウドファースト構成。

**配置戦略**:

- **フロントエンド**: Vercel（無料枠から開始）
- **データベース**: Supabase/Neon/PlanetScale
- **キャッシュ**: Upstash Redis
- **ストレージ**: Cloudflare R2

### ADR-004: TypeScriptへの段階的移行

**ステータス**: 提案中

**コンテキスト**:
大規模化に伴い、型安全性とIDEサポートの向上が必要。

**決定**:
新規コードはTypeScriptで記述し、既存コードは段階的に移行。

**移行計画**:

1. 新規サービスはTypeScriptで開始
2. 共有ライブラリから移行
3. 既存コンポーネントの段階的移行

## 8. 実装ロードマップ

### 8.1 短期目標（3ヶ月MVP）

#### 月1: 基盤構築

- [ ] Next.js 14環境構築
- [ ] GitHub Actions CI/CD設定
- [ ] Vercelデプロイメント設定
- [ ] PostgreSQLデータベース設計

#### 月2: コア機能実装

- [ ] NextAuth.js認証実装
- [ ] 既存30+コンポーネント移行
- [ ] tRPC/GraphQL API実装
- [ ] Stripe決済統合

#### 月3: 統合とリリース

- [ ] LocalStorageデータ移行ツール
- [ ] 基本的なPMIS機能実装
- [ ] Sentry監視設定
- [ ] MVPリリース

### 8.2 中期目標（6ヶ月）

- 全PMIS機能の実装完了
- 外部システム連携（Excel, Jira, Slack）
- AI/ML機能の基本実装
- PWA化とモバイルアプリのベータ版
- パフォーマンステストと最適化

### 8.3 長期目標（12ヶ月）

- エンタープライズ機能の完全実装
- 15,000ユーザー対応のスケーリング検証
- ISO 27001認証取得準備
- グローバル展開（多言語・多地域）
- 次世代機能（AR/VR学習）の研究開発

## 9. 現実的なコスト見積もり

### 9.1 段階的インフラコスト

| フェーズ    | 期間       | ユーザー数   | 月額コスト | 内訳                          |
| ----------- | ---------- | ------------ | ---------- | ----------------------------- |
| **現在**    | -          | <100         | $0         | GitHub Pages                  |
| **Phase 1** | Month 1-3  | <1,000       | $0-20      | Vercel無料枠 + Supabase無料枠 |
| **Phase 2** | Month 4-6  | 1,000-5,000  | $20-50     | Vercel Pro + DB有料枠         |
| **Phase 3** | Month 7-12 | 5,000-15,000 | $50-100    | +Railway/Render + Redis       |
| **将来**    | Year 2+    | 15,000+      | $100-500   | スケールに応じて段階的拡張    |

### 9.2 現実的な開発体制

#### 初期（3ヶ月MVP）

- フルスタックエンジニア: 2名
- パートタイムPM: 1名
- 合計: 約6人月

#### 成長期（4-6ヶ月）

- フルスタックエンジニア: 2-3名
- UIデザイナー: 1名（パートタイム）
- 合計: 約9人月

#### 安定期（7ヶ月以降）

- 開発・運用: 2-3名体制維持
- 必要に応じて専門家を追加

### 9.3 現実的なROI分析

#### 収益モデル

- **フリーミアム**: 基本機能無料、プレミアム機能有料
- **価格設定**: 月額2,000-5,000円（$15-35）
- **目標転換率**: 5-10%

#### 段階的収益目標

- Month 3: 100ユーザー × 5% × 2,000円 = 10,000円/月
- Month 6: 1,000ユーザー × 7% × 3,000円 = 210,000円/月
- Month 12: 5,000ユーザー × 10% × 3,500円 = 1,750,000円/月

#### 投資回収

- 初期投資: 600-900万円（開発費）
- 損益分岐点: Month 8-10
- 投資回収: Month 12-15

## 10. リスク管理

### 技術的リスク

| リスク               | 可能性 | 影響 | 軽減策                                     |
| -------------------- | ------ | ---- | ------------------------------------------ |
| スケーラビリティ不足 | 中     | 高   | 早期の負荷テスト、段階的スケーリング       |
| セキュリティ侵害     | 低     | 極高 | 多層防御、定期的セキュリティ監査           |
| 技術的負債の蓄積     | 高     | 中   | コードレビュー、リファクタリング時間の確保 |
| ベンダーロックイン   | 中     | 中   | 抽象化層、マルチクラウド戦略               |

### ビジネスリスク

| リスク             | 可能性 | 影響 | 軽減策                                 |
| ------------------ | ------ | ---- | -------------------------------------- |
| 市場競合の激化     | 高     | 高   | 差別化機能の継続的開発                 |
| 規制変更           | 中     | 中   | コンプライアンス体制の確立             |
| ユーザー獲得の遅れ | 中     | 高   | マーケティング強化、フリーミアムモデル |

## 11. 成功指標（KPI）

### 技術的KPI

- API応答時間: < 200ms (95パーセンタイル)
- システム可用性: > 99.5%
- デプロイ頻度: > 10回/週
- MTTR（平均復旧時間）: < 30分
- テストカバレッジ: > 80%

### ビジネスKPI

- MAU（月間アクティブユーザー）: 15,000（3年目）
- ユーザー継続率: > 80%（6ヶ月）
- NPS（ネットプロモータースコア）: > 50
- 収益成長率: 300%/年

## 12. 結論と次のステップ

本アーキテクチャ計画は、PMPLearningManagementシステムを学習プラットフォームから包括的なPMISへと進化させるための現実的なロードマップを提供します。

**関連文書:**

- [MODULAR_ARCHITECTURE_DESIGN.md](./MODULAR_ARCHITECTURE_DESIGN.md) - モジュラーアーキテクチャ詳細
- [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md) - フロントエンド移行ガイド
- [INFRASTRUCTURE_DEVOPS.md](./INFRASTRUCTURE_DEVOPS.md) - インフラ・ DevOps設計
- [PROJECT_MANAGEMENT_PLAN.md](../PROJECT_MANAGEMENT_PLAN.md) - プロジェクト管理計画

### 即座に実行すべきアクション

1. **技術スタックの最終決定**（1週間以内）
2. **開発チームの編成とスキル評価**（2週間以内）
3. **詳細な実装計画とスプリント計画**（2週間以内）
4. **概念実証（PoC）の開発開始**（1ヶ月以内）

### 重要な意思決定ポイント

- 月2終了時: アーキテクチャの有効性評価
- 月3終了時: スケーリング戦略の確認
- 月6終了時: 本格展開のGo/No-Go判定

このモノリスファーストアーキテクチャ計画に従うことで、小規模チームでも実装可能で、ビジネスの成長に応じて段階的にスケールできるシステムの構築が可能となります。
