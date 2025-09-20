# API アーキテクチャ設計

## 概要

PMPLearningManagementのAPI設計は、フロントエンド優先のアプローチを採用し、将来的なバックエンド統合に向けた準備を整えています。

## 現在の実装状態

### フロントエンドサービス層

```
src/services/
├── authService.js          # Supabase認証
├── progressService.js       # 学習進捗管理
├── auditService.js         # 監査ログ
├── collaborationService.js # コラボレーション機能
├── aiCoachingService.js    # AIコーチング（モック）
├── searchService.js        # 検索機能
├── glossaryService.js      # 用語集管理
├── exportService.js        # データエクスポート
├── importService.js        # データインポート
├── contextManager.js       # コンテキスト管理
├── performanceOptimizer.js # パフォーマンス最適化
└── offlineManager.js       # オフライン対応
```

## API設計パターン

### 1. サービス層アーキテクチャ

```javascript
// 基本サービスパターン
class BaseService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async request(endpoint, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, options);
    
    // キャッシュチェック
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 重複リクエスト防止
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    const promise = this.performRequest(endpoint, options);
    this.pendingRequests.set(cacheKey, promise);
    
    try {
      const result = await promise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
}
```

### 2. 認証サービス (Supabase統合)

```javascript
// authService.js
class AuthService {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw new AuthError(error.message);
    
    // トークン管理
    this.storeTokens(data.session);
    
    // ユーザーデータ取得
    return this.getUserProfile(data.user.id);
  }

  async refreshToken() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new AuthError('Token refresh failed');
    return data.session;
  }

  setupInterceptor() {
    // 401エラー時の自動リトライ
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        this.updateStoredTokens(session);
      }
    });
  }
}
```

## RESTful API設計（将来実装）

### エンドポイント構造

```
BASE_URL: https://api.pmplearning.com/v1

認証:
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh
GET    /auth/verify
POST   /auth/reset-password

ユーザー:
GET    /users/profile
PUT    /users/profile
DELETE /users/account
GET    /users/{id}/progress
POST   /users/preferences

学習:
GET    /learning/progress
POST   /learning/progress
GET    /learning/statistics
GET    /learning/recommendations

プロセス:
GET    /processes
GET    /processes/{id}
GET    /processes/{id}/itto
POST   /processes/{id}/complete

用語集:
GET    /glossary
GET    /glossary/{id}
GET    /glossary/search?q={query}

試験:
GET    /exams
POST   /exams/start
POST   /exams/{id}/submit
GET    /exams/{id}/results
GET    /exams/history

コラボレーション:
GET    /groups
POST   /groups
GET    /groups/{id}/members
POST   /groups/{id}/join
GET    /notes/shared
POST   /notes/share

AI:
POST   /ai/coaching/advice
POST   /ai/analyze/weakness
GET    /ai/recommendations
```

### リクエスト/レスポンス形式

```javascript
// 標準リクエストヘッダー
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "uuid-v4",
  "X-Client-Version": "1.0.0"
}

// 標準レスポンス構造（成功）
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}

// 標準エラーレスポンス
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "認証に失敗しました",
    "details": {
      "field": "password",
      "reason": "incorrect"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid-v4"
  }
}
```

## GraphQL実装（検討中）

```graphql
# スキーマ定義
type User {
  id: ID!
  email: String!
  profile: UserProfile!
  progress: LearningProgress!
  groups: [StudyGroup!]!
}

type LearningProgress {
  overall: Float!
  knowledgeAreas: [KnowledgeAreaProgress!]!
  processGroups: [ProcessGroupProgress!]!
  completedProcesses: [Process!]!
}

type Query {
  me: User!
  process(id: ID!): Process
  processes(filter: ProcessFilter): [Process!]!
  searchGlossary(query: String!): [GlossaryTerm!]!
}

type Mutation {
  updateProgress(input: ProgressInput!): LearningProgress!
  startExam(type: ExamType!): Exam!
  submitAnswer(examId: ID!, answer: AnswerInput!): AnswerResult!
}

type Subscription {
  progressUpdated: LearningProgress!
  groupMessage(groupId: ID!): Message!
}
```

## データ同期戦略

### オフライン対応

```javascript
// offlineManager.js
class OfflineManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', this.processSyncQueue);
    window.addEventListener('offline', this.handleOffline);
  }

  async queueRequest(request) {
    // IndexedDBに保存
    await this.saveToIndexedDB({
      id: generateId(),
      request,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    const pendingRequests = await this.getPendingRequests();
    
    for (const item of pendingRequests) {
      try {
        await this.processRequest(item);
        await this.removeFromQueue(item.id);
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }
  }
}
```

### リアルタイム同期（WebSocket）

```javascript
// realtimeSync.js
class RealtimeSync {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.subscriptions = new Map();
  }

  connect() {
    this.ws = new WebSocket('wss://api.pmplearning.com/ws');
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.resubscribe();
    };
    
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      this.handleMessage(type, data);
    };
    
    this.ws.onerror = this.handleError;
    this.ws.onclose = this.handleClose;
  }

  subscribe(channel, callback) {
    this.subscriptions.set(channel, callback);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    }
  }
}
```

## エラーハンドリング

### エラークラス階層

```javascript
// errors.js
class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

class AuthError extends APIError {
  constructor(message, code = 'AUTH_ERROR') {
    super(message, code, 401);
  }
}

class ValidationError extends APIError {
  constructor(message, fields) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fields = fields;
  }
}

class NetworkError extends APIError {
  constructor(message) {
    super(message, 'NETWORK_ERROR', 0);
  }
}
```

### グローバルエラーハンドラー

```javascript
// errorHandler.js
class ErrorHandler {
  static handle(error) {
    if (error instanceof AuthError) {
      // 認証エラー: ログイン画面へ
      this.redirectToLogin();
    } else if (error instanceof NetworkError) {
      // ネットワークエラー: リトライ提案
      this.showRetryNotification();
    } else if (error instanceof ValidationError) {
      // バリデーションエラー: フォームエラー表示
      this.displayFormErrors(error.fields);
    } else {
      // 不明なエラー: ログ送信
      this.logError(error);
      this.showGenericError();
    }
  }
}
```

## パフォーマンス最適化

### APIキャッシュ戦略

```javascript
// cacheManager.js
class CacheManager {
  constructor() {
    this.memoryCache = new LRUCache({ max: 100 });
    this.persistentCache = new IndexedDBCache();
  }

  async get(key) {
    // メモリキャッシュ確認
    let data = this.memoryCache.get(key);
    if (data) return data;
    
    // 永続キャッシュ確認
    data = await this.persistentCache.get(key);
    if (data) {
      this.memoryCache.set(key, data);
      return data;
    }
    
    return null;
  }

  async set(key, value, ttl = 3600) {
    // 両方のキャッシュに保存
    this.memoryCache.set(key, value);
    await this.persistentCache.set(key, value, ttl);
  }
}
```

### リクエスト最適化

```javascript
// requestOptimizer.js
class RequestOptimizer {
  constructor() {
    this.batchQueue = [];
    this.batchTimer = null;
  }

  batchRequest(request) {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ request, resolve, reject });
      
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, 50); // 50ms待機
      }
    });
  }

  async processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;
    
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify(batch.map(b => b.request))
      });
      
      const results = await response.json();
      
      batch.forEach((item, index) => {
        if (results[index].success) {
          item.resolve(results[index].data);
        } else {
          item.reject(results[index].error);
        }
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

## セキュリティ実装

### APIセキュリティ

```javascript
// security.js
class SecurityManager {
  // CSRFトークン管理
  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content;
  }

  // リクエスト署名
  signRequest(request) {
    const timestamp = Date.now();
    const signature = this.generateSignature(request, timestamp);
    
    return {
      ...request,
      headers: {
        ...request.headers,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      }
    };
  }

  // レート制限
  checkRateLimit(endpoint) {
    const key = `rate_${endpoint}`;
    const attempts = this.getAttempts(key);
    
    if (attempts > 10) {
      throw new Error('Rate limit exceeded');
    }
    
    this.incrementAttempts(key);
  }
}
```

## モニタリング・ログ

### APIモニタリング

```javascript
// monitoring.js
class APIMonitor {
  trackRequest(request, response, duration) {
    const metrics = {
      endpoint: request.url,
      method: request.method,
      status: response.status,
      duration,
      timestamp: new Date().toISOString()
    };
    
    // メトリクス送信
    this.sendMetrics(metrics);
    
    // 遅いリクエストの警告
    if (duration > 3000) {
      console.warn(`Slow API call: ${request.url} took ${duration}ms`);
    }
  }

  trackError(error, context) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    // エラーログ送信
    this.sendErrorLog(errorData);
  }
}
```

## 開発ツール

### API モック

```javascript
// mockServer.js (MSW使用)
import { setupWorker, rest } from 'msw';

const handlers = [
  rest.get('/api/processes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockProcesses
      })
    );
  }),
  
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { token: 'mock-jwt-token' }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: { message: 'Invalid credentials' }
      })
    );
  })
];

export const worker = setupWorker(...handlers);
```

### APIドキュメント生成

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: PMP Learning Management API
  version: 1.0.0
  description: 学習管理システムAPI

paths:
  /processes:
    get:
      summary: プロセス一覧取得
      parameters:
        - name: knowledgeArea
          in: query
          schema:
            type: string
        - name: processGroup
          in: query
          schema:
            type: string
      responses:
        200:
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProcessList'
```