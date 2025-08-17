# Performance Optimization Prompts - Comprehensive Analysis Guide

## ⚡ Quick Performance Assessment

```
Analyze the performance of PMPLearningManagement and provide optimization recommendations:

**Current Metrics:**
- Page Load Time: {seconds}
- Time to Interactive (TTI): {seconds}
- First Contentful Paint (FCP): {seconds}
- Largest Contentful Paint (LCP): {seconds}
- Cumulative Layout Shift (CLS): {score}
- First Input Delay (FID): {milliseconds}

**Target Metrics:**
- LCP < 2.5s (Good)
- FID < 100ms (Good)
- CLS < 0.1 (Good)
- Bundle size < 500KB gzipped

**Required Analysis:**
1. Performance bottleneck identification
2. Quick wins (< 1 hour implementation)
3. Medium-term improvements (1-7 days)
4. Long-term optimizations (> 1 week)
5. ROI calculation for each optimization

**Success Criteria:**
- 40% improvement in key metrics
- Lighthouse score > 90
- No functionality regression
```

## 🚀 React Performance Optimization

```
Optimize React application performance:

**Component Analysis:**
```javascript
// Paste component code here
const ProblematicComponent = () => {
  // Component implementation
};
```

**Performance Issues:**
- [ ] Unnecessary re-renders
- [ ] Large component trees
- [ ] Expensive computations
- [ ] Memory leaks
- [ ] Bundle size

**Optimization Techniques:**
1. React.memo implementation
2. useMemo/useCallback usage
3. Code splitting strategy
4. Lazy loading components
5. Virtual scrolling for lists
6. State management optimization

**Profiler Results:**
```json
{
  "render_count": 0,
  "render_duration_ms": 0,
  "commit_duration_ms": 0,
  "interactions": []
}
```

**Provide:**
- Optimized component code
- Performance comparison (before/after)
- Bundle size impact
- Memory usage analysis
- Re-render visualization
```

## 📦 Bundle Size Optimization

```
Analyze and optimize JavaScript bundle size:

**Current Bundle Analysis:**
```bash
# Bundle composition
Main bundle: {size}KB
Vendor bundle: {size}KB
Lazy chunks: {count} files, {total size}KB
CSS: {size}KB
Total: {size}KB gzipped
```

**Largest Dependencies:**
1. {library}: {size}KB
2. {library}: {size}KB
3. {library}: {size}KB

**Optimization Strategy:**
```javascript
// webpack.config.js optimizations
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}
```

**Action Items:**
1. Tree shaking configuration
2. Dynamic imports implementation
3. Library replacement (smaller alternatives)
4. Dead code elimination
5. Asset optimization (images, fonts)

**Expected Results:**
- Bundle size reduction: {percentage}%
- Load time improvement: {seconds}
- Network transfer reduction: {KB}
```

## 🗄️ Database Query Optimization

```
Optimize database queries for PMPLearningManagement:

**Slow Query Analysis:**
```sql
-- Current slow query
SELECT * FROM users u
JOIN progress p ON u.id = p.user_id
JOIN certificates c ON u.id = c.user_id
WHERE u.created_at > '2024-01-01'
ORDER BY u.created_at DESC;

-- Execution time: {ms}
-- Rows examined: {count}
-- Rows returned: {count}
```

**Query Plan:**
```
EXPLAIN ANALYZE output:
{paste explain output}
```

**Optimization Techniques:**
1. Index strategy
```sql
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_progress_user_id ON progress(user_id);
```

2. Query rewriting
```sql
-- Optimized query
WITH recent_users AS (
  SELECT id FROM users 
  WHERE created_at > '2024-01-01'
  ORDER BY created_at DESC
  LIMIT 100
)
SELECT * FROM recent_users ru
JOIN users u ON ru.id = u.id
LEFT JOIN progress p ON u.id = p.user_id
LEFT JOIN certificates c ON u.id = c.user_id;
```

3. Caching strategy
4. Read replica usage
5. Query result pagination

**Performance Gains:**
- Query time: {before}ms → {after}ms
- CPU usage reduction: {percentage}%
- I/O operations: {reduction}%
```

## 🔍 API Performance Optimization

```
Optimize API endpoint performance:

**Endpoint Analysis:**
- Endpoint: {GET/POST/PUT/DELETE} /api/{path}
- Current latency: p50={ms}, p95={ms}, p99={ms}
- Throughput: {requests/second}
- Error rate: {percentage}%

**Performance Breakdown:**
```javascript
{
  "database_time": "150ms",
  "serialization": "50ms",
  "business_logic": "100ms",
  "network_overhead": "20ms",
  "total": "320ms"
}
```

**Optimization Strategies:**

1. **Caching Implementation**
```javascript
// Redis caching layer
const cacheKey = `api:${endpoint}:${params}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await expensive_operation();
await redis.setex(cacheKey, 3600, JSON.stringify(result));
return result;
```

2. **Database Query Optimization**
- Use SELECT specific columns
- Implement eager loading
- Add appropriate indexes
- Use connection pooling

3. **Response Optimization**
- Implement pagination
- Use field filtering
- Enable compression
- Implement HTTP/2

4. **Async Processing**
```javascript
// Queue long-running tasks
await queue.add('process-heavy-task', { data });
return { status: 'processing', jobId };
```

**Expected Improvements:**
- Latency reduction: {percentage}%
- Throughput increase: {x}x
- Resource usage: -{percentage}%
```

## 💾 Memory Optimization

```
Optimize memory usage in Node.js application:

**Current Memory Profile:**
- Heap Used: {MB}MB
- Heap Total: {MB}MB
- RSS: {MB}MB
- External: {MB}MB
- Array Buffers: {MB}MB

**Memory Leak Detection:**
```javascript
// Heap snapshot analysis
const v8 = require('v8');
const heapSnapshot = v8.writeHeapSnapshot();

// Memory growth over time
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Heap: ${usage.heapUsed / 1024 / 1024}MB`);
}, 60000);
```

**Optimization Techniques:**

1. **Object Pooling**
```javascript
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  acquire() {
    return this.pool.pop() || this.createFn();
  }
  
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}
```

2. **Stream Processing**
```javascript
// Instead of loading all data
const allData = await db.query('SELECT * FROM large_table');

// Use streaming
const stream = db.queryStream('SELECT * FROM large_table');
stream.on('data', processRow);
```

3. **WeakMap/WeakSet Usage**
4. **Garbage Collection Optimization**
5. **Buffer Management**

**Memory Targets:**
- Heap usage < 512MB
- No memory leaks over 24h
- GC pause time < 10ms
```

## ⚙️ Infrastructure Performance

```
Optimize infrastructure and deployment performance:

**Current Infrastructure:**
- Hosting: {AWS/GCP/Azure}
- Instances: {type and count}
- Load Balancer: {type}
- CDN: {CloudFront/Cloudflare}
- Database: {RDS/Aurora/DynamoDB}

**Performance Metrics:**
- Server response time: {ms}
- CDN cache hit ratio: {percentage}%
- Database connection pool: {utilization}%
- Auto-scaling triggers: {CPU/memory thresholds}

**Optimization Plan:**

1. **CDN Optimization**
```nginx
# Cache control headers
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_comp_level 6;
```

2. **Load Balancer Configuration**
```yaml
# ALB configuration
target_group:
  health_check:
    interval: 10
    timeout: 5
    healthy_threshold: 2
    unhealthy_threshold: 3
  stickiness:
    enabled: true
    duration: 86400
```

3. **Auto-scaling Policy**
```json
{
  "target_value": 70.0,
  "metric_type": "CPU",
  "scale_in_cooldown": 300,
  "scale_out_cooldown": 60
}
```

4. **Database Optimization**
- Read replicas for read-heavy workloads
- Connection pooling optimization
- Query cache configuration
- Proper indexing strategy

**Cost-Performance Analysis:**
- Current monthly cost: ${amount}
- Optimized cost: ${amount}
- Performance gain: {percentage}%
- ROI: {months} to break even
```

## 🎨 Frontend Rendering Optimization

```
Optimize frontend rendering performance:

**Rendering Metrics:**
- First Paint: {ms}
- First Contentful Paint: {ms}
- Speed Index: {score}
- Time to Interactive: {ms}
- Total Blocking Time: {ms}

**Critical Rendering Path:**
```html
<!-- Optimize critical CSS -->
<style>
  /* Inline critical CSS */
  .above-the-fold { /* styles */ }
</style>
<link rel="preload" href="main.css" as="style">
<link rel="stylesheet" href="main.css" media="print" onload="this.media='all'">

<!-- Optimize JavaScript loading -->
<script src="critical.js"></script>
<script src="main.js" defer></script>
<script src="analytics.js" async></script>
```

**Optimization Techniques:**

1. **Image Optimization**
```jsx
// Lazy loading images
<img 
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Description"
/>

// Responsive images
<picture>
  <source media="(max-width: 768px)" srcset="image-mobile.webp">
  <source media="(min-width: 769px)" srcset="image-desktop.webp">
  <img src="image-fallback.jpg" alt="Description">
</picture>
```

2. **Virtual DOM Optimization**
```javascript
// React optimization
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});

// Use production builds
process.env.NODE_ENV === 'production'
```

3. **CSS Optimization**
- Remove unused CSS
- Minimize CSS
- Use CSS containment
- Optimize animations with transform/opacity

**Performance Budget:**
- JS: < 170KB (gzipped)
- CSS: < 30KB (gzipped)
- Images: < 500KB total
- Web fonts: < 100KB
- Time to Interactive: < 3.5s
```

## 🔧 Build Process Optimization

```
Optimize build and deployment pipeline:

**Current Build Metrics:**
- Build time: {minutes}
- Test execution: {minutes}
- Docker image size: {MB}
- Deployment time: {minutes}
- Total pipeline: {minutes}

**Build Optimization:**

1. **Parallel Execution**
```yaml
# GitHub Actions parallel jobs
jobs:
  test:
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    steps:
      - run: npm run test:${{ matrix.test-suite }}
```

2. **Caching Strategy**
```yaml
# Dependency caching
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

3. **Docker Optimization**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

4. **Incremental Builds**
```javascript
// Webpack incremental builds
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

**Expected Improvements:**
- Build time: -{percentage}%
- Image size: -{percentage}%
- Deployment frequency: +{x}x
- Developer productivity: +{percentage}%
```

## 📊 Real User Monitoring (RUM) Optimization

```
Implement and optimize Real User Monitoring:

**RUM Implementation:**
```javascript
// Performance monitoring
const perfData = {
  navigation: performance.getEntriesByType('navigation')[0],
  resources: performance.getEntriesByType('resource'),
  paint: performance.getEntriesByType('paint'),
  measure: performance.getEntriesByType('measure')
};

// Send to analytics
navigator.sendBeacon('/api/rum', JSON.stringify(perfData));
```

**Key Metrics to Track:**
1. Core Web Vitals (LCP, FID, CLS)
2. JavaScript errors
3. Resource timing
4. User interactions
5. Custom business metrics

**Performance Budgets:**
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 5000 }],
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error'
      }
    }
  }
};
```

**Alerting Thresholds:**
- Page load > 3s: Warning
- Error rate > 1%: Alert
- Apdex score < 0.85: Critical
```

## 🎯 Application-Specific Optimizations

```
Optimize PMPLearningManagement specific features:

**Feature Performance Analysis:**

1. **PMBOK Matrix View**
```javascript
// Current: Full re-render on filter
// Optimized: Virtualized grid
import { VariableSizeGrid } from 'react-window';

const OptimizedMatrix = () => {
  return (
    <VariableSizeGrid
      columnCount={5}
      rowCount={10}
      height={600}
      width={1200}
      itemData={processData}
    >
      {ProcessCell}
    </VariableSizeGrid>
  );
};
```

2. **Network Graph Visualization**
```javascript
// D3.js optimization
const simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-30))
  .force('link', d3.forceLink(links).distance(50))
  .alphaTarget(0) // Stop animation when stable
  .on('end', () => {
    // Cache final positions
    savePositions(nodes);
  });
```

3. **Learning Progress Tracking**
```javascript
// Batch updates
const batchUpdate = debounce(async (updates) => {
  await api.batchUpdateProgress(updates);
}, 1000);

// IndexedDB for offline
const db = await openDB('progress', 1);
await db.put('progress', data);
```

**Expected Improvements:**
- Matrix view render: -70% time
- Graph interaction: 60fps achieved
- Progress sync: -80% API calls
```

## 🔬 Performance Testing Automation

```
Automate performance testing and regression detection:

**Performance Test Suite:**
```javascript
// Playwright performance tests
test('home page performance', async ({ page }) => {
  const metrics = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: new PerformanceObserver((list) => {
      const entries = list.getEntries();
      return entries[entries.length - 1]?.startTime;
    }),
    tti: performance.timing.domInteractive - performance.timing.navigationStart
  }));
  
  expect(metrics.fcp).toBeLessThan(1500);
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.tti).toBeLessThan(3500);
});
```

**Load Testing:**
```javascript
// K6 load test script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
  const res = http.get('https://pmplearning.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**Continuous Monitoring:**
- Automated Lighthouse CI on every PR
- Performance budget enforcement
- Regression alerts
- Trend analysis dashboards
```

## 🔄 Continuous Performance Optimization

```
Establish continuous performance optimization process:

**Performance Review Checklist:**
□ Weekly performance metrics review
□ Monthly optimization sprint
□ Quarterly architecture review
□ Annual technology assessment

**Metrics Dashboard:**
```sql
-- Key performance indicators
SELECT 
  DATE(timestamp) as date,
  AVG(response_time) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99,
  COUNT(*) as request_count,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / COUNT(*) as error_rate
FROM requests
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

**Optimization Backlog:**
1. High Impact, Low Effort (Do First)
2. High Impact, High Effort (Plan)
3. Low Impact, Low Effort (Quick Wins)
4. Low Impact, High Effort (Avoid)

**Success Metrics:**
- Page Speed Score: > 90
- User satisfaction: > 4.5/5
- Bounce rate: < 20%
- Conversion rate: > 5%
- Infrastructure cost: -30%
```

---

**Usage Notes:**
- Always measure before and after optimization
- Focus on user-perceived performance
- Consider trade-offs (performance vs. functionality)
- Document optimization decisions
- Monitor for regression
- Automate performance testing

**Integration Points:**
- Monitoring setup: `monitoring-observability.md`
- CI/CD optimization: `ci-cd-optimization.md`
- Infrastructure optimization: `infrastructure-as-code.md`
- Cost analysis: `cost-optimization.md`

**Success Metrics:**
- Core Web Vitals: All "Good"
- Lighthouse Score: > 90
- API Response Time: < 200ms p95
- Build Time: < 5 minutes
- Deploy Time: < 2 minutes