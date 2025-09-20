# PMP Learning Management API Documentation

## 🚀 Overview

Welcome to the **PMP Learning Management API** - a comprehensive, AI-enhanced API for building Project Management Professional (PMP) exam preparation and learning management applications. This API provides complete coverage of PMBOK 6th & 7th Edition content, advanced learning analytics, AI-powered coaching, and collaborative study features.

### Key Features

- **📚 Complete PMBOK Coverage**: All 49 processes, 12 principles, 8 performance domains, and ITTO framework
- **🤖 AI-Powered Learning**: Personalized study recommendations and interactive coaching
- **📈 Advanced Analytics**: Comprehensive learning progress tracking and performance metrics
- **🎯 Assessment Engine**: Full-featured mock PMP exams with detailed scoring
- **👥 Collaboration Tools**: Study groups, discussions, and shared learning resources
- **🔄 Real-time Sync**: Live progress updates and collaborative features
- **🌐 PWA-Ready**: Full offline functionality and mobile optimization
- **🔒 Enterprise Security**: JWT authentication, role-based access, and data encryption

## 📋 Quick Start

### 1. Interactive Documentation

**🌐 [Live API Explorer](./index.html)** - Try the API directly in your browser

### 2. Interactive Tutorial

**🎓 [Step-by-Step Tutorial](./examples/interactive-tutorial.html)** - Learn the API through hands-on examples

### 3. Comprehensive Guide

**📖 [Complete Workflow Guide](./guides/pmp-learning-workflows.md)** - Detailed implementation patterns

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ or Python 3.8+ or Java 11+ or .NET 6+
- Basic understanding of REST APIs and JSON
- PMP exam preparation context (optional but helpful)

### Quick Setup

```bash
# Using npm (TypeScript/JavaScript)
npm install @pmp-learning/api-client

# Using pip (Python)
pip install pmp-learning-api

# Using Maven (Java)
<dependency>
    <groupId>com.pmplearning</groupId>
    <artifactId>pmp-learning-api-client</artifactId>
    <version>2.1.0</version>
</dependency>

# Using NuGet (.NET)
dotnet add package PMPLearning.ApiClient
```

### Basic Usage

```typescript
// TypeScript/JavaScript
import { PMPLearningClient } from '@pmp-learning/api-client';

const client = new PMPLearningClient({
  baseURL: 'https://api.pmplearning.com/v2',
  apiKey: 'your-api-key'
});

// Authenticate
const user = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get learning progress
const progress = await client.learning.getProgress({
  includeRecommendations: true
});

console.log(`Overall progress: ${progress.overallProgress}%`);
```

```python
# Python
from pmp_learning_api import PMPLearningClient

client = PMPLearningClient(
    base_url='https://api.pmplearning.com/v2',
    api_key='your-api-key'
)

# Authenticate
user = client.auth.login(
    email='user@example.com',
    password='password'
)

# Get learning progress
progress = client.learning.get_progress(
    include_recommendations=True
)

print(f"Overall progress: {progress.overall_progress}%")
```

## 🎯 Core Use Cases

### 1. Learning Progress Tracking

```typescript
// Record a study session
await client.learning.recordSession({
  processId: 'develop-project-charter',
  processName: 'Develop Project Charter',
  knowledgeArea: 'Integration',
  processGroup: 'Initiating',
  duration: 1800, // 30 minutes
  confidence: 4,
  notes: 'Focused on business case analysis'
});
```

### 2. PMBOK Content Access

```typescript
// Get all knowledge areas
const knowledgeAreas = await client.pmbok.getKnowledgeAreas({
  version: '6',
  includeProcesses: true
});

// Get specific process with ITTO details
const process = await client.pmbok.getProcess('develop-project-charter', {
  includeITTO: true,
  includeRelated: true
});
```

### 3. Mock PMP Exams

```typescript
// Start a full mock exam
const exam = await client.exams.startMockExam({
  examType: 'full',
  questionCount: 180,
  timeLimit: 13800, // 230 minutes
  difficulty: 'mixed'
});

// Submit answers and get results
const results = await client.exams.complete(exam.id);
console.log(`Score: ${results.score}/${results.totalQuestions}`);
```

### 4. AI-Powered Coaching

```typescript
// Get AI recommendations
const recommendations = await client.ai.getRecommendations({
  maxRecommendations: 5,
  includeReasons: true
});

// Chat with AI coach
const response = await client.ai.chat({
  message: "What's the difference between Estimate Costs and Determine Budget?",
  context: { knowledgeArea: 'cost' }
});
```

## 📊 API Structure

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration  
- `POST /auth/refresh` - Token refresh

### PMBOK Content Endpoints
- `GET /pmbok/knowledge-areas` - All knowledge areas
- `GET /pmbok/processes` - All processes (with filtering)
- `GET /pmbok/processes/{id}` - Specific process with ITTO

### Learning Progress Endpoints
- `GET /learning/progress` - Comprehensive progress data
- `POST /learning/sessions` - Record study session
- `GET /learning/streak` - Learning streak information

### Assessment Endpoints  
- `POST /exams/mock` - Start mock exam
- `GET /exams/mock/{id}` - Get exam session
- `POST /exams/mock/{id}/complete` - Complete exam

### AI Services Endpoints
- `GET /ai/coaching/recommendations` - Personalized recommendations
- `POST /ai/coaching/chat` - Interactive AI coach

### Collaboration Endpoints
- `GET /collaboration/study-groups` - Available study groups
- `POST /collaboration/study-groups` - Create study group
- `GET /collaboration/discussions/{groupId}` - Group discussions

## 🔐 Authentication

The API uses JWT-based authentication with refresh tokens:

```typescript
// Login flow
const authResponse = await client.auth.login({
  email: 'user@example.com',
  password: 'securepassword123'
});

// Tokens are automatically managed by the SDK
```

### Security Features

- **JWT Tokens**: Secure access and refresh token system
- **Rate Limiting**: Prevents abuse with configurable limits
- **Role-Based Access**: FREE, PREMIUM, INSTRUCTOR, ADMIN roles
- **Data Encryption**: All sensitive data encrypted at rest
- **Request Validation**: Comprehensive input validation

## 📚 SDKs and Libraries

### Official SDKs

| Language | Package | Documentation |
|----------|---------|---------------|
| **TypeScript** | `@pmp-learning/api-client` | [TypeScript Guide](./sdks/typescript/README.md) |
| **Python** | `pmp-learning-api` | [Python Guide](./sdks/python/README.md) |
| **Java** | `com.pmplearning:pmp-learning-api-client` | [Java Guide](./sdks/java/README.md) |
| **C#** | `PMPLearning.ApiClient` | [C# Guide](./sdks/csharp/README.md) |

## 🔧 Development Tools

### SDK Generation

```bash
# Generate all SDKs
npm run api-docs:generate

# Generate specific language
npm run api-docs:generate:typescript
npm run api-docs:generate:python
npm run api-docs:generate:java
npm run api-docs:generate:csharp
```

### Documentation Validation

```bash
# Validate API documentation
npm run api-docs:validate

# Full validation including examples and links
npm run api-docs:validate:full

# Validate only OpenAPI specification
npm run api-docs:validate:spec
```

### Local Development

```bash
# Start local documentation server
npm run api-docs:serve

# Build and validate documentation
npm run api-docs:build

# Run complete documentation test suite
npm run api-docs:test
```

## 📈 Performance and Scale

### Rate Limits

| Plan | Requests/Hour | AI Requests/Day |
|------|---------------|-----------------|
| **Free** | 1,000 | 50 |
| **Premium** | 10,000 | 500 |
| **Enterprise** | 100,000 | 5,000 |

### Response Times

- **Authentication**: < 100ms
- **PMBOK Data**: < 200ms
- **Learning Progress**: < 300ms
- **Mock Exams**: < 500ms
- **AI Services**: < 2000ms

## 🎉 Get Started Today!

1. **🚀 [Try the Interactive Tutorial](./examples/interactive-tutorial.html)**
2. **📖 [Explore the API](./index.html)**
3. **💻 [Download an SDK](./sdks/)**
4. **🏗️ [Build Your First App](./guides/pmp-learning-workflows.md)**

---

*Last updated: January 2024*
*API Version: 2.1.0*
*Documentation Version: 1.0.0*