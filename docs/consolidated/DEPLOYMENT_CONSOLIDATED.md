# Deployment Documentation

<!-- Consolidated on: 2025-08-09T15:12:24.896Z -->
<!-- Source files: DETAILED_FEATURE_SPECIFICATIONS.md, INFRASTRUCTURE_DEVOPS.md, DEPLOYMENT.md, CLOUD_DEPLOYMENT_GUIDE.md -->

## Table of Contents

1. [DETAILED FEATURE SPECIFICATIONS](#detailed-feature-specifications)
2. [INFRASTRUCTURE DEVOPS](#infrastructure-devops)
3. [DEPLOYMENT](#deployment)
4. [CLOUD DEPLOYMENT GUIDE](#cloud-deployment-guide)

---

## DETAILED FEATURE SPECIFICATIONS

_Source: `docs/DETAILED_FEATURE_SPECIFICATIONS.md`_

## Table of Contents

1. [Core Learning Features](#core-learning-features)
2. [Visualization Features](#visualization-features)
3. [Collaboration Features](#collaboration-features)
4. [Security & Authentication](#security--authentication)
5. [Mobile & PWA Features](#mobile--pwa-features)
6. [Monetization Features](#monetization-features)
7. [Analytics & Monitoring](#analytics--monitoring)

---

## Core Learning Features

### 1. PMP Mock Exam System

#### Overview

Comprehensive exam simulation system that replicates the actual PMP certification exam experience with 180 questions across all knowledge areas.

#### User Stories

- **As a PMP candidate**, I want to take practice exams so that I can assess my readiness for the actual certification exam
- **As a learner**, I want detailed explanations for each answer so that I can understand my mistakes
- **As a trainer**, I want to track student performance so that I can identify areas needing improvement

#### Technical Requirements

```typescript
interface ExamSession {
  id: string
  userId: string
  questions: Question[]
  startTime: Date
  endTime?: Date
  responses: ExamResponse[]
  score?: ExamScore
  status: 'in-progress' | 'completed' | 'abandoned'
}

interface Question {
  id: string
  text: string
  options: Option[]
  correctAnswer: string
  explanation: string
  knowledgeArea: KnowledgeArea
  processGroup: ProcessGroup
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}
```

#### Features

- **Timer Management**: 230-minute countdown with pause/resume capability
- **Question Navigation**: Jump to any question, mark for review
- **Progress Tracking**: Visual progress bar, answered/unanswered indicators
- **Auto-save**: Responses saved every 30 seconds to IndexedDB
- **Result Analysis**:
  - Overall score and pass/fail status
  - Knowledge area breakdown
  - Process group performance
  - Time management analysis
  - Incorrect answer review

#### Acceptance Criteria

- [ ] Exam loads 180 randomized questions from question bank
- [ ] Timer accurately tracks remaining time
- [ ] All responses are persisted during exam
- [ ] Results page shows comprehensive analysis
- [ ] Mobile-responsive interface
- [ ] Offline functionality supported

---

### 2. Adaptive Learning Path System

#### Overview

AI-powered personalized learning paths that adapt based on individual progress, learning style, and performance metrics.

#### User Stories

- **As a beginner**, I want a structured learning path so that I know what to study next
- **As an experienced PM**, I want to skip basics and focus on gaps in my knowledge
- **As a visual learner**, I want content prioritized in visual formats

#### Technical Requirements

```typescript
interface LearningPath {
  userId: string
  currentModule: Module
  completedModules: Module[]
  recommendedNext: Module[]
  estimatedCompletionTime: number
  learningStyle: LearningStyle
  difficultyLevel: DifficultyLevel
  progressMetrics: ProgressMetrics
}

interface Module {
  id: string
  title: string
  type: 'video' | 'reading' | 'practice' | 'visualization'
  duration: number
  prerequisites: string[]
  outcomes: LearningOutcome[]
  assessmentId?: string
}
```

#### Features

- **Initial Assessment**: 20-question diagnostic test
- **Learning Style Detection**: Visual, auditory, kinesthetic preference identification
- **Dynamic Path Generation**: Real-time path adjustments based on performance
- **Spaced Repetition**: Automatic review scheduling for retention
- **Progress Predictions**: ML-based completion time estimates
- **Weakness Detection**: Automatic identification of struggling areas

#### Machine Learning Model

```python
class LearningPathOptimizer:
    def __init__(self):
        self.user_embeddings = {}
        self.content_embeddings = {}
        self.performance_history = {}

    def recommend_next_module(self, user_id: str) -> List[Module]:
        # Collaborative filtering + content-based recommendation
        user_vector = self.get_user_embedding(user_id)
        available_modules = self.get_available_modules(user_id)
        scores = self.calculate_relevance_scores(user_vector, available_modules)
        return self.rank_by_learning_efficiency(scores)
```

---

### 3. Flashcard Learning System with Spaced Repetition

#### Overview

Interactive flashcard system implementing the SuperMemo SM-2 algorithm for optimal memorization of PMBOK processes and ITTOs.

#### User Stories

- **As a student**, I want to efficiently memorize all 49 processes and their ITTOs
- **As a busy professional**, I want short, focused study sessions that fit my schedule
- **As a visual learner**, I want cards with diagrams and visual aids

#### Technical Requirements

```typescript
interface FlashCard {
  id: string
  front: CardContent
  back: CardContent
  processId: string
  difficulty: number // 0.0 - 1.0
  repetitions: number
  easinessFactor: number // SM-2 algorithm
  interval: number // days until next review
  nextReviewDate: Date
  statistics: CardStatistics
}

interface StudySession {
  userId: string
  cards: FlashCard[]
  startTime: Date
  endTime?: Date
  cardsStudied: number
  correctAnswers: number
  averageResponseTime: number
}
```

#### Features

- **3D Card Animation**: Smooth flip animations with depth perception
- **Multi-modal Content**: Text, images, diagrams, mnemonics
- **Smart Scheduling**: SM-2 algorithm implementation
- **Session Management**: 5, 10, 15, or 30-minute sessions
- **Performance Analytics**: Retention rates, study streaks, progress charts
- **Offline Sync**: Study offline, sync when connected

#### Spaced Repetition Algorithm

```javascript
function calculateNextReview(card, quality) {
  // quality: 0-5 (0=complete blackout, 5=perfect recall)
  if (quality < 3) {
    card.repetitions = 0
    card.interval = 1
  } else {
    if (card.repetitions === 0) {
      card.interval = 1
    } else if (card.repetitions === 1) {
      card.interval = 6
    } else {
      card.interval = Math.round(card.interval * card.easinessFactor)
    }
    card.repetitions++
  }

  card.easinessFactor = Math.max(
    1.3,
    card.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  return new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000)
}
```

---

## Visualization Features

### 4. PMBOK Process Matrix Interactive View

#### Overview

Interactive matrix displaying all 49 PMBOK processes organized by 10 Knowledge Areas and 5 Process Groups with drill-down capabilities.

#### User Stories

- **As a visual learner**, I want to see process relationships in a structured grid
- **As an instructor**, I want to highlight specific processes during teaching
- **As a student**, I want to track my learning progress visually

#### Technical Requirements

```typescript
interface ProcessMatrix {
  knowledgeAreas: KnowledgeArea[]
  processGroups: ProcessGroup[]
  processes: Process[][]
  filters: MatrixFilter
  viewMode: 'compact' | 'detailed' | 'progress'
  interactionState: InteractionState
}

interface Process {
  id: string
  name: string
  knowledgeArea: string
  processGroup: string
  inputs: ITTO[]
  tools: ITTO[]
  outputs: ITTO[]
  description: string
  learningStatus: 'not-started' | 'in-progress' | 'completed'
  confidence: number // 0-100
}
```

#### Features

- **Interactive Cells**: Click to expand process details
- **Color Coding**: Visual indicators for learning progress
- **Search & Filter**: Find processes by name, ITTO, or keyword
- **Zoom Controls**: Adjustable view for different screen sizes
- **Export Options**: PNG, PDF, or CSV export
- **Comparison Mode**: Side-by-side process comparison
- **Annotation System**: Add personal notes to each process

#### Interaction Design

```javascript
const MatrixInteractions = {
  hover: (process) => {
    // Show tooltip with key ITTOs
    showTooltip({
      inputs: process.inputs.slice(0, 3),
      tools: process.tools.slice(0, 3),
      outputs: process.outputs.slice(0, 3),
    })
  },

  click: (process) => {
    // Open detailed modal
    openProcessModal(process)
  },

  rightClick: (process) => {
    // Context menu for actions
    showContextMenu([
      'Mark as Complete',
      'Add to Study List',
      'Compare with...',
      'View Relationships',
    ])
  },
}
```

---

### 5. ITTO Network Visualization with Force-Directed Graph

#### Overview

Dynamic force-directed graph showing relationships between processes through their shared inputs, tools, and outputs.

#### User Stories

- **As a systems thinker**, I want to understand how processes interconnect
- **As a student**, I want to visualize dependencies between processes
- **As an analyst**, I want to identify critical path processes

#### Technical Requirements

```typescript
interface NetworkGraph {
  nodes: ProcessNode[]
  edges: ProcessEdge[]
  layout: LayoutAlgorithm
  physics: PhysicsEngine
  filters: NetworkFilter
  highlightedPath?: string[]
}

interface ProcessNode {
  id: string
  x: number
  y: number
  radius: number
  color: string
  label: string
  group: string
  weight: number
}

interface ProcessEdge {
  source: string
  target: string
  weight: number
  type: 'input' | 'output' | 'tool'
  label?: string
}
```

#### Features

- **Multiple Layouts**: Force, circular, hierarchical, random
- **Interactive Navigation**: Pan, zoom, rotate
- **Node Clustering**: Group by knowledge area or process group
- **Path Finding**: Highlight shortest path between processes
- **Edge Filtering**: Show/hide different relationship types
- **Real-time Physics**: Spring-based force simulation
- **Node Details**: Hover for quick info, click for details

#### D3.js Implementation

```javascript
const forceSimulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    d3
      .forceLink(edges)
      .id((d) => d.id)
      .distance((d) => 100 / d.weight)
  )
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force(
    'collision',
    d3.forceCollide().radius((d) => d.radius + 5)
  )
  .on('tick', updatePositions)
```

---

## Collaboration Features

### 6. Real-time Study Groups

#### Overview

Virtual study rooms where learners can collaborate, share notes, and discuss PMBOK concepts in real-time.

#### User Stories

- **As a student**, I want to study with peers for motivation and support
- **As a mentor**, I want to guide study groups through difficult concepts
- **As a team lead**, I want to track my team's certification progress

#### Technical Requirements

```typescript
interface StudyGroup {
  id: string
  name: string
  members: GroupMember[]
  schedule: Schedule[]
  sharedResources: Resource[]
  chatHistory: Message[]
  videoSession?: VideoSession
  whiteboard?: WhiteboardState
}

interface GroupMember {
  userId: string
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
  lastActive: Date
  contribution: ContributionMetrics
}
```

#### Features

- **Group Creation**: Public or private groups with invitation system
- **Shared Progress**: Group dashboard showing collective progress
- **Resource Library**: Shared notes, flashcards, practice questions
- **Discussion Forums**: Threaded discussions with voting
- **Study Sessions**: Scheduled group study with reminders
- **Gamification**: Group challenges and leaderboards
- **Virtual Whiteboard**: Collaborative drawing for concept mapping

#### Real-time Sync Architecture

```javascript
class StudyGroupSync {
  constructor() {
    this.websocket = new WebSocket('wss://api.pmplearning.com/groups')
    this.localState = new Map()
    this.conflictResolver = new ConflictResolver()
  }

  async syncGroupState(groupId, changes) {
    // Optimistic update
    this.applyLocalChanges(changes)

    // Send to server
    this.websocket.send(
      JSON.stringify({
        type: 'GROUP_UPDATE',
        groupId,
        changes,
        timestamp: Date.now(),
        userId: this.userId,
      })
    )

    // Handle conflicts
    this.websocket.on('CONFLICT', (conflict) => {
      const resolution = this.conflictResolver.resolve(conflict)
      this.applyResolution(resolution)
    })
  }
}
```

---

## Security & Authentication

### 7. Enterprise-Grade Authentication System

#### Overview

Comprehensive authentication and authorization system supporting multiple providers and enterprise SSO integration.

#### User Stories

- **As an individual user**, I want secure and convenient login options
- **As an enterprise admin**, I want to manage user access centrally
- **As a security officer**, I want audit logs and compliance reports

#### Technical Requirements

```typescript
interface AuthSystem {
  providers: AuthProvider[]
  sessionManager: SessionManager
  tokenService: TokenService
  mfaService: MFAService
  auditLogger: AuditLogger
}

interface User {
  id: string
  email: string
  passwordHash?: string
  providers: LinkedProvider[]
  roles: Role[]
  permissions: Permission[]
  mfaEnabled: boolean
  sessions: Session[]
  securityEvents: SecurityEvent[]
}
```

#### Features

- **Multiple Auth Methods**: Email/password, OAuth2, SAML 2.0
- **Single Sign-On**: Integration with Okta, Auth0, Azure AD
- **Multi-Factor Auth**: TOTP, SMS, email verification
- **Session Management**: Device tracking, concurrent session limits
- **Password Policies**: Complexity rules, rotation requirements
- **Account Recovery**: Secure password reset, account unlock
- **Audit Logging**: All authentication events logged

#### Security Implementation

```typescript
class AuthenticationService {
  async authenticate(credentials: Credentials): Promise<AuthResult> {
    // Rate limiting check
    await this.rateLimiter.check(credentials.identifier)

    // Validate credentials
    const user = await this.validateCredentials(credentials)

    // Check MFA requirement
    if (user.mfaEnabled) {
      return { requiresMFA: true, challengeId: await this.mfaService.createChallenge(user) }
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user)

    // Log security event
    await this.auditLogger.log({
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      ip: credentials.ip,
      userAgent: credentials.userAgent,
      timestamp: new Date(),
    })

    return { success: true, tokens }
  }
}
```

---

## Mobile & PWA Features

### 8. Progressive Web App with Offline Capability

#### Overview

Full-featured PWA providing native app experience with complete offline functionality and background synchronization.

#### User Stories

- **As a mobile user**, I want to study on my phone during commute
- **As a traveler**, I want to access content without internet
- **As a user**, I want app-like experience without installation friction

#### Technical Requirements

```typescript
interface PWAConfig {
  manifest: WebAppManifest
  serviceWorker: ServiceWorkerConfig
  cacheStrategy: CacheStrategy
  syncManager: BackgroundSyncManager
  pushManager: PushNotificationManager
}

interface OfflineCapability {
  cachedContent: CachedResource[]
  pendingSync: SyncQueue[]
  conflictResolution: ConflictStrategy
  storageQuota: StorageQuota
}
```

#### Features

- **Install Prompts**: Smart installation timing
- **Offline Content**: All core features work offline
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Study reminders, group updates
- **App Shortcuts**: Quick access to common features
- **Share Target**: Receive shared content from other apps
- **File System Access**: Import/export study materials

#### Service Worker Strategy

```javascript
// Advanced caching strategies
const cachingStrategies = {
  static: {
    pattern: /\.(js|css|woff2?)$/,
    strategy: 'CacheFirst',
    expiration: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  api: {
    pattern: /\/api\/progress/,
    strategy: 'NetworkFirst',
    timeout: 3000,
    fallback: 'cache',
  },

  content: {
    pattern: /\/api\/content/,
    strategy: 'StaleWhileRevalidate',
    broadcastUpdate: true,
  },

  media: {
    pattern: /\.(png|jpg|svg|mp4)$/,
    strategy: 'CacheFirst',
    maxEntries: 50,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}
```

---

## Monetization Features

### 9. Subscription Management System

#### Overview

Flexible subscription system with multiple tiers, usage-based pricing options, and enterprise licensing capabilities.

#### User Stories

- **As a casual learner**, I want affordable access to basic features
- **As a serious student**, I want premium features for exam preparation
- **As an enterprise**, I want volume licensing for my team

#### Technical Requirements

```typescript
interface SubscriptionSystem {
  plans: SubscriptionPlan[]
  billingEngine: BillingEngine
  paymentProcessor: StripeIntegration
  invoiceGenerator: InvoiceService
  usageTracker: UsageMetrics
  dunningManager: DunningManager
}

interface SubscriptionPlan {
  id: string
  name: string
  tier: 'free' | 'basic' | 'premium' | 'enterprise'
  price: Money
  interval: 'monthly' | 'yearly' | 'lifetime'
  features: Feature[]
  limits: UsageLimits
  trial?: TrialPeriod
}
```

#### Features

- **Flexible Tiers**:
  - Free: Basic features, 10 practice questions/day
  - Basic ($9.99/mo): Full content, 50 questions/day
  - Premium ($19.99/mo): Unlimited + AI coaching
  - Enterprise (Custom): Team features, SSO, analytics
- **Payment Options**: Credit card, PayPal, wire transfer
- **Trial Management**: 14-day free trial for premium
- **Usage Tracking**: API calls, storage, study time
- **Proration**: Automatic calculation for upgrades/downgrades
- **Dunning Process**: Failed payment recovery
- **Revenue Recognition**: Compliance with accounting standards

#### Pricing Engine

```typescript
class PricingEngine {
  calculatePrice(user: User, plan: SubscriptionPlan): PriceQuote {
    let basePrice = plan.price

    // Apply discounts
    const discounts = []

    if (user.isStudent) {
      discounts.push({ type: 'STUDENT', amount: 0.2 })
    }

    if (plan.interval === 'yearly') {
      discounts.push({ type: 'ANNUAL', amount: 0.15 })
    }

    if (user.referralCount > 3) {
      discounts.push({ type: 'REFERRAL', amount: 0.1 })
    }

    // Calculate final price
    const totalDiscount = Math.min(
      0.4,
      discounts.reduce((sum, d) => sum + d.amount, 0)
    )
    const finalPrice = basePrice * (1 - totalDiscount)

    return {
      basePrice,
      discounts,
      finalPrice,
      currency: user.currency,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  }
}
```

---

## Analytics & Monitoring

### 10. Learning Analytics Dashboard

#### Overview

Comprehensive analytics system providing insights into learning patterns, performance trends, and predictive success metrics.

#### User Stories

- **As a learner**, I want to understand my learning patterns and improve
- **As an instructor**, I want to identify students who need help
- **As a platform admin**, I want to understand user engagement

#### Technical Requirements

```typescript
interface AnalyticsSystem {
  collectors: DataCollector[]
  processors: DataProcessor[]
  storage: TimeSeriesDB
  visualizations: ChartLibrary
  ml: MachineLearningPipeline
  reporting: ReportGenerator
}

interface LearningMetrics {
  userId: string
  studyTime: Duration
  questionsAnswered: number
  correctAnswers: number
  knowledgeAreaScores: Map<string, number>
  learningVelocity: number
  predictedExamScore: number
  recommendedStudyHours: number
}
```

#### Features

- **Personal Analytics**:
  - Daily/weekly/monthly study time
  - Performance by knowledge area
  - Learning velocity trends
  - Weakness identification
  - Exam readiness score

- **Comparative Analytics**:
  - Peer comparison
  - Global percentile ranking
  - Study group performance
  - Benchmark against exam passers

- **Predictive Analytics**:
  - Exam success probability
  - Estimated preparation time
  - Optimal study schedule
  - Risk areas identification

#### Machine Learning Models

```python
class ExamSuccessPredictor:
    def __init__(self):
        self.model = XGBoostRegressor()
        self.feature_pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('selector', SelectKBest(k=20))
        ])

    def predict_success_probability(self, user_metrics):
        features = self.extract_features(user_metrics)

        # Key features
        # - Study consistency (std deviation of daily study time)
        # - Practice test scores trend
        # - Knowledge area balance
        # - Time since last study
        # - Total study hours
        # - Question accuracy rate
        # - Review frequency

        X = self.feature_pipeline.transform(features)
        probability = self.model.predict(X)[0]

        return {
            'probability': probability,
            'confidence': self.calculate_confidence(X),
            'key_factors': self.explain_prediction(X),
            'recommendations': self.generate_recommendations(features, probability)
        }
```

---

## Implementation Priorities

### Phase 1: Core Enhancement (Q1 2025)

1. Complete spaced repetition algorithm
2. Launch adaptive learning paths
3. Implement real-time collaboration
4. Deploy advanced analytics

### Phase 2: Monetization (Q2 2025)

1. Launch subscription tiers
2. Implement enterprise features
3. Add payment processing
4. Create affiliate program

### Phase 3: Scale & Optimize (Q3 2025)

1. Mobile app development
2. International expansion
3. AI features enhancement
4. Performance optimization

### Phase 4: Innovation (Q4 2025)

1. VR/AR experiences
2. Blockchain certificates
3. Advanced ML models
4. Platform APIs

## Success Criteria

Each feature must meet:

- **Performance**: < 3s load time, 60fps interactions
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: OWASP Top 10 compliance
- **Scalability**: Support 10,000 concurrent users
- **Reliability**: 99.9% uptime SLA
- **User Satisfaction**: NPS > 50

---

## INFRASTRUCTURE DEVOPS

_Source: `docs/architecture/INFRASTRUCTURE_DEVOPS.md`_

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
    framework: 'React 18.2',
    routing: 'React Router v6 (HashRouter)',
    styling: 'Tailwind CSS v3',
    visualization: 'D3.js v7',
    buildTool: 'Vite v5',
  },

  backend: null, // バックエンドなし

  storage: {
    type: 'Client-side only',
    method: 'LocalStorage API',
    capacity: '~5-10MB per domain',
  },

  hosting: {
    platform: 'GitHub Pages',
    deployment: 'gh-pages branch',
    ssl: '自動提供',
    customDomain: 'サポート（CNAME設定可能）',
  },
}
```

## 2. 現在のCI/CDパイプライン

### 2.1 GitHub Actions デプロイメント設定

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    // パフォーマンス最適化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true,
  },
})
```

## 3. パフォーマンス最適化（静的サイト向け）

### 3.1 フロントエンド最適化

```javascript
// パフォーマンス最適化の実装例

// 1. コード分割とLazy Loading
const PMBOKMatrix = lazy(() => import('./components/PMBOKMatrix'))
const ITTOForceGraph = lazy(() => import('./components/ITTOForceGraph'))
const MockExam = lazy(() => import('./components/MockExam'))

// 2. 画像最適化
const imageOptimization = {
  formats: ['webp', 'avif'], // 次世代フォーマット
  lazy: true, // 遅延読み込み
  responsive: true, // レスポンシブ画像
  compression: 85, // 品質設定
}

// 3. キャッシュ戦略
const cacheStrategy = {
  assets: {
    'js/css': 'max-age=31536000, immutable', // 1年（ハッシュ付き）
    images: 'max-age=86400, must-revalidate', // 1日
    html: 'no-cache, no-store, must-revalidate', // 常に最新
  },
}

// 4. Service Worker（PWA化）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### 3.2 バンドルサイズ最適化

```bash

npm run build -- --report

```

## 4. モニタリング戦略（静的サイト向け）

### 4.1 無料モニタリングツール

```javascript
// 1. Google Analytics 4（無料）
const GA4_CONFIG = {
  measurementId: 'G-XXXXXXXXXX',
  events: ['page_view', 'quiz_start', 'quiz_complete', 'study_progress'],
}

// 2. Sentry（無料枠）- エラー監視
Sentry.init({
  dsn: 'https://xxx@xxx.ingest.sentry.io/xxx',
  environment: 'production',
  tracesSampleRate: 0.1, // 10%サンプリング
  beforeSend(event) {
    // PII除去
    if (event.user) {
      delete event.user.email
    }
    return event
  },
})

// 3. Web Vitals測定
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Google Analyticsに送信
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### 4.2 ヘルスチェックとアップタイム監視

```yaml
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
  const { method } = req

  switch (method) {
    case 'GET':
      // Vercel KVから進捗データ取得
      const progress = await kv.get(`progress:${req.query.userId}`)
      return res.json(progress)

    case 'POST':
      // 進捗データ保存
      await kv.set(`progress:${req.body.userId}`, req.body.progress)
      return res.json({ success: true })

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

// インフラ構成
const phase2Infrastructure = {
  hosting: 'Vercel (無料) or Netlify (無料)',
  serverless: 'Vercel Functions / Netlify Functions',
  database: 'Vercel KV (無料枠: 30MB) / Supabase (無料枠: 500MB)',
  authentication: 'Clerk (無料枠: 5000 MAU) / Auth0 (無料枠: 7000 MAU)',
  estimatedCost: '$0-20/月（トラフィックによる）',
}
```

### 5.3 Phase 3: フルスタックアプリケーション（コスト: $20-100/月）

```yaml
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
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
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

git clone --mirror https://github.com/username/PMPLearningManagement.git
tar -czf pmp-backup-$(date +%Y%m%d).tar.gz PMPLearningManagement.git

npm run build
tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/

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
    hosting: 0, // GitHub Pages
    cdn: 0, // 組み込み
    ssl: 0, // 自動提供
    cicd: 0, // GitHub Actions無料枠
    monitoring: 0, // Google Analytics
    total: 0,
  },

  future_options: {
    custom_domain: 10, // 年間（オプション）
    enhanced_monitoring: 10, // Sentry Pro（オプション）
    backup_storage: 5, // クラウドストレージ（オプション）
  },
}
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
    timeline: '0-3ヶ月',
    features: ['PWA化（オフライン対応）', 'Web Share API統合', 'プッシュ通知（Web Push）'],
    cost: 0,
  },

  phase2: {
    timeline: '3-6ヶ月',
    features: ['ユーザー認証', 'クラウド同期', '協調学習機能'],
    infrastructure: 'Supabase or Firebase',
    cost: '$0-20/月',
  },

  phase3: {
    timeline: '6-12ヶ月',
    features: ['AI学習アシスタント', 'リアルタイム共同編集', '動画コンテンツ配信'],
    infrastructure: 'Vercel + Edge Functions',
    cost: '$50-100/月',
  },
}
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

---

## DEPLOYMENT

_Source: `docs/guides/DEPLOYMENT.md`_

This document provides comprehensive guidance for deploying the PMPLearningManagement application across different environments.

## Overview

The application uses a modern CI/CD pipeline with comprehensive testing, quality gates, and monitoring to ensure reliable deployments.

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local testing │───▶│ • Integration   │───▶│ • Live users    │
│ • Feature dev   │    │ • QA testing    │    │ • Full monitoring│
│ • Unit tests    │    │ • E2E tests     │    │ • Performance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest stable version
- **bash**: For deployment scripts (Linux/macOS/WSL)

### Development Tools

```bash

npm install -g @lighthouse-ci/cli
npm install -g bundlesize
```

### Environment Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
   cd PMPLearningManagement
   ```

2. **Install dependencies**:

   ```bash
   npm ci
   ```

3. **Install Playwright browsers**:
   ```bash
   npm run playwright:install
   ```

## Environment Configuration

### Environment Files

The application supports multiple environment configurations:

- **`.env.example`**: Template with all available variables
- **`.env.local`**: Local development (not tracked)
- **`.env.staging`**: Staging environment configuration
- **`.env.production`**: Production environment configuration

### Key Environment Variables

```bash

NODE_ENV=production
VITE_APP_ENV=production

VITE_BUILD_VERSION=$GITHUB_SHA
VITE_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

VITE_MAX_BUNDLE_SIZE=5120
VITE_MAX_ASSET_SIZE=1024
```

## CI/CD Pipeline

### Pipeline Overview

The CI/CD pipeline consists of several stages:

1. **Quality Gates** - Code quality and standards
2. **Unit Testing** - Component and utility testing
3. **E2E Testing** - End-to-end user journey testing
4. **Accessibility Testing** - WCAG compliance verification
5. **Performance Analysis** - Bundle size and Lighthouse auditing
6. **Security Scanning** - Dependency and vulnerability scanning
7. **Build and Deploy** - Production build and deployment
8. **Health Checks** - Post-deployment validation

### GitHub Actions Workflow

The main workflow (`.github/workflows/deploy.yml`) handles:

- **Parallel testing** across multiple browsers and shards
- **Quality gates** with configurable thresholds
- **Performance budgets** and bundle size monitoring
- **Security audits** and vulnerability scanning
- **Automated deployment** to GitHub Pages
- **Health checks** and rollback capabilities

### Branch Strategy

#### Main Branch (`main`)

- **Protection**: Required status checks, PR reviews
- **Deployment**: Automatic to production on merge
- **Quality**: All tests must pass, 80%+ coverage

#### Develop Branch (`develop`) [Optional]

- **Protection**: Basic quality checks
- **Deployment**: Staging environment
- **Quality**: Unit tests and linting required

#### Feature Branches (`feature/*`)

- **Protection**: None (developer responsibility)
- **Deployment**: None
- **Quality**: Local testing recommended

### Pull Request Process

1. **Create Feature Branch**:

   ```bash
   git checkout -b feature/new-feature
   git push -u origin feature/new-feature
   ```

2. **Development and Testing**:

   ```bash
   npm run test
   npm run lint
   npm run test:e2e
   ```

3. **Create Pull Request**:
   - Automated checks run on PR creation
   - Quality gates must pass
   - Required reviewer approval

4. **Merge to Main**:
   - Squash merge recommended
   - Automatic deployment triggered

## Deployment Methods

### 1. Automated Deployment (Recommended)

The primary deployment method uses GitHub Actions:

```yaml
git push origin main
```

**Process**:

1. Quality checks and testing
2. Build optimization
3. Performance validation
4. Security scanning
5. Deployment to GitHub Pages
6. Health verification

### 2. Manual Deployment

For emergency deployments or local testing:

```bash

./scripts/deploy.sh production

./scripts/deploy.sh staging

./scripts/deploy.sh production true
```

### 3. Direct GitHub Pages Deployment

```bash

npm run build
npm run deploy
```

**Note**: This bypasses quality checks and should only be used for hotfixes.

## Quality Gates

### Code Quality Standards

- **Linting**: ESLint with React hooks rules
- **Testing**: Minimum 80% code coverage
- **Bundle Size**: Maximum 5MB total bundle
- **Performance**: Lighthouse scores > 80

### Testing Requirements

```bash

npm run test:run          # Run all unit tests
npm run test:coverage     # Generate coverage report

npm run test:e2e         # Full E2E test suite
npm run test:e2e:headed  # Run with browser UI

npm run test:a11y        # WCAG compliance check

npm run test:all         # Complete test suite
```

### Performance Budgets

- **Total Bundle**: 5MB maximum
- **Main Bundle**: 1MB maximum
- **Vendor Bundle**: 800KB maximum
- **CSS Bundle**: 50KB maximum

### Security Requirements

```bash

npm run security:audit

npm audit --audit-level=high
```

## Monitoring and Observability

### Health Monitoring

The application includes comprehensive health monitoring:

```bash

./scripts/health-check.sh

./scripts/health-check.sh https://example.com 30 3
```

**Health Check Coverage**:

- HTTP connectivity and response codes
- Response time performance
- Content validation
- Build information verification
- Route accessibility
- Security headers
- Resource availability

### Performance Monitoring

- **Lighthouse CI**: Automated performance auditing
- **Bundle Analysis**: Size tracking and alerts
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Real User Monitoring**: Performance tracking

### Error Tracking

- **JavaScript Errors**: Client-side error capture
- **Network Errors**: API and resource failures
- **Performance Errors**: Slow loading detection
- **User Experience**: Navigation and interaction issues

### Uptime Monitoring

Configuration in `monitoring/uptime-config.yml`:

- **Endpoints**: Main routes and critical pages
- **Intervals**: 5-minute checks for critical paths
- **Alerts**: Email and webhook notifications
- **Thresholds**: 99.9% availability target

## Rollback Procedures

### Automatic Rollback

The deployment script includes automatic rollback on:

- Health check failures
- Critical performance degradation
- Error rate spikes

### Manual Rollback

```bash

git log --oneline -n 5
git reset --hard <previous-commit>
./scripts/deploy.sh production
```

### Rollback Validation

```bash

./scripts/health-check.sh
curl -s https://yusuke-kurosawa.github.io/PMPLearningManagement/build-info.json | jq .
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash

rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Test Failures

```bash

npm run test:run -- --update-snapshots

npm run test -- --run specific-test.test.js
```

#### 3. Deployment Issues

```bash

base: '/PMPLearningManagement/',
```

#### 4. Performance Issues

```bash

npm run build:analyze

npx bundlesize
```

### Debug Mode

Enable debug logging:

```bash
export DEBUG=deploy:*
./scripts/deploy.sh production
```

### Health Check Debug

```bash

./scripts/health-check.sh https://example.com 30 3 --verbose

curl -v https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

## Security

### Deployment Security

- **Branch Protection**: Required reviews and status checks
- **Secret Management**: Environment-specific configurations
- **Dependency Scanning**: Automated vulnerability detection
- **Content Security**: CSP headers and HTTPS enforcement

### Security Checklist

- [ ] No secrets in source code
- [ ] Dependencies are up to date
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Input validation implemented
- [ ] Error messages don't leak information

## Performance Optimization

### Build Optimization

- **Code Splitting**: Separate vendor and feature bundles
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Optimization**: Image and font optimization

### Runtime Optimization

- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo and useMemo
- **Virtualization**: Large list optimization
- **Caching**: Browser and CDN caching

## Compliance and Auditing

### Accessibility Compliance

- **WCAG 2.1 AA**: Automated testing with jest-axe
- **Screen Reader**: Semantic HTML and ARIA
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 ratio

### Performance Compliance

- **Core Web Vitals**: Google's UX metrics
- **Lighthouse Scores**: 90+ target for all categories
- **Bundle Budgets**: Size limitations enforced
- **Response Times**: Sub-3s loading targets

## Future Enhancements

### Planned Improvements

1. **Multi-Environment Deployments**
   - Staging environment setup
   - Preview deployments for PRs
   - Blue-green deployment strategy

2. **Advanced Monitoring**
   - Real user monitoring (RUM)
   - Error tracking integration (Sentry)
   - Custom dashboard deployment

3. **Performance Enhancements**
   - Service worker implementation
   - Progressive Web App features
   - Edge computing optimization

4. **Security Enhancements**
   - Content Security Policy
   - Subresource Integrity
   - Regular security audits

### Infrastructure Scaling

When migrating from GitHub Pages:

1. **CDN Integration**: CloudFlare or AWS CloudFront
2. **Backend Services**: API server deployment
3. **Database Integration**: User data persistence
4. **Real-time Features**: WebSocket support
5. **Microservices**: Service-oriented architecture

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Dependency updates and security patches
- **Monthly**: Performance review and optimization
- **Quarterly**: Infrastructure review and capacity planning
- **Annually**: Security audit and compliance review

### Monitoring Dashboard Access

- **Health Status**: Real-time uptime and performance
- **Error Tracking**: Issue identification and resolution
- **Performance Metrics**: User experience monitoring
- **Business Analytics**: Usage patterns and trends

### Contact Information

For deployment issues or questions:

- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Email security@pmp-learning.com
- **Performance Issues**: Monitor alerts and dashboards
- **General Questions**: Documentation and wiki

---

_This deployment guide is maintained by the development team and updated with each major release._

---

## CLOUD DEPLOYMENT GUIDE

_Source: `docs/CLOUD_DEPLOYMENT_GUIDE.md`_

## Mobile-First PWA Deployment on GitHub Pages

This guide documents the comprehensive cloud deployment infrastructure optimized for mobile-first Progressive Web App (PWA) delivery of the PMP Learning Management System.

## 🎯 Architecture Overview

### Deployment Strategy

- **Platform**: GitHub Pages (Zero-cost, CDN-backed)
- **Focus**: Mobile-first PWA optimization
- **Performance Target**: Lighthouse scores >75 (Performance), >90 (Accessibility)
- **Bundle Budget**: <500KB total (gzipped)

### Key Optimizations

- **PWA Configuration**: Full offline support with service worker
- **Mobile-First**: Optimized for 3G networks and mobile devices
- **Security**: Enhanced CSP and security headers
- **Performance**: Core Web Vitals monitoring and optimization
- **Accessibility**: WCAG 2.1 compliance monitoring

## 🚀 Deployment Pipeline

### Enhanced GitHub Actions Workflow

**Location**: `.github/workflows/deploy.yml`

#### Pipeline Stages:

1. **Quality Gates**
   - ESLint and TypeScript checks
   - Code formatting validation
   - Security vulnerability scanning

2. **Performance Validation**
   - Bundle size analysis with performance budget
   - PWA asset validation (manifest, service worker)
   - Mobile-specific performance testing

3. **Optimized Build**
   - Terser compression with mobile-optimized settings
   - Code splitting for optimal chunk sizes
   - PWA asset generation and optimization

4. **Deployment**
   - GitHub Pages deployment with PWA enhancements
   - Service worker and offline page deployment
   - Security headers and CSP configuration

5. **Post-Deployment Validation**
   - Lighthouse CI performance audit
   - PWA installation testing
   - Health checks and accessibility validation

### Deployment Commands

```bash

npm run build

npm run build:optimized

npm run deploy:production
```

## 📱 PWA Infrastructure

### Service Worker Configuration

**Location**: `public/sw.js`

**Features**:

- **Advanced Caching Strategies**:
  - Cache-first for static assets
  - Network-first for dynamic content
  - Stale-while-revalidate for HTML pages
- **Offline Support**: Comprehensive offline functionality
- **Background Sync**: Progress and exam result synchronization
- **Push Notifications**: Ready for future implementation
- **Cache Management**: Automatic cleanup of old caches

### PWA Manifest

**Location**: `public/manifest.json`

**Features**:

- **App Identity**: Proper name, icons, and branding
- **Display Modes**: Standalone app experience
- **Shortcuts**: Quick access to key features
- **Screenshots**: Store listing ready
- **Categories**: Education, productivity, business

### Mobile Optimizations

**Location**: `scripts/optimize-deployment.js`

**Enhancements**:

- **Mobile Meta Tags**: Viewport, theme color, Apple-specific
- **Install Prompts**: Add to home screen functionality
- **Touch Icons**: iOS and Android app icons
- **Splash Screens**: Native app-like launch experience

## 🔒 Security Configuration

### Content Security Policy

**Location**: `public/_headers`

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com data:;
  img-src 'self' data: https:;
  connect-src 'self' https:;
  manifest-src 'self';
  worker-src 'self'
```

### Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Caching Strategy

- **Static Assets**: 1 year cache with immutable flag
- **HTML Pages**: 1 hour cache for updates
- **Service Worker**: No cache for instant updates
- **PWA Manifest**: 1 day cache

## 📊 Performance Monitoring

### Lighthouse CI Integration

**Location**: `.github/workflows/performance-monitoring.yml`

**Monitoring Schedule**:

- **Pull Requests**: Automatic performance review
- **Continuous**: Every 6 hours for production
- **On-Demand**: Manual trigger available

### Core Web Vitals Tracking

**Metrics Monitored**:

- **First Contentful Paint (FCP)**: <2 seconds
- **Largest Contentful Paint (LCP)**: <4 seconds
- **Cumulative Layout Shift (CLS)**: <0.1
- **Total Blocking Time (TBT)**: <500ms

### Mobile Performance Testing

**Test Scenarios**:

- **Device Simulation**: Moto G4 (mobile testing standard)
- **Network Conditions**: 3G (1.6 Mbps down, 750 Kbps up)
- **CPU Throttling**: 4x slowdown for realistic conditions

### Performance Budget

**Location**: `.bundlesizerc.json`

**Limits**:

- **Main Bundle**: 200KB (gzipped)
- **Vendor Bundle**: 300KB (gzipped)
- **D3 Visualization**: 150KB (gzipped)
- **CSS Assets**: 50KB (gzipped)

## 🎨 Mobile-First Optimizations

### Build Configuration

**Location**: `vite.config.mjs`

**Optimizations**:

- **Terser Compression**: Advanced minification
- **Code Splitting**: Optimal chunk strategy
- **Tree Shaking**: Unused code elimination
- **Modern Targets**: ES2015+ for better performance

### Bundle Analysis

- **Automatic Analysis**: On every build
- **Size Tracking**: Historical size monitoring
- **Dependency Analysis**: Heavy dependency identification
- **Optimization Recommendations**: Automated suggestions

## 🔧 Infrastructure Components

### Automated Deployment Script

**Location**: `scripts/optimize-deployment.js`

**Functions**:

1. **Build Verification**: Ensures complete build output
2. **HTML Optimization**: Mobile PWA enhancements
3. **SPA Routing**: GitHub Pages compatibility
4. **PWA Asset Copying**: Manifest, SW, offline page
5. **Asset Optimization**: Size analysis and reporting
6. **Deployment Report**: Comprehensive optimization summary

### GitHub Pages Configuration

**Settings Required**:

- **Source**: GitHub Actions deployment
- **Custom Domain**: Optional (supports custom domains)
- **HTTPS**: Automatic SSL certificate
- **Build Process**: Automated via Actions

## 📈 Monitoring & Analytics

### Performance Alerts

**Automatic Monitoring**:

- **Performance Regression**: Lighthouse score drops
- **Bundle Size Alerts**: Budget exceeded notifications
- **Core Web Vitals**: Metric threshold violations
- **PWA Validation**: Missing PWA assets

### Reporting

**Artifacts Generated**:

- **Lighthouse Reports**: Detailed performance analysis
- **Bundle Analysis**: Size breakdown and trends
- **Core Web Vitals**: Mobile performance metrics
- **Accessibility Reports**: WCAG compliance status

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Performance budget respected
- [ ] PWA assets validated
- [ ] Security headers configured
- [ ] Mobile optimization verified

### Post-Deployment

- [ ] Site accessibility confirmed (200 response)
- [ ] PWA installation working
- [ ] Service worker registration successful
- [ ] Offline functionality verified
- [ ] Mobile performance acceptable

## 🔄 Continuous Optimization

### Performance Monitoring

- **Scheduled Audits**: Every 6 hours
- **Alert System**: Automated issue creation
- **Historical Tracking**: Performance trend analysis
- **Mobile Focus**: Priority on mobile metrics

### Bundle Optimization

- **Size Monitoring**: Continuous tracking
- **Code Splitting**: Dynamic optimization
- **Dependency Analysis**: Regular cleanup
- **Performance Budget**: Strict enforcement

## 📞 Support & Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version (18+)
2. **PWA Not Installing**: Verify manifest and service worker
3. **Performance Issues**: Review bundle analysis
4. **Offline Mode**: Check service worker registration

### Debug Commands

```bash

npm run build:optimized
npm run start

npm run analyze

npm run performance:budget

npm run deploy:production
```

### Monitoring URLs

- **Production Site**: https://yusuke-kurosawa.github.io/PMPLearningManagement/
- **GitHub Actions**: Repository Actions tab
- **Lighthouse CI**: Check workflow artifacts
- **Performance Reports**: Download from Actions runs

## 🎯 Success Metrics

### Performance Targets

- ✅ **Lighthouse Performance**: >75
- ✅ **Lighthouse Accessibility**: >90
- ✅ **Bundle Size**: <500KB gzipped
- ✅ **Mobile LCP**: <4 seconds
- ✅ **Mobile CLS**: <0.1

### PWA Compliance

- ✅ **Installable**: Add to home screen working
- ✅ **Offline**: Core functionality available offline
- ✅ **Responsive**: Mobile-first design
- ✅ **Security**: HTTPS and CSP configured
- ✅ **Performance**: Fast loading on mobile networks

---

_This cloud deployment infrastructure provides enterprise-grade mobile-first PWA deployment with comprehensive monitoring, security, and performance optimization._

---
