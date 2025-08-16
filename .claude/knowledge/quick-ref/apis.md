# API & Services Quick Reference / API・サービス・クイックリファレンス

> 🔌 **Interactive API explorer**: `npm run quickref:api`  
> 📝 **Generate API client**: `npm run quickref:api:client`  
> 🧪 **Test endpoints**: `npm run quickref:api:test`

## 🎯 API Overview

### Base URLs

```yaml
Development:
  URL: http://localhost:3000/api/v1
  Auth: http://localhost:3000/auth
  WS: ws://localhost:3000

Staging:
  URL: https://staging-api.pmp-learning.com/api/v1
  Auth: https://staging-auth.pmp-learning.com
  WS: wss://staging-ws.pmp-learning.com

Production:
  URL: https://api.pmp-learning.com/api/v1
  Auth: https://auth.pmp-learning.com
  WS: wss://ws.pmp-learning.com
```

## 🔐 Authentication APIs

### Login / ログイン

```typescript
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}

Error: 401 Unauthorized
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}

curl example:
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Register / 登録

```typescript
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "name": "New User",
  "role": "student"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User"
  },
  "message": "Please check your email to verify your account"
}

Validation:
- Email: Valid format, unique
- Password: Min 8 chars, 1 uppercase, 1 number
- Name: 2-50 characters
```

### Refresh Token / トークン更新

```typescript
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refresh_token": "eyJhbGc..."
}

Response: 200 OK
{
  "access_token": "new_eyJhbGc...",
  "expires_in": 3600
}

Note: Refresh tokens are rotated on each use
```

### Logout / ログアウト

```typescript
POST /auth/logout
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Successfully logged out"
}

Side effects:
- Revokes refresh token
- Clears server session
- Invalidates access token
```

## 👤 User APIs

### Get Profile / プロフィール取得

```typescript
GET /api/v1/user/profile
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  },
  "subscription": {
    "plan": "premium",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}

Cache: 5 minutes
Rate limit: 100/hour
```

### Update Profile / プロフィール更新

```typescript
PUT /api/v1/user/profile
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "Updated Name",
  "avatar_url": "https://...",
  "settings": {
    "theme": "light",
    "notifications": false
  }
}

Response: 200 OK
{
  "user": { /* updated user object */ },
  "message": "Profile updated successfully"
}

Validation:
- Name: 2-50 characters
- Avatar URL: Valid URL, max 500 chars
```

### Delete Account / アカウント削除

```typescript
DELETE /api/v1/user/account
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "password": "current_password",
  "confirmation": "DELETE MY ACCOUNT"
}

Response: 200 OK
{
  "message": "Account scheduled for deletion in 30 days"
}

Notes:
- Soft delete for 30 days
- Can be recovered within grace period
- All data exported before deletion
```

## 📚 Learning APIs

### Get Progress / 進捗取得

```typescript
GET /api/v1/progress
Authorization: Bearer {access_token}

Query Parameters:
- area?: string (knowledge area)
- group?: string (process group)
- from?: date
- to?: date

Response: 200 OK
{
  "overall_progress": 67.5,
  "areas": [
    {
      "id": "integration",
      "name": "Integration Management",
      "progress": 80,
      "completed_processes": 5,
      "total_processes": 7
    }
  ],
  "recent_activity": [
    {
      "date": "2024-03-01",
      "type": "process_completed",
      "details": "Completed Risk Management Planning"
    }
  ],
  "stats": {
    "study_time_minutes": 1234,
    "streak_days": 15,
    "rank": 42
  }
}
```

### Update Progress / 進捗更新

```typescript
POST /api/v1/progress
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "process_id": "risk_management_planning",
  "status": "completed",
  "score": 85,
  "time_spent_minutes": 45,
  "notes": "Understood risk register creation"
}

Response: 200 OK
{
  "progress": { /* updated progress */ },
  "achievements": [
    {
      "id": "first_process",
      "name": "First Process Completed",
      "icon": "🎯"
    }
  ],
  "next_recommendation": {
    "process_id": "risk_identification",
    "reason": "Natural progression in Risk Management"
  }
}

Events triggered:
- Progress updated webhook
- Achievement notification
- Leaderboard update
```

### Get Study Sessions / 学習セッション取得

```typescript
GET /api/v1/sessions
Authorization: Bearer {access_token}

Query Parameters:
- limit?: number (default: 20, max: 100)
- offset?: number
- sort?: 'date' | 'duration' | 'score'

Response: 200 OK
{
  "sessions": [
    {
      "id": "session_123",
      "date": "2024-03-01T10:00:00Z",
      "duration_minutes": 45,
      "type": "flashcards",
      "score": 92,
      "items_reviewed": 30
    }
  ],
  "total": 150,
  "has_more": true
}
```

## 📝 Exam APIs

### Start Exam / 試験開始

```typescript
POST /api/v1/exam/start
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "type": "mock_exam",
  "difficulty": "intermediate",
  "question_count": 180,
  "time_limit_minutes": 230,
  "categories": ["risk", "quality", "scope"]
}

Response: 200 OK
{
  "exam_id": "exam_456",
  "questions": [
    {
      "id": "q_001",
      "text": "What is the primary purpose of...",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "category": "risk_management",
      "difficulty": 3
    }
  ],
  "started_at": "2024-03-01T10:00:00Z",
  "expires_at": "2024-03-01T13:50:00Z"
}

State management:
- Exam locked to session
- Auto-save every 30 seconds
- Resume capability
```

### Submit Answer / 解答提出

```typescript
PUT /api/v1/exam/{exam_id}/answer
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "question_id": "q_001",
  "answer": "b",
  "time_spent_seconds": 45,
  "flagged": false
}

Response: 200 OK
{
  "saved": true,
  "questions_answered": 45,
  "questions_remaining": 135,
  "time_remaining_seconds": 12600
}

Auto-save: Every answer is immediately persisted
```

### Submit Exam / 試験提出

```typescript
POST /api/v1/exam/{exam_id}/submit
Authorization: Bearer {access_token}

Response: 200 OK
{
  "exam_id": "exam_456",
  "score": 78.5,
  "passed": true,
  "correct_answers": 141,
  "total_questions": 180,
  "time_taken_minutes": 195,
  "breakdown": {
    "integration": { "score": 85, "correct": 6, "total": 7 },
    "scope": { "score": 75, "correct": 9, "total": 12 },
    "risk": { "score": 80, "correct": 8, "total": 10 }
  },
  "percentile": 72,
  "certificate_url": "https://..."
}

Post-processing:
- Generate certificate
- Update statistics
- Send email report
```

## 👥 Collaboration APIs

### Create Study Group / 学習グループ作成

```typescript
POST /api/v1/groups
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "PMP Warriors 2024",
  "description": "Preparing for May 2024 exam",
  "privacy": "public",
  "max_members": 20,
  "tags": ["pmp", "2024", "may"]
}

Response: 201 Created
{
  "group": {
    "id": "group_789",
    "name": "PMP Warriors 2024",
    "code": "PMPW24",
    "members_count": 1,
    "created_by": "user_123",
    "created_at": "2024-03-01T10:00:00Z"
  }
}
```

### Join Group / グループ参加

```typescript
POST /api/v1/groups/{group_id}/join
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "code": "PMPW24" // Optional for private groups
}

Response: 200 OK
{
  "joined": true,
  "group": { /* group details */ },
  "members": [ /* member list */ ]
}

Notifications:
- Group owner notified
- Welcome message sent
- Group chat access granted
```

### Share Notes / ノート共有

```typescript
POST /api/v1/notes/share
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "title": "Risk Management Summary",
  "content": "# Risk Management\n\n## Key Concepts...",
  "format": "markdown",
  "visibility": "group",
  "group_ids": ["group_789"],
  "tags": ["risk", "summary"]
}

Response: 201 Created
{
  "note": {
    "id": "note_321",
    "url": "https://app.pmp-learning.com/notes/note_321",
    "likes": 0,
    "views": 0,
    "shared_with": ["group_789"]
  }
}
```

## 🤖 AI Coaching APIs

### Get Recommendations / レコメンデーション取得

```typescript
GET /api/v1/ai/recommendations
Authorization: Bearer {access_token}

Query Parameters:
- type?: 'next_topic' | 'practice' | 'review'
- count?: number (max: 10)

Response: 200 OK
{
  "recommendations": [
    {
      "type": "next_topic",
      "item": {
        "id": "stakeholder_management",
        "name": "Stakeholder Management",
        "reason": "Builds on your communication skills",
        "estimated_time_minutes": 30
      },
      "confidence": 0.92
    },
    {
      "type": "practice",
      "item": {
        "id": "risk_quiz_3",
        "name": "Risk Management Quiz",
        "reason": "Reinforce recent learning",
        "questions": 20
      },
      "confidence": 0.87
    }
  ],
  "based_on": {
    "recent_activity": true,
    "performance_data": true,
    "learning_style": "visual"
  }
}
```

### Ask AI Coach / AIコーチに質問

```typescript
POST /api/v1/ai/coach
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "question": "What's the difference between risk and issue?",
  "context": "risk_management",
  "conversation_id": "conv_123" // Optional for context
}

Response: 200 OK
{
  "answer": "Great question! Here's the key difference:\n\n**Risk** is...",
  "sources": [
    {
      "type": "pmbok",
      "reference": "PMBOK 6th Edition, Page 397"
    }
  ],
  "follow_up_questions": [
    "How do you identify risks?",
    "What is a risk register?"
  ],
  "conversation_id": "conv_123"
}

Rate limit: 50 requests/day for free tier
```

## 📊 Analytics APIs

### Get Analytics / 分析データ取得

```typescript
GET /api/v1/analytics/overview
Authorization: Bearer {access_token}

Query Parameters:
- period?: '7d' | '30d' | '90d' | 'all'
- metrics?: string[] (comma-separated)

Response: 200 OK
{
  "period": "30d",
  "metrics": {
    "study_time": {
      "total_minutes": 2450,
      "daily_average": 81.7,
      "trend": "+15%"
    },
    "progress": {
      "completed_processes": 28,
      "completion_rate": 57.1,
      "projected_completion": "2024-05-15"
    },
    "performance": {
      "average_score": 82.3,
      "improvement": "+8.5%",
      "strengths": ["Risk", "Quality"],
      "weaknesses": ["Cost", "Procurement"]
    }
  },
  "charts": {
    "daily_activity": [ /* chart data */ ],
    "score_trend": [ /* chart data */ ],
    "knowledge_radar": [ /* chart data */ ]
  }
}
```

## 🔔 Notification APIs

### Get Notifications / 通知取得

```typescript
GET /api/v1/notifications
Authorization: Bearer {access_token}

Query Parameters:
- unread?: boolean
- type?: 'achievement' | 'reminder' | 'social'
- limit?: number

Response: 200 OK
{
  "notifications": [
    {
      "id": "notif_456",
      "type": "achievement",
      "title": "New Achievement!",
      "message": "You've completed 50% of all processes",
      "icon": "🏆",
      "read": false,
      "created_at": "2024-03-01T10:00:00Z",
      "action": {
        "type": "navigate",
        "url": "/achievements"
      }
    }
  ],
  "unread_count": 3
}
```

### Mark as Read / 既読にする

```typescript
PUT /api/v1/notifications/{id}/read
Authorization: Bearer {access_token}

Response: 200 OK
{
  "marked": true,
  "unread_count": 2
}

Batch operation:
PUT /api/v1/notifications/read-all
```

## 🔍 Search APIs

### Global Search / グローバル検索

```typescript
GET /api/v1/search
Authorization: Bearer {access_token}

Query Parameters:
- q: string (required, min: 2 chars)
- type?: 'all' | 'process' | 'term' | 'note'
- limit?: number (max: 50)

Response: 200 OK
{
  "results": [
    {
      "type": "process",
      "item": {
        "id": "risk_planning",
        "name": "Plan Risk Management",
        "description": "...",
        "match": "risk <mark>planning</mark>"
      },
      "score": 0.95
    },
    {
      "type": "term",
      "item": {
        "id": "term_123",
        "term": "Planning",
        "definition": "...",
        "match": "<mark>planning</mark> involves..."
      },
      "score": 0.87
    }
  ],
  "total": 42,
  "took_ms": 23
}

Search features:
- Fuzzy matching
- Synonym support
- Weighted scoring
- Highlighting
```

## 💳 Payment APIs

### Create Subscription / サブスクリプション作成

```typescript
POST /api/v1/subscription/create
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "plan": "premium_annual",
  "payment_method": "pm_1234567890",
  "coupon": "STUDENT20"
}

Response: 200 OK
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "plan": "premium_annual",
    "current_period_end": "2025-03-01T00:00:00Z",
    "amount": 9900,
    "currency": "usd",
    "discount": {
      "coupon": "STUDENT20",
      "percent_off": 20
    }
  },
  "invoice": {
    "id": "inv_456",
    "pdf_url": "https://...",
    "amount_paid": 7920
  }
}

Integration: Stripe
PCI Compliance: Level 1
```

## 🔄 WebSocket APIs

### Real-time Connection

```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://ws.pmp-learning.com')

// Authentication
ws.send(
  JSON.stringify({
    type: 'auth',
    token: 'access_token',
  })
)

// Subscribe to events
ws.send(
  JSON.stringify({
    type: 'subscribe',
    channels: ['progress', 'notifications', 'group_123'],
  })
)

// Receive messages
ws.on('message', (data) => {
  const message = JSON.parse(data)
  switch (message.type) {
    case 'progress_update':
      // Handle progress update
      break
    case 'notification':
      // Handle notification
      break
    case 'group_message':
      // Handle group message
      break
  }
})

// Heartbeat
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }))
}, 30000)
```

### WebSocket Events

```yaml
Events:
  progress_update:
    - User progress changed
    - Achievement unlocked

  notification:
    - New notification
    - Reminder

  group_message:
    - New message in group
    - Member joined/left

  study_session:
    - Partner started studying
    - Session invitation

  system:
    - Maintenance notice
    - Feature update
```

## 🛠️ API Testing

### Test with cURL

```bash
# Get access token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  | jq -r '.access_token')

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/user/profile | jq

# Test with HTTPie
http POST localhost:3000/auth/login \
  email=test@test.com password=password

# Test with Postman
# Import collection: .claude/quick-ref/postman/api-collection.json
```

### API Testing Script

```bash
# Run API tests
npm run api:test

# Test specific endpoint
npm run api:test -- --endpoint=/user/profile

# Load testing
npm run api:load

# Generate API documentation
npm run api:docs
```

## 📊 API Metrics

### Rate Limits

```yaml
Free Tier:
  - 100 requests/hour
  - 1000 requests/day
  - 10 concurrent connections

Premium Tier:
  - 1000 requests/hour
  - 10000 requests/day
  - 50 concurrent connections

Enterprise:
  - Unlimited requests
  - Custom limits
  - Dedicated support
```

### Response Times (p95)

```yaml
Authentication: < 200ms
User APIs: < 100ms
Learning APIs: < 150ms
Exam APIs: < 200ms
Search APIs: < 50ms
AI APIs: < 2000ms
```

## 🔒 API Security

### Authentication Headers

```http
Authorization: Bearer {access_token}
X-API-Key: {api_key} # For service-to-service
X-Request-ID: {uuid} # For tracing
X-Client-Version: 1.2.3 # Client version
```

### Error Responses

```typescript
// 400 Bad Request
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": [
    {
      "field": "email",
      "error": "Invalid email format"
    }
  ]
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}

// 403 Forbidden
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}

// 429 Too Many Requests
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 3600
}

// 500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "An error occurred",
  "request_id": "req_123456"
}
```

---

## 📚 API SDKs

### JavaScript/TypeScript

```typescript
import { PMPLearningAPI } from '@pmp-learning/sdk'

const api = new PMPLearningAPI({
  apiKey: 'your_api_key',
  environment: 'production',
})

// Async/await
const profile = await api.user.getProfile()

// Promises
api.progress
  .update({ processId: 'risk_planning', status: 'completed' })
  .then((response) => console.log(response))
  .catch((error) => console.error(error))
```

### Python

```python
from pmp_learning import Client

client = Client(api_key='your_api_key')

# Get user profile
profile = client.user.get_profile()

# Update progress
client.progress.update(
    process_id='risk_planning',
    status='completed'
)
```

---

_API documentation is auto-generated from OpenAPI spec. Last update: Check with `npm run quickref:status`_
