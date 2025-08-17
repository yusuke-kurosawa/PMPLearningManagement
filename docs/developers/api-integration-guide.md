# 🔗 PMPLearningManagement API統合ガイド

## 概要

PMPLearningManagement APIは、RESTful設計原則に基づく包括的なAPIセットを提供し、サードパーティシステムとのシームレスな統合を実現します。

## 🚀 Getting Started

### API認証

#### APIキーの取得

1. 管理コンソールにログイン
2. 「設定」→「API管理」に移動
3. 「新規APIキー作成」をクリック
4. 用途とスコープを設定
5. APIキーとシークレットを安全に保管

#### 認証方式

```bash
# Bearer Token認証
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.pmlearning.com/v2/projects

# OAuth 2.0
curl -X POST https://api.pmlearning.com/oauth/token \
     -d "grant_type=client_credentials" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET"
```

### Rate Limiting

| プラン | リクエスト/秒 | リクエスト/日 | バースト上限 |
|--------|--------------|---------------|-------------|
| Free | 10 | 1,000 | 20 |
| Starter | 50 | 10,000 | 100 |
| Professional | 200 | 100,000 | 500 |
| Enterprise | 1000 | 無制限 | 2000 |

## 📚 API エンドポイント

### Projects API

#### プロジェクト一覧取得

```http
GET /api/v2/projects
```

**パラメータ:**
```javascript
{
  "page": 1,
  "limit": 20,
  "sort": "createdAt:desc",
  "filter": {
    "status": ["active", "planning"],
    "startDate": { "$gte": "2024-01-01" },
    "budget": { "$between": [1000000, 10000000] }
  },
  "include": ["team", "milestones", "risks"]
}
```

**レスポンス:**
```javascript
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "Digital Transformation Project",
      "description": "Enterprise-wide digital transformation initiative",
      "status": "active",
      "startDate": "2024-01-15",
      "endDate": "2024-12-31",
      "budget": 5000000,
      "currency": "JPY",
      "progress": 45,
      "team": {
        "manager": { "id": "user_123", "name": "山田太郎" },
        "members": [/* ... */]
      },
      "milestones": [/* ... */],
      "risks": [/* ... */],
      "createdAt": "2024-01-01T09:00:00Z",
      "updatedAt": "2024-03-15T14:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

#### プロジェクト作成

```http
POST /api/v2/projects
```

**リクエストボディ:**
```javascript
{
  "name": "New Product Launch",
  "description": "Q2 2024 product launch project",
  "type": "product_development",
  "methodology": "agile",
  "startDate": "2024-04-01",
  "endDate": "2024-06-30",
  "budget": 3000000,
  "currency": "JPY",
  "team": {
    "managerId": "user_456",
    "memberIds": ["user_789", "user_012"]
  },
  "objectives": [
    {
      "title": "Complete MVP",
      "targetDate": "2024-05-15",
      "metrics": { "features": 10, "quality": 95 }
    }
  ]
}
```

### Learning API

#### 学習進捗取得

```http
GET /api/v2/users/{userId}/learning/progress
```

**レスポンス:**
```javascript
{
  "userId": "user_123",
  "overall": {
    "completionRate": 75,
    "totalHours": 120,
    "streak": 15,
    "lastActivity": "2024-03-20T10:30:00Z"
  },
  "knowledgeAreas": [
    {
      "id": "integration",
      "name": "統合管理",
      "progress": 85,
      "completedProcesses": 6,
      "totalProcesses": 7
    }
  ],
  "certifications": {
    "pmp": {
      "status": "preparing",
      "readiness": 82,
      "estimatedDate": "2024-05-01",
      "mockExamScores": [75, 82, 88]
    }
  }
}
```

#### 学習パス推奨

```http
POST /api/v2/learning/recommendations
```

**リクエスト:**
```javascript
{
  "userId": "user_123",
  "goal": "pmp_certification",
  "targetDate": "2024-06-01",
  "availableHours": 10,
  "preferences": {
    "learningStyle": "visual",
    "difficulty": "intermediate",
    "focus": ["risk_management", "stakeholder_management"]
  }
}
```

### Analytics API

#### ダッシュボードメトリクス

```http
GET /api/v2/analytics/dashboard
```

**レスポンス:**
```javascript
{
  "period": "2024-Q1",
  "metrics": {
    "projects": {
      "total": 45,
      "completed": 12,
      "onTrack": 28,
      "atRisk": 5,
      "successRate": 87
    },
    "learning": {
      "activeUsers": 320,
      "totalHours": 4500,
      "completionRate": 78,
      "certificationRate": 45
    },
    "roi": {
      "costSavings": 15000000,
      "productivityGain": 25,
      "timeReduction": 35
    }
  },
  "trends": [/* ... */],
  "insights": [
    {
      "type": "recommendation",
      "priority": "high",
      "message": "Risk management training needed for 30% of PMs",
      "action": "schedule_training"
    }
  ]
}
```

## 🔄 Webhooks

### Webhook設定

```javascript
POST /api/v2/webhooks
{
  "url": "https://your-system.com/webhook",
  "events": [
    "project.created",
    "project.completed",
    "user.certified",
    "milestone.reached"
  ],
  "secret": "your_webhook_secret"
}
```

### イベントペイロード

```javascript
{
  "id": "evt_xyz789",
  "type": "project.completed",
  "created": "2024-03-20T15:00:00Z",
  "data": {
    "project": {
      "id": "proj_abc123",
      "name": "Digital Transformation Project",
      "completedAt": "2024-03-20T14:55:00Z",
      "finalBudget": 4800000,
      "successMetrics": {/* ... */}
    }
  }
}
```

### Webhook検証

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 🔧 SDK & ライブラリ

### JavaScript/TypeScript SDK

```bash
npm install @pmlearning/sdk
```

```javascript
import { PLMClient } from '@pmlearning/sdk';

const client = new PLMClient({
  apiKey: process.env.PLM_API_KEY,
  environment: 'production'
});

// プロジェクト取得
const projects = await client.projects.list({
  filter: { status: 'active' },
  limit: 10
});

// 学習進捗更新
await client.learning.updateProgress({
  userId: 'user_123',
  processId: 'process_456',
  completion: 100
});
```

### Python SDK

```bash
pip install pmlearning-sdk
```

```python
from pmlearning import PLMClient

client = PLMClient(
    api_key=os.environ['PLM_API_KEY'],
    environment='production'
)

# データ分析
analytics = client.analytics.get_dashboard(
    period='2024-Q1',
    metrics=['projects', 'learning', 'roi']
)

# レポート生成
report = client.reports.generate(
    type='monthly',
    format='pdf',
    recipients=['manager@example.com']
)
```

## 🔌 統合シナリオ

### 1. ERP統合

```javascript
// SAP統合例
async function syncProjectsWithSAP() {
  // SAPからプロジェクトデータ取得
  const sapProjects = await sapClient.getProjects();
  
  // PLMに同期
  for (const sapProject of sapProjects) {
    const plmProject = {
      externalId: sapProject.id,
      name: sapProject.name,
      budget: sapProject.budget,
      startDate: sapProject.startDate,
      // マッピング処理
    };
    
    await plmClient.projects.upsert(plmProject);
  }
}
```

### 2. Slack通知統合

```javascript
// Slack通知設定
const slackIntegration = {
  webhookUrl: process.env.SLACK_WEBHOOK,
  events: {
    'project.milestone.reached': async (event) => {
      await sendSlackMessage({
        text: `🎉 Milestone reached: ${event.data.milestone.name}`,
        channel: '#project-updates'
      });
    },
    'user.certified': async (event) => {
      await sendSlackMessage({
        text: `🏆 ${event.data.user.name} got PMP certified!`,
        channel: '#achievements'
      });
    }
  }
};
```

### 3. Power BI連携

```sql
-- Power BI用データビュー
CREATE VIEW project_analytics AS
SELECT 
  p.id,
  p.name,
  p.status,
  p.budget,
  p.progress,
  COUNT(DISTINCT t.user_id) as team_size,
  AVG(l.completion_rate) as avg_learning_progress,
  DATEDIFF(day, p.start_date, CURRENT_DATE) as days_elapsed
FROM projects p
LEFT JOIN team_members t ON p.id = t.project_id
LEFT JOIN learning_progress l ON t.user_id = l.user_id
GROUP BY p.id;
```

## 📊 GraphQL API (Beta)

### スキーマ例

```graphql
type Query {
  project(id: ID!): Project
  projects(filter: ProjectFilter, pagination: Pagination): ProjectConnection
  user(id: ID!): User
  learningPath(userId: ID!, goal: LearningGoal): LearningPath
}

type Project {
  id: ID!
  name: String!
  status: ProjectStatus!
  team: Team!
  milestones: [Milestone!]!
  risks(severity: RiskSeverity): [Risk!]!
  analytics: ProjectAnalytics!
}

type Mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProgress(projectId: ID!, progress: Int!): Project!
  assignTeamMember(projectId: ID!, userId: ID!, role: TeamRole!): Team!
}
```

### クエリ例

```graphql
query GetProjectDetails($projectId: ID!) {
  project(id: $projectId) {
    id
    name
    status
    team {
      manager {
        id
        name
        certifications
      }
      members {
        id
        name
        role
        learningProgress {
          overall
          knowledgeAreas {
            name
            progress
          }
        }
      }
    }
    risks(severity: HIGH) {
      id
      description
      impact
      probability
      mitigation
    }
  }
}
```

## 🛡️ セキュリティベストプラクティス

### APIキー管理

1. **環境変数使用**
```javascript
// ❌ 悪い例
const apiKey = "plm_live_abc123xyz789";

// ✅ 良い例
const apiKey = process.env.PLM_API_KEY;
```

2. **キーローテーション**
- 90日ごとの定期更新
- 侵害時の即時無効化
- 監査ログの定期確認

### データ暗号化

```javascript
// リクエスト署名
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(JSON.stringify(requestBody))
  .digest('base64');

headers['X-PLM-Signature'] = signature;
```

## 📈 パフォーマンス最適化

### バッチ処理

```javascript
// 個別リクエスト（非効率）❌
for (const userId of userIds) {
  await client.users.get(userId);
}

// バッチリクエスト（効率的）✅
const users = await client.users.getBatch(userIds);
```

### キャッシング戦略

```javascript
const cache = new Map();
const CACHE_TTL = 300000; // 5分

async function getCachedProject(projectId) {
  const cached = cache.get(projectId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const project = await client.projects.get(projectId);
  cache.set(projectId, { data: project, timestamp: Date.now() });
  return project;
}
```

## 🔍 トラブルシューティング

### 一般的なエラー

| エラーコード | 説明 | 対処法 |
|------------|------|--------|
| 401 | 認証失敗 | APIキーを確認 |
| 403 | 権限不足 | スコープを確認 |
| 429 | レート制限 | リトライロジック実装 |
| 500 | サーバーエラー | サポートに連絡 |

### デバッグモード

```javascript
const client = new PLMClient({
  apiKey: process.env.PLM_API_KEY,
  debug: true,
  logger: console
});
```

## 📞 開発者サポート

- **API Documentation**: [api.pmlearning.com/docs](https://api.pmlearning.com/docs)
- **Postman Collection**: [postman.pmlearning.com](https://postman.pmlearning.com)
- **API Status**: [status.pmlearning.com](https://status.pmlearning.com)
- **Developer Forum**: [forum.pmlearning.com/api](https://forum.pmlearning.com/api)
- **Support Email**: api-support@pmlearning.com

---

*最終更新: 2025-08-16*
*API Integration Guide v2.0*