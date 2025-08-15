# Monitoring & Observability

## Overview

This directory contains comprehensive monitoring, logging, alerting, and observability configurations for the PMPLearningManagement platform. Our monitoring strategy follows the principles of the three pillars of observability: Metrics, Logs, and Traces.

## Directory Structure

```
monitoring/
├── alerts/             # Alert rules and configurations
│   ├── critical/       # Critical severity alerts
│   ├── warning/        # Warning severity alerts
│   └── info/           # Informational alerts
├── dashboards/         # Monitoring dashboard configs
│   ├── grafana/        # Grafana dashboard JSON
│   ├── kibana/         # Kibana visualizations
│   └── custom/         # Custom dashboard configs
├── metrics/            # Metric collection definitions
│   ├── application/    # App-specific metrics
│   ├── infrastructure/ # System metrics
│   └── business/       # Business KPIs
├── logs/               # Log aggregation configs
│   ├── parsers/        # Log parsing rules
│   ├── retention/      # Log retention policies
│   └── filters/        # Log filtering rules
└── scripts/            # Monitoring utilities
    ├── check.js        # Health check script
    ├── collect.js      # Metric collection
    └── analyze.js      # Log analysis
```

## Three Pillars of Observability

### 1. Metrics
Numerical data points over time that indicate system performance.

```javascript
// metrics/application/web-vitals.js
export const webVitalsMetrics = {
  LCP: {  // Largest Contentful Paint
    name: 'web_vitals_lcp',
    type: 'histogram',
    buckets: [1000, 2500, 4000, 6000],
    target: 2500,  // milliseconds
    critical: 4000
  },
  FID: {  // First Input Delay
    name: 'web_vitals_fid',
    type: 'histogram',
    buckets: [50, 100, 200, 300],
    target: 100,   // milliseconds
    critical: 300
  },
  CLS: {  // Cumulative Layout Shift
    name: 'web_vitals_cls',
    type: 'gauge',
    target: 0.1,
    critical: 0.25
  },
  TTFB: { // Time to First Byte
    name: 'web_vitals_ttfb',
    type: 'histogram',
    buckets: [200, 400, 600, 800, 1000],
    target: 600,   // milliseconds
    critical: 1000
  }
}
```

### 2. Logs
Timestamped records of discrete events.

```json
// logs/parsers/application.json
{
  "parsers": [
    {
      "name": "application_logs",
      "pattern": "^(?<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z) \\[(?<level>\\w+)\\] \\[(?<service>[\\w-]+)\\] (?<message>.*)",
      "fields": {
        "timestamp": { "type": "timestamp", "format": "ISO8601" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" }
      }
    }
  ]
}
```

### 3. Traces
Records of the path of a request through the system.

```javascript
// traces/configuration.js
export const tracingConfig = {
  serviceName: 'pmp-learning-management',
  collector: {
    endpoint: 'http://jaeger-collector:14268/api/traces',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  sampler: {
    type: 'probabilistic',
    param: 0.1  // Sample 10% of traces
  },
  propagation: ['b3', 'w3c'],
  tags: {
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  }
}
```

## Alert Configurations

### Critical Alerts
```yaml
# alerts/critical/system.yml
alerts:
  - name: HighErrorRate
    expr: |
      rate(http_requests_total{status=~"5.."}[5m]) 
      / rate(http_requests_total[5m]) > 0.05
    for: 5m
    severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | percent }} for {{ $labels.service }}"
    actions:
      - pagerduty
      - slack
      - email

  - name: ServiceDown
    expr: up == 0
    for: 1m
    severity: critical
    annotations:
      summary: "Service {{ $labels.job }} is down"
      description: "{{ $labels.instance }} has been down for more than 1 minute"
    actions:
      - pagerduty
      - phone

  - name: DatabaseConnectionFailure
    expr: mysql_up == 0 or pg_up == 0
    for: 30s
    severity: critical
    annotations:
      summary: "Database connection failure"
      description: "Cannot connect to {{ $labels.database }}"
    actions:
      - pagerduty
      - slack
```

### Warning Alerts
```yaml
# alerts/warning/performance.yml
alerts:
  - name: HighResponseTime
    expr: |
      histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
    for: 10m
    severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"
    actions:
      - slack
      - email

  - name: HighMemoryUsage
    expr: |
      (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) 
      / node_memory_MemTotal_bytes > 0.85
    for: 15m
    severity: warning
    annotations:
      summary: "High memory usage"
      description: "Memory usage is {{ $value | percent }}"
    actions:
      - slack

  - name: DiskSpaceWarning
    expr: |
      (node_filesystem_size_bytes - node_filesystem_avail_bytes) 
      / node_filesystem_size_bytes > 0.80
    for: 30m
    severity: warning
    annotations:
      summary: "Disk space warning"
      description: "Disk usage is {{ $value | percent }} on {{ $labels.mountpoint }}"
```

## Dashboard Configurations

### Application Dashboard
```json
// dashboards/grafana/application.json
{
  "dashboard": {
    "title": "PMP Learning Management - Application",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ status }}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, http_request_duration_seconds_bucket)",
            "legendFormat": "p99"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
            "format": "percent"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total"
          }
        ]
      }
    ]
  }
}
```

### Infrastructure Dashboard
```json
// dashboards/grafana/infrastructure.json
{
  "dashboard": {
    "title": "PMP Learning Management - Infrastructure",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{ instance }}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{ instance }}"
          }
        ]
      },
      {
        "title": "Network I/O",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "legendFormat": "RX {{ device }}"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "legendFormat": "TX {{ device }}"
          }
        ]
      },
      {
        "title": "Disk I/O",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_disk_read_bytes_total[5m])",
            "legendFormat": "Read {{ device }}"
          },
          {
            "expr": "rate(node_disk_written_bytes_total[5m])",
            "legendFormat": "Write {{ device }}"
          }
        ]
      }
    ]
  }
}
```

## Monitoring Scripts

### Enhanced Health Check
```javascript
#!/usr/bin/env node
// monitoring/scripts/check.js

const axios = require('axios');
const { performance } = require('perf_hooks');

class HealthChecker {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  async checkEndpoint(endpoint) {
    const start = performance.now();
    try {
      const response = await axios.get(endpoint.url, {
        timeout: endpoint.timeout || 5000,
        headers: endpoint.headers || {}
      });
      
      const duration = performance.now() - start;
      
      return {
        name: endpoint.name,
        status: 'healthy',
        statusCode: response.status,
        responseTime: duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: endpoint.name,
        status: 'unhealthy',
        error: error.message,
        responseTime: performance.now() - start,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkDatabase() {
    // Database connectivity check
    const { Pool } = require('pg');
    const pool = new Pool(this.config.database);
    
    try {
      const start = performance.now();
      const result = await pool.query('SELECT NOW()');
      const duration = performance.now() - start;
      
      await pool.end();
      
      return {
        name: 'database',
        status: 'healthy',
        responseTime: duration,
        timestamp: result.rows[0].now
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkRedis() {
    const redis = require('redis');
    const client = redis.createClient(this.config.redis);
    
    try {
      await client.connect();
      const start = performance.now();
      await client.ping();
      const duration = performance.now() - start;
      
      await client.quit();
      
      return {
        name: 'redis',
        status: 'healthy',
        responseTime: duration
      };
    } catch (error) {
      return {
        name: 'redis',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkDiskSpace() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync('df -h /');
      const lines = stdout.trim().split('\n');
      const data = lines[1].split(/\s+/);
      const usagePercent = parseInt(data[4]);
      
      return {
        name: 'disk',
        status: usagePercent < 80 ? 'healthy' : 'warning',
        usage: `${usagePercent}%`,
        available: data[3]
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'unknown',
        error: error.message
      };
    }
  }

  async runAllChecks() {
    console.log('🏥 Running Health Checks...\n');
    
    // Application endpoints
    for (const endpoint of this.config.endpoints) {
      const result = await this.checkEndpoint(endpoint);
      this.results.push(result);
      this.printResult(result);
    }
    
    // Database
    const dbResult = await this.checkDatabase();
    this.results.push(dbResult);
    this.printResult(dbResult);
    
    // Redis
    const redisResult = await this.checkRedis();
    this.results.push(redisResult);
    this.printResult(redisResult);
    
    // Disk space
    const diskResult = await this.checkDiskSpace();
    this.results.push(diskResult);
    this.printResult(diskResult);
    
    // Overall status
    this.printOverallStatus();
    
    // Send to monitoring system
    await this.sendToMonitoring();
  }

  printResult(result) {
    const icon = result.status === 'healthy' ? '✅' : 
                  result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${result.name}: ${result.status}`);
    if (result.responseTime) {
      console.log(`   Response time: ${result.responseTime.toFixed(2)}ms`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  printOverallStatus() {
    const unhealthy = this.results.filter(r => r.status === 'unhealthy');
    const warnings = this.results.filter(r => r.status === 'warning');
    
    console.log('📊 Overall Status:');
    if (unhealthy.length === 0 && warnings.length === 0) {
      console.log('   ✅ All systems operational');
    } else {
      if (unhealthy.length > 0) {
        console.log(`   ❌ ${unhealthy.length} unhealthy services`);
      }
      if (warnings.length > 0) {
        console.log(`   ⚠️ ${warnings.length} warnings`);
      }
    }
    
    // Calculate availability
    const healthy = this.results.filter(r => r.status === 'healthy');
    const availability = (healthy.length / this.results.length) * 100;
    console.log(`   📈 Availability: ${availability.toFixed(2)}%`);
  }

  async sendToMonitoring() {
    try {
      await axios.post(this.config.monitoring.endpoint, {
        timestamp: new Date().toISOString(),
        service: 'pmp-learning-management',
        checks: this.results
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.monitoring.apiKey
        }
      });
      console.log('\n✅ Results sent to monitoring system');
    } catch (error) {
      console.error('\n❌ Failed to send to monitoring:', error.message);
    }
  }
}

// Configuration
const config = {
  endpoints: [
    { name: 'API Health', url: 'http://localhost:3000/health' },
    { name: 'Frontend', url: 'http://localhost:5173' },
    { name: 'GraphQL', url: 'http://localhost:3000/graphql', 
      headers: { 'Content-Type': 'application/json' } }
  ],
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pmp_learning',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  monitoring: {
    endpoint: process.env.MONITORING_ENDPOINT || 'http://metrics.internal/health',
    apiKey: process.env.MONITORING_API_KEY
  }
};

// Run health checks
const checker = new HealthChecker(config);
checker.runAllChecks().catch(console.error);
```

### Metric Collection
```javascript
#!/usr/bin/env node
// monitoring/scripts/collect.js

const client = require('prom-client');
const express = require('express');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

const businessMetrics = {
  coursesCompleted: new client.Counter({
    name: 'courses_completed_total',
    help: 'Total number of courses completed',
    labelNames: ['course_id', 'user_type']
  }),
  
  examsPassed: new client.Counter({
    name: 'exams_passed_total',
    help: 'Total number of exams passed',
    labelNames: ['exam_type']
  }),
  
  studyTime: new client.Histogram({
    name: 'study_time_minutes',
    help: 'Study time in minutes',
    labelNames: ['course_id'],
    buckets: [15, 30, 60, 120, 240]
  })
};

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsers);
Object.values(businessMetrics).forEach(metric => {
  register.registerMetric(metric);
});

// Express server for metrics endpoint
const app = express();

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Simulate metric updates
setInterval(() => {
  // Update active users
  activeUsers.set(Math.floor(Math.random() * 1000));
  
  // Simulate HTTP requests
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const routes = ['/api/courses', '/api/users', '/api/exams'];
  const statuses = ['200', '201', '400', '500'];
  
  methods.forEach(method => {
    routes.forEach(route => {
      statuses.forEach(status => {
        if (Math.random() > 0.7) {
          httpRequestDuration
            .labels(method, route, status)
            .observe(Math.random() * 2);
        }
      });
    });
  });
  
  // Simulate business metrics
  if (Math.random() > 0.8) {
    businessMetrics.coursesCompleted
      .labels('pmbok-fundamentals', 'premium')
      .inc();
  }
  
  if (Math.random() > 0.9) {
    businessMetrics.examsPassed
      .labels('practice')
      .inc();
  }
  
  businessMetrics.studyTime
    .labels('pmbok-fundamentals')
    .observe(Math.random() * 240);
}, 5000);

const PORT = process.env.METRICS_PORT || 9090;
app.listen(PORT, () => {
  console.log(`Metrics server listening on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
```

## Log Management

### Log Aggregation Configuration
```yaml
# logs/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/pmp-learning/*.log
    multiline.pattern: '^\d{4}-\d{2}-\d{2}'
    multiline.negate: true
    multiline.match: after
    
  - type: container
    enabled: true
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"

processors:
  - add_host_metadata:
      when.not.contains:
        tags: forwarded
  - add_docker_metadata: ~
  - add_kubernetes_metadata: ~

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "pmp-learning-%{+yyyy.MM.dd}"
  
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0640
```

## Synthetic Monitoring

### User Journey Monitoring
```javascript
// monitoring/synthetic/user-journey.js

const { chromium } = require('playwright');

async function monitorUserJourney() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const metrics = {
    loginTime: 0,
    courseLoadTime: 0,
    examStartTime: 0,
    errors: []
  };
  
  try {
    // 1. Login flow
    const loginStart = Date.now();
    await page.goto('https://pmp-learning.com/login');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password');
    await page.click('#login-button');
    await page.waitForSelector('.dashboard');
    metrics.loginTime = Date.now() - loginStart;
    
    // 2. Course navigation
    const courseStart = Date.now();
    await page.click('.course-link');
    await page.waitForSelector('.course-content');
    metrics.courseLoadTime = Date.now() - courseStart;
    
    // 3. Start exam
    const examStart = Date.now();
    await page.click('.start-exam');
    await page.waitForSelector('.exam-question');
    metrics.examStartTime = Date.now() - examStart;
    
  } catch (error) {
    metrics.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }
  
  // Send metrics to monitoring
  await sendMetrics(metrics);
  
  return metrics;
}

// Run every 5 minutes
setInterval(monitorUserJourney, 5 * 60 * 1000);
```

## Best Practices

### 1. Monitoring Strategy
- **Golden Signals**: Latency, Traffic, Errors, Saturation
- **SLI/SLO/SLA**: Define and track service level objectives
- **Alert Fatigue**: Minimize false positives
- **Actionable Alerts**: Every alert should have a runbook
- **Progressive Monitoring**: Start simple, evolve based on needs

### 2. Dashboard Design
```yaml
Dashboard Principles:
  - Single pane of glass for critical metrics
  - 5-second rule: Key insights within 5 seconds
  - Drill-down capability from high-level to detailed
  - Mobile-responsive design
  - Dark mode support for 24/7 NOC
```

### 3. Log Management
- **Structured Logging**: Use JSON format
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Correlation IDs**: Track requests across services
- **PII Handling**: Mask sensitive data
- **Retention Policy**: Balance cost vs compliance

## Incident Response

### Runbook Template
```markdown
# Runbook: [Alert Name]

## Alert Details
- **Severity**: Critical/Warning/Info
- **Service**: Service name
- **Threshold**: Specific threshold that triggers alert

## Impact
- User-facing impact description
- Business impact assessment

## Diagnosis Steps
1. Check dashboard: [Dashboard Link]
2. Query logs: `query example`
3. Verify dependencies
4. Check recent deployments

## Mitigation Steps
1. Immediate action to restore service
2. Rollback procedure if needed
3. Scale resources if required
4. Failover to backup system

## Escalation
- L1: On-call engineer
- L2: Team lead
- L3: Service owner
- L4: CTO

## Post-Incident
- Create incident report
- Update runbook if needed
- Schedule post-mortem
```

## Performance Benchmarks

### Target Metrics
```yaml
Availability:
  - Target: 99.9% (43.2 minutes downtime/month)
  - Stretch: 99.99% (4.32 minutes downtime/month)

Performance:
  - P50 Response Time: < 200ms
  - P95 Response Time: < 1s
  - P99 Response Time: < 2s

Error Rate:
  - Target: < 1%
  - Critical: < 0.1%

Resource Utilization:
  - CPU: < 70% average
  - Memory: < 80% average
  - Disk: < 75% usage
```

## Cost Optimization

### Monitoring Cost Management
```javascript
// monitoring/scripts/cost-optimizer.js

const costOptimizer = {
  analyzeMetricUsage() {
    // Identify unused metrics
    // Recommend metric aggregation
    // Suggest sampling rates
  },
  
  optimizeLogRetention() {
    // Archive old logs to cold storage
    // Compress logs
    // Delete debug logs after 7 days
  },
  
  rightSizeMonitoring() {
    // Analyze actual usage vs provisioned
    // Recommend instance types
    // Suggest auto-scaling policies
  }
};
```

## Future Enhancements

### Short Term (1-3 months)
- [ ] AIOps integration for anomaly detection
- [ ] Distributed tracing implementation
- [ ] Custom metrics SDK
- [ ] Mobile app monitoring

### Medium Term (3-6 months)
- [ ] Machine learning for predictive alerts
- [ ] Chaos engineering integration
- [ ] Real user monitoring (RUM)
- [ ] SLO-based alerting

### Long Term (6-12 months)
- [ ] Full observability platform
- [ ] Self-healing systems
- [ ] Cost anomaly detection
- [ ] Business impact analysis

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [The Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Guide](https://www.elastic.co/guide/)

---

**Last Updated**: 2025-08-15  
**Version**: 2.0.0  
**Owner**: DevOps Team