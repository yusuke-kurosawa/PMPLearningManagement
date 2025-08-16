# Monitoring & Observability Prompts - Comprehensive Monitoring Guide

## 📊 Quick Observability Assessment

```
Assess and implement observability for PMPLearningManagement:

**Current State:**
- Metrics Collection: {none/basic/advanced}
- Logging Strategy: {none/basic/structured}
- Distributed Tracing: {none/partial/full}
- APM Solution: {none/DataDog/NewRelic/other}
- Alerting: {none/basic/comprehensive}

**Target State:**
- Full metrics coverage (Golden Signals)
- Structured logging with correlation
- End-to-end distributed tracing
- Proactive alerting with runbooks
- Business metrics integration

**Required Implementation:**
1. Metrics instrumentation
2. Log aggregation setup
3. Trace correlation
4. Dashboard creation
5. Alert configuration

**Success Criteria:**
- MTTD < 5 minutes
- Alert accuracy > 95%
- Dashboard load time < 3 seconds
- Log retention: 30 days
- Trace sampling: 100% for errors, 10% for success
```

## 🎯 Golden Signals Implementation

````
Implement Google's Four Golden Signals:

**1. Latency Monitoring:**
```javascript
// Express middleware for latency tracking
const promClient = require('prom-client');

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const latencyMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
};

// Prometheus query for p95 latency
const p95Query = `
  histogram_quantile(0.95,
    sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
  )
`;
````

**2. Traffic Monitoring:**

```javascript
// Request rate tracking
const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

const trafficMiddleware = (req, res, next) => {
  res.on('finish', () => {
    requestCounter.labels(req.method, req.route?.path || req.path, res.statusCode).inc()
  })
  next()
}

// Grafana dashboard query
const trafficQuery = `
  sum(rate(http_requests_total[5m])) by (route)
`
```

**3. Error Rate Monitoring:**

```javascript
// Error tracking
const errorCounter = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'error_type'],
})

const errorHandler = (err, req, res, next) => {
  const errorType = err.name || 'UnknownError'

  errorCounter.labels(req.method, req.route?.path || req.path, errorType).inc()

  // Log error with context
  logger.error({
    error: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    },
    user: req.user?.id,
  })

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
  })
}

// Error rate calculation
const errorRateQuery = `
  sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100
`
```

**4. Saturation Monitoring:**

```javascript
// Resource saturation metrics
class SaturationMonitor {
  constructor() {
    this.cpuGauge = new promClient.Gauge({
      name: 'process_cpu_usage_percent',
      help: 'CPU usage percentage',
    })

    this.memoryGauge = new promClient.Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Memory usage in bytes',
    })

    this.connectionPoolGauge = new promClient.Gauge({
      name: 'db_connection_pool_usage',
      help: 'Database connection pool usage',
      labelNames: ['pool_name'],
    })
  }

  start() {
    setInterval(() => {
      // CPU usage
      const cpuUsage = process.cpuUsage()
      this.cpuGauge.set(cpuUsage.user / 1000000)

      // Memory usage
      const memUsage = process.memoryUsage()
      this.memoryGauge.set(memUsage.heapUsed)

      // Connection pool
      if (global.dbPool) {
        this.connectionPoolGauge
          .labels('primary')
          .set(global.dbPool.activeConnections / global.dbPool.maxConnections)
      }
    }, 10000) // Every 10 seconds
  }
}
```

```

## 📝 Structured Logging

```

Implement comprehensive structured logging:

**Logging Configuration:**

```javascript
// Winston logger setup
const winston = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: {
    service: 'pmp-learning',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },

  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: 'debug',
    }),

    // File for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Elasticsearch for centralized logging
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
      },
      index: 'pmp-logs',
      transformer: (logData) => {
        return {
          '@timestamp': logData.timestamp,
          severity: logData.level,
          message: logData.message,
          fields: logData.meta,
        }
      },
    }),
  ],
})

// Request context middleware
const requestContext = require('express-http-context')

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuid()
  requestContext.set('requestId', requestId)
  res.setHeader('X-Request-ID', requestId)

  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  next()
})
```

**Log Aggregation Pipeline:**

```yaml
# Fluent Bit configuration
[SERVICE]
    Flush        5
    Daemon       Off
    Log_Level    info

[INPUT]
    Name              tail
    Path              /var/log/containers/*.log
    Parser            docker
    Tag               kube.*
    Refresh_Interval  5
    Mem_Buf_Limit     5MB

[FILTER]
    Name                kubernetes
    Match               kube.*
    Kube_URL            https://kubernetes.default.svc:443
    Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
    Merge_Log           On
    K8S-Logging.Parser  On
    K8S-Logging.Exclude On

[FILTER]
    Name    record_modifier
    Match   *
    Record  cluster ${CLUSTER_NAME}
    Record  environment ${ENVIRONMENT}

[OUTPUT]
    Name            es
    Match           *
    Host            ${ELASTICSEARCH_HOST}
    Port            443
    TLS             On
    Logstash_Format On
    Logstash_Prefix pmp-logs
    Retry_Limit     5
```

**Log Correlation:**

```javascript
// Correlation ID propagation
class CorrelationManager {
  constructor() {
    this.correlationHeader = 'X-Correlation-ID'
  }

  middleware() {
    return (req, res, next) => {
      let correlationId = req.headers[this.correlationHeader.toLowerCase()]

      if (!correlationId) {
        correlationId = uuid()
      }

      // Store in async context
      AsyncLocalStorage.run({ correlationId }, () => {
        // Attach to request
        req.correlationId = correlationId

        // Add to response headers
        res.setHeader(this.correlationHeader, correlationId)

        // Log with correlation
        logger.info('Request started', {
          correlationId,
          method: req.method,
          path: req.path,
        })

        next()
      })
    }
  }

  getCorrelationId() {
    const store = AsyncLocalStorage.getStore()
    return store?.correlationId
  }
}
```

```

## 🔍 Distributed Tracing

```

Implement end-to-end distributed tracing:

**OpenTelemetry Setup:**

```javascript
// OpenTelemetry configuration
const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { Resource } = require('@opentelemetry/resources')
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
})

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pmp-learning',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  }),
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable fs to reduce noise
      },
    }),
  ],
})

sdk.start()

// Manual span creation
const { trace } = require('@opentelemetry/api')
const tracer = trace.getTracer('pmp-learning')

async function processPayment(userId, amount) {
  const span = tracer.startSpan('process_payment', {
    attributes: {
      'user.id': userId,
      'payment.amount': amount,
      'payment.currency': 'USD',
    },
  })

  try {
    // Validate payment
    const validationSpan = tracer.startSpan('validate_payment', { parent: span })
    await validatePayment(userId, amount)
    validationSpan.end()

    // Process with Stripe
    const stripeSpan = tracer.startSpan('stripe_charge', { parent: span })
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      source: 'tok_visa',
    })
    stripeSpan.setAttribute('stripe.charge.id', charge.id)
    stripeSpan.end()

    // Update database
    const dbSpan = tracer.startSpan('update_database', { parent: span })
    await db.payments.create({ userId, amount, chargeId: charge.id })
    dbSpan.end()

    span.setStatus({ code: 0 })
    return charge
  } catch (error) {
    span.recordException(error)
    span.setStatus({ code: 2, message: error.message })
    throw error
  } finally {
    span.end()
  }
}
```

**Trace Context Propagation:**

```javascript
// HTTP client with trace propagation
const axios = require('axios')
const { context, propagation } = require('@opentelemetry/api')

class TracedHttpClient {
  async request(config) {
    const headers = {}

    // Inject trace context into headers
    propagation.inject(context.active(), headers)

    return axios({
      ...config,
      headers: {
        ...config.headers,
        ...headers,
      },
    })
  }
}

// Service mesh integration
const linkerd = {
  headers: {
    'l5d-dst-override': 'service.namespace.svc.cluster.local:port',
    'l5d-ctx-trace': 'trace-id',
  },
}
```

```

## 🚨 Alerting Strategy

```

Implement comprehensive alerting:

**Alert Configuration:**

```yaml
# Prometheus alerting rules
groups:
  - name: application
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: 'High error rate detected'
          description: 'Error rate is {{ $value | humanizePercentage }} for the last 5 minutes'
          runbook: 'https://runbooks.pmplearning.com/high-error-rate'

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
          ) > 1
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: 'High latency on route {{ $labels.route }}'
          description: '95th percentile latency is {{ $value }}s'

      - alert: PodMemoryUsage
        expr: |
          container_memory_usage_bytes{pod=~"pmp-.*"} 
          / container_spec_memory_limit_bytes > 0.8
        for: 5m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: 'Pod {{ $labels.pod }} memory usage is high'
          description: 'Memory usage is {{ $value | humanizePercentage }}'

  - name: sla
    interval: 1m
    rules:
      - alert: SLABreach
        expr: |
          (1 - (
            sum(rate(http_requests_total{status!~"5.."}[5m]))
            / sum(rate(http_requests_total[5m]))
          )) < 0.999
        for: 5m
        labels:
          severity: critical
          team: management
        annotations:
          summary: 'SLA breach detected'
          description: 'Availability is below 99.9% SLA'
          dashboard: 'https://grafana.pmplearning.com/d/sla'
```

**Alert Routing:**

```yaml
# AlertManager configuration
global:
  resolve_timeout: 5m
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true

    - match:
        severity: warning
      receiver: 'slack-warnings'

    - match:
        team: database
      receiver: 'database-team'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        description: '{{ .GroupLabels.alertname }}'
        details:
          severity: '{{ .CommonLabels.severity }}'
          environment: '{{ .CommonLabels.environment }}'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#warnings'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

**Smart Alerting:**

```javascript
// Intelligent alert suppression
class AlertManager {
  constructor() {
    this.alertHistory = new Map()
    this.suppressionRules = []
  }

  async evaluateAlert(alert) {
    // Check for flapping
    if (this.isFlapping(alert)) {
      return this.suppressFlapping(alert)
    }

    // Check for maintenance windows
    if (await this.inMaintenanceWindow(alert.service)) {
      return this.suppressForMaintenance(alert)
    }

    // Check for known issues
    if (await this.isKnownIssue(alert)) {
      return this.linkToKnownIssue(alert)
    }

    // Apply ML-based anomaly detection
    const isAnomaly = await this.detectAnomaly(alert)
    if (!isAnomaly) {
      return this.suppressNonAnomaly(alert)
    }

    // Enrich alert with context
    const enrichedAlert = await this.enrichAlert(alert)

    // Route to appropriate channel
    return this.routeAlert(enrichedAlert)
  }

  isFlapping(alert) {
    const key = `${alert.name}-${alert.service}`
    const history = this.alertHistory.get(key) || []

    // Check if alert has fired multiple times in short period
    const recentAlerts = history.filter(
      (a) => Date.now() - a.timestamp < 15 * 60 * 1000 // 15 minutes
    )

    return recentAlerts.length > 3
  }

  async enrichAlert(alert) {
    return {
      ...alert,
      runbook: await this.getRunbook(alert.name),
      lastDeployment: await this.getLastDeployment(alert.service),
      relatedIncidents: await this.findRelatedIncidents(alert),
      suggestedActions: await this.getSuggestedActions(alert),
      oncallEngineer: await this.getOncallEngineer(alert.team),
    }
  }
}
```

```

## 📊 Dashboards & Visualization

```

Create comprehensive monitoring dashboards:

**Grafana Dashboard Configuration:**

```json
{
  "dashboard": {
    "title": "PMPLearning Operations Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (route)",
            "legendFormat": "{{ route }}"
          }
        ],
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 }
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_errors_total[5m])) by (route) / sum(rate(http_requests_total[5m])) by (route) * 100",
            "legendFormat": "{{ route }}"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": { "params": [5], "type": "gt" },
              "operator": { "type": "and" },
              "query": { "params": ["A", "5m", "now"] },
              "reducer": { "params": [], "type": "avg" },
              "type": "query"
            }
          ]
        },
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 }
      },
      {
        "title": "Response Time (p50, p95, p99)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.5, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "p99"
          }
        ],
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 }
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends{datname=\"pmplearning\"}",
            "legendFormat": "Active Connections"
          },
          {
            "expr": "pg_settings_max_connections",
            "legendFormat": "Max Connections"
          }
        ],
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 }
      }
    ],
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "custom",
          "options": [
            { "text": "production", "value": "prod" },
            { "text": "staging", "value": "staging" },
            { "text": "development", "value": "dev" }
          ]
        }
      ]
    }
  }
}
```

**Custom Metrics Dashboard:**

```javascript
// Business metrics collection
class BusinessMetrics {
  constructor() {
    this.metrics = {
      userRegistrations: new promClient.Counter({
        name: 'user_registrations_total',
        help: 'Total number of user registrations',
      }),

      courseCompletions: new promClient.Counter({
        name: 'course_completions_total',
        help: 'Total number of course completions',
        labelNames: ['course_id'],
      }),

      revenue: new promClient.Counter({
        name: 'revenue_total',
        help: 'Total revenue in cents',
        labelNames: ['product_type'],
      }),

      activeUsers: new promClient.Gauge({
        name: 'active_users',
        help: 'Number of active users',
        labelNames: ['timeframe'],
      }),
    }
  }

  trackRegistration(userId) {
    this.metrics.userRegistrations.inc()
    logger.info('User registered', { userId, metric: 'registration' })
  }

  trackCourseCompletion(userId, courseId) {
    this.metrics.courseCompletions.labels(courseId).inc()
    logger.info('Course completed', { userId, courseId, metric: 'course_completion' })
  }

  trackRevenue(amount, productType) {
    this.metrics.revenue.labels(productType).inc(amount * 100) // Convert to cents
    logger.info('Revenue tracked', { amount, productType, metric: 'revenue' })
  }

  async updateActiveUsers() {
    const daily = await db.query(
      "SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '1 day'"
    )
    const weekly = await db.query(
      "SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '7 days'"
    )
    const monthly = await db.query(
      "SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '30 days'"
    )

    this.metrics.activeUsers.labels('daily').set(daily[0].count)
    this.metrics.activeUsers.labels('weekly').set(weekly[0].count)
    this.metrics.activeUsers.labels('monthly').set(monthly[0].count)
  }
}
```

```

## 🔬 APM Integration

```

Integrate Application Performance Monitoring:

**DataDog APM Setup:**

```javascript
// DataDog tracing
const tracer = require('dd-trace').init({
  service: 'pmp-learning',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  analytics: true,
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  appsec: true,
})

// Custom instrumentation
tracer.use('express', {
  hooks: {
    request: (span, req, res) => {
      span.setTag('user.id', req.user?.id)
      span.setTag('request.id', req.id)
    },
  },
})

// Database query tracing
tracer.use('pg', {
  service: 'pmp-postgres',
  analytics: true,
})

// Redis tracing
tracer.use('redis', {
  service: 'pmp-redis',
  analytics: true,
})

// Custom span for business logic
function processLearningPath(userId, courseId) {
  return tracer.trace(
    'process.learning_path',
    {
      service: 'pmp-learning',
      resource: 'learning_path',
      type: 'business',
    },
    async (span) => {
      span.setTag('user.id', userId)
      span.setTag('course.id', courseId)

      try {
        const result = await complexBusinessLogic()
        span.setTag('result.status', 'success')
        return result
      } catch (error) {
        span.setTag('error', true)
        span.setTag('error.message', error.message)
        throw error
      }
    }
  )
}
```

**Performance Profiling:**

```javascript
// Continuous profiling with pprof
const pprof = require('pprof')

async function startProfiling() {
  // Start CPU profiling
  const cpuProfile = await pprof.time.profile({
    durationMillis: 10000, // 10 seconds
    intervalMicros: 1000,
  })

  // Upload to profiling service
  await uploadProfile(cpuProfile, 'cpu')

  // Heap profiling
  const heapProfile = await pprof.heap.profile()
  await uploadProfile(heapProfile, 'heap')

  // Schedule next profiling
  setTimeout(startProfiling, 60000) // Every minute
}

// Memory leak detection
const heapdump = require('heapdump')

setInterval(() => {
  const memUsage = process.memoryUsage()
  if (memUsage.heapUsed > 500 * 1024 * 1024) {
    // 500MB threshold
    const filename = `/tmp/heapdump-${Date.now()}.heapsnapshot`
    heapdump.writeSnapshot(filename, (err, filename) => {
      logger.warn('Heap snapshot written', { filename, memUsage })
    })
  }
}, 60000)
```

```

## 🤖 AIOps & Anomaly Detection

```

Implement AI-powered operations:

**Anomaly Detection:**

```python
# Anomaly detection service
import numpy as np
from sklearn.ensemble import IsolationForest
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1)
        self.registry = CollectorRegistry()
        self.anomaly_score = Gauge(
            'anomaly_score',
            'Anomaly detection score',
            ['metric_name'],
            registry=self.registry
        )

    def train(self, historical_data):
        """Train on historical metrics"""
        features = self.extract_features(historical_data)
        self.model.fit(features)

    def detect(self, current_metrics):
        """Detect anomalies in current metrics"""
        features = self.extract_features([current_metrics])
        score = self.model.decision_function(features)[0]
        is_anomaly = self.model.predict(features)[0] == -1

        # Update Prometheus metric
        self.anomaly_score.labels(metric_name='system').set(score)

        if is_anomaly:
            return {
                'is_anomaly': True,
                'score': score,
                'affected_metrics': self.identify_affected_metrics(current_metrics),
                'suggested_actions': self.suggest_remediation(current_metrics)
            }

        return {'is_anomaly': False, 'score': score}

    def extract_features(self, data):
        """Extract relevant features from metrics"""
        features = []
        for metrics in data:
            features.append([
                metrics.get('cpu_usage', 0),
                metrics.get('memory_usage', 0),
                metrics.get('request_rate', 0),
                metrics.get('error_rate', 0),
                metrics.get('response_time', 0)
            ])
        return np.array(features)
```

**Predictive Alerting:**

```javascript
// Predictive alerting system
class PredictiveAlerting {
  async predictIncident(metrics) {
    const prediction = await this.mlModel.predict({
      current_error_rate: metrics.errorRate,
      error_rate_trend: this.calculateTrend(metrics.errorRateHistory),
      cpu_usage: metrics.cpuUsage,
      memory_growth_rate: this.calculateGrowthRate(metrics.memoryHistory),
      deployment_recency: this.getTimeSinceLastDeployment(),
    })

    if (prediction.probability > 0.8) {
      return {
        alert: true,
        probability: prediction.probability,
        predicted_incident_type: prediction.incidentType,
        time_to_incident: prediction.timeToIncident,
        preventive_actions: this.getPreventiveActions(prediction.incidentType),
        confidence: prediction.confidence,
      }
    }

    return { alert: false, probability: prediction.probability }
  }

  getPreventiveActions(incidentType) {
    const actions = {
      memory_exhaustion: [
        'Restart service with increased memory limit',
        'Enable memory profiling',
        'Review recent code changes for memory leaks',
      ],
      cascade_failure: [
        'Enable circuit breakers',
        'Increase service replicas',
        'Review dependency health',
      ],
      database_overload: [
        'Enable read replica',
        'Optimize slow queries',
        'Increase connection pool size',
      ],
    }

    return actions[incidentType] || ['Review system metrics', 'Increase monitoring']
  }
}
```

**Intelligent Log Analysis:**

```javascript
// Log pattern analysis
class LogAnalyzer {
  async analyzePatterns(timeRange) {
    const logs = await this.fetchLogs(timeRange)

    // Cluster similar log messages
    const clusters = await this.clusterLogs(logs)

    // Identify anomalous patterns
    const anomalies = clusters.filter((cluster) => {
      return (
        cluster.count > cluster.baseline * 2 || // Spike detection
        cluster.isNewPattern || // New error pattern
        cluster.severity === 'critical'
      ) // Critical errors
    })

    // Generate insights
    return {
      total_logs: logs.length,
      unique_patterns: clusters.length,
      anomalies: anomalies.map((a) => ({
        pattern: a.pattern,
        count: a.count,
        sample: a.sample,
        first_seen: a.firstSeen,
        recommendation: this.getRecommendation(a),
      })),
      trends: this.analyzeTrends(clusters),
      correlations: await this.findCorrelations(anomalies),
    }
  }

  async findCorrelations(anomalies) {
    const correlations = []

    for (const anomaly of anomalies) {
      // Check for deployment correlation
      const deployment = await this.findNearbyDeployment(anomaly.firstSeen)
      if (deployment) {
        correlations.push({
          type: 'deployment',
          anomaly: anomaly.pattern,
          deployment: deployment.version,
          time_delta: anomaly.firstSeen - deployment.timestamp,
        })
      }

      // Check for traffic correlation
      const trafficSpike = await this.findTrafficSpike(anomaly.firstSeen)
      if (trafficSpike) {
        correlations.push({
          type: 'traffic',
          anomaly: anomaly.pattern,
          traffic_increase: trafficSpike.percentage,
        })
      }
    }

    return correlations
  }
}
```

```

---

**Usage Notes:**
- Implement monitoring from day one
- Use structured logging consistently
- Set up alerts before going to production
- Regular review and tuning of alerts
- Maintain runbooks for all alerts
- Use distributed tracing for microservices

**Integration Points:**
- Incident response: `incident-analysis.md`
- Performance optimization: `performance-optimization.md`
- Debugging: `debugging.md`
- Infrastructure monitoring: `infrastructure-as-code.md`

**Success Metrics:**
- MTTD < 5 minutes
- Alert noise < 5 false positives/week
- Dashboard coverage > 95%
- Trace sampling: 100% errors, 10% success
- Log retention: 30 days minimum
```
