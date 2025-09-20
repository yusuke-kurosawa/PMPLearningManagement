# PMBOK Knowledge Area CRUD API

## Overview

This is a comprehensive RESTful API for managing PMBOK 6th and 7th edition knowledge areas, process groups, individual processes, and the complete ITTO (Inputs, Tools & Techniques, Outputs) framework.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                         │
│                    (Authentication & Routing)               │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Knowledge   │  │   Process    │  │    ITTO      │     │
│  │ Area Service │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Analytics   │  │   Learning   │  │    Cache     │     │
│  │   Service    │  │Path Service  │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Knowledge   │  │   Process    │  │    ITTO      │     │
│  │     Area     │  │  Repository  │  │  Repository  │     │
│  │  Repository  │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Knowledge   │  │  Processes   │  │ ITTO Items   │     │
│  │    Areas     │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Process    │  │   Learning   │  │     User     │     │
│  │    Groups    │  │    Paths     │  │   Progress   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Complete PMBOK Data Model

- **10 Knowledge Areas**: Integration, Scope, Schedule, Cost, Quality, Resource, Communications, Risk, Procurement, Stakeholder
- **5 Process Groups**: Initiating, Planning, Executing, Monitoring & Controlling, Closing
- **49 Individual Processes**: Fully mapped with relationships and dependencies
- **ITTO Framework**: Complete inputs, tools & techniques, and outputs for each process

### 2. Advanced Capabilities

- **Full-text Search**: PostgreSQL text search across all PMBOK content
- **Relationship Mapping**: Process dependencies, prerequisites, and related processes
- **Learning Paths**: Curated sequences of processes for different learning objectives
- **Progress Tracking**: User-specific mastery levels and completion tracking
- **Analytics**: Comprehensive metrics and insights
- **Bulk Operations**: Efficient batch processing for large datasets
- **Caching Strategy**: Multi-level caching with Redis for optimal performance

### 3. API Endpoints

#### Knowledge Areas

```http
GET    /api/v2/knowledge-areas
POST   /api/v2/knowledge-areas
GET    /api/v2/knowledge-areas/{id}
PUT    /api/v2/knowledge-areas/{id}
DELETE /api/v2/knowledge-areas/{id}
GET    /api/v2/knowledge-areas/{id}/processes
```

#### Process Groups

```http
GET    /api/v2/process-groups
GET    /api/v2/process-groups/{id}
GET    /api/v2/process-groups/{id}/processes
```

#### Processes

```http
GET    /api/v2/processes
POST   /api/v2/processes
GET    /api/v2/processes/{id}
PUT    /api/v2/processes/{id}
DELETE /api/v2/processes/{id}
GET    /api/v2/processes/{id}/itto
PUT    /api/v2/processes/{id}/itto
GET    /api/v2/processes/{id}/relationships
```

#### ITTO

```http
GET    /api/v2/itto/items
POST   /api/v2/itto/items
GET    /api/v2/itto/items/{id}
PUT    /api/v2/itto/items/{id}
```

#### Analytics

```http
GET    /api/v2/analytics/knowledge-areas
GET    /api/v2/analytics/process-mastery
GET    /api/v2/analytics/learning-progress
GET    /api/v2/analytics/recommendations
```

#### Search

```http
GET    /api/v2/search?q={query}&scope={scope}
```

#### Bulk Operations

```http
POST   /api/v2/bulk/processes
POST   /api/v2/bulk/itto
```

## Database Schema

### Core Tables

1. **knowledge_areas**: Knowledge area definitions
2. **process_groups**: Process group definitions
3. **processes**: Individual process details
4. **itto_items**: Normalized ITTO items
5. **process_itto**: Mapping between processes and ITTO items
6. **process_relationships**: Process dependencies and relationships
7. **user_progress**: User-specific progress tracking
8. **learning_paths**: Curated learning sequences
9. **learning_path_steps**: Steps within learning paths

### Performance Optimizations

- **Indexes**: Strategic indexes on foreign keys, search fields, and commonly queried columns
- **Materialized Views**: Pre-computed aggregations for analytics
- **Full-text Search**: GIN indexes with custom search configuration
- **Partitioning**: Time-based partitioning for analytics_events table

## Integration with Existing System

### 1. Service Integration

```typescript
// Example: Integrating with existing progress service
import { PMBOKAPIClient } from '@/api/pmbok/client';
import { progressServiceV2 } from '@/services/progressServiceV2';

class EnhancedProgressService {
  private pmbokAPI: PMBOKAPIClient;
  
  async updateProcessMastery(userId: string, processId: string, score: number) {
    // Update in PMBOK API
    await this.pmbokAPI.updateUserProgress({
      userId,
      processId,
      score,
      completionPercentage: score >= 80 ? 100 : score
    });
    
    // Sync with existing progress service
    await progressServiceV2.updateProgress(userId, {
      processId,
      score,
      timestamp: new Date()
    });
  }
}
```

### 2. Component Integration

```tsx
// Example: Using API in React components
import { usePMBOKQuery } from '@/hooks/usePMBOKQuery';

export function KnowledgeAreaDashboard() {
  const { data: knowledgeAreas, isLoading } = usePMBOKQuery({
    endpoint: '/knowledge-areas',
    params: {
      version: '6',
      includeProcesses: true,
      includeMetrics: true
    }
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {knowledgeAreas?.data.map(area => (
        <KnowledgeAreaCard 
          key={area.id}
          area={area}
          processes={area.processes}
          metrics={area.metrics}
        />
      ))}
    </div>
  );
}
```

### 3. Data Migration

```bash
# Run migrations to seed PMBOK data
npm run migrate:up

# Verify data integrity
npm run db:verify

# Export existing data for backup
npm run db:export
```

## API Client Usage

### TypeScript Client

```typescript
import { PMBOKAPIClient, PMBOKTypes } from '@/api/pmbok/client';

const client = new PMBOKAPIClient({
  baseURL: process.env.VITE_API_URL,
  apiKey: process.env.VITE_API_KEY
});

// Get all knowledge areas
const areas = await client.knowledgeAreas.list({
  version: PMBOKTypes.PMBOKVersion.V6,
  includeProcesses: true
});

// Search processes
const results = await client.search({
  query: 'risk analysis',
  scope: ['processes', 'itto'],
  limit: 10
});

// Get user progress
const progress = await client.analytics.getUserProgress(userId);

// Bulk update processes
const result = await client.bulk.upsertProcesses([
  { action: 'update', data: processData1 },
  { action: 'update', data: processData2 }
]);
```

### REST API Example

```bash
# Get knowledge areas with processes
curl -X GET "https://api.pmplearning.com/v2/knowledge-areas?version=6&includeProcesses=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for risk-related content
curl -X GET "https://api.pmplearning.com/v2/search?q=risk%20management&scope=all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update process ITTO
curl -X PUT "https://api.pmplearning.com/v2/processes/PROCESS_ID/itto" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [...],
    "tools": [...],
    "outputs": [...]
  }'
```

## Performance Considerations

### Caching Strategy

1. **Knowledge Areas**: 1-hour TTL
2. **Process Details**: 30-minute TTL
3. **User Progress**: 5-minute TTL
4. **Search Results**: 15-minute TTL

### Query Optimization

- Use materialized views for aggregations
- Implement cursor-based pagination for large datasets
- Leverage PostgreSQL's parallel query execution
- Use connection pooling with optimal pool size

### Scaling Considerations

1. **Horizontal Scaling**: Stateless API servers behind load balancer
2. **Database Scaling**: Read replicas for analytics queries
3. **Cache Layer**: Redis cluster for distributed caching
4. **CDN**: Static PMBOK content served via CDN
5. **Rate Limiting**: Per-user and per-IP rate limits

## Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- API key for service-to-service communication
- OAuth 2.0 support for third-party integrations

### Data Protection

- Field-level encryption for sensitive data
- Audit logging for all data modifications
- GDPR-compliant data handling
- Regular security audits

## Monitoring & Observability

### Metrics

- API response times
- Error rates by endpoint
- Database query performance
- Cache hit rates
- User engagement metrics

### Logging

- Structured logging with correlation IDs
- Error tracking with Sentry
- Performance monitoring with New Relic
- Custom dashboards in Grafana

## Development Setup

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Run migrations
npm run migrate:up

# Seed PMBOK data
npm run db:seed

# Start development server
npm run dev:api

# Run tests
npm run test:api
```

## Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e:api
```

### Load Testing

```bash
npm run test:load
```

## Documentation

- **OpenAPI Specification**: `/src/api/pmbok/openapi.yaml`
- **Database Schema**: `/src/api/pmbok/schema.sql`
- **TypeScript Types**: `/src/api/pmbok/types.ts`
- **Migration Scripts**: `/src/api/pmbok/migrations/`

## Support

For questions or issues, please contact the development team or create an issue in the repository.