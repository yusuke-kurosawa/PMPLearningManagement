# Monitoring, Logging & Metrics Reference / 監視・ログ・メトリクスリファレンス

> 📊 **Real-time dashboard**: `npm run monitor:dashboard`  
> 📈 **Metrics explorer**: `npm run monitor:metrics`  
> 🔍 **Log viewer**: `npm run monitor:logs`

## 🎯 Monitoring Overview

### Quick Health Check

```bash
# System health check
npm run health:check

# Service status
curl http://localhost:5173/api/health | jq

# Response:
{
  "status": "healthy",
  "uptime": 123456,
  "timestamp": "2024-03-01T10:00:00Z",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "storage": "accessible"
  }
}
```

## 📊 Application Metrics

### Performance Metrics

```javascript
// Core Web Vitals monitoring
const measureWebVitals = () => {
  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)

    // Send to analytics
    sendMetric('lcp', lastEntry.renderTime || lastEntry.loadTime)
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      const delay = entry.processingStart - entry.startTime
      console.log('FID:', delay)
      sendMetric('fid', delay)
    })
  }).observe({ type: 'first-input', buffered: true })

  // Cumulative Layout Shift (CLS)
  let clsValue = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    }
    console.log('CLS:', clsValue)
    sendMetric('cls', clsValue)
  }).observe({ type: 'layout-shift', buffered: true })
}

// Custom metrics
const trackCustomMetric = (name, value, tags = {}) => {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    tags: {
      environment: process.env.NODE_ENV,
      version: process.env.VITE_APP_VERSION,
      ...tags,
    },
  }

  // Send to monitoring service
  sendToMonitoring(metric)
}
```

### Business Metrics

```javascript
// Track user engagement
const trackEngagement = {
  pageView: (page) => {
    trackCustomMetric('page_view', 1, { page })
  },

  feature: (feature, action) => {
    trackCustomMetric('feature_usage', 1, { feature, action })
  },

  conversion: (type, value) => {
    trackCustomMetric('conversion', value, { type })
  },

  error: (error, context) => {
    trackCustomMetric('error', 1, {
      error: error.message,
      stack: error.stack,
      context,
    })
  },
}

// Usage
trackEngagement.pageView('/dashboard')
trackEngagement.feature('flashcards', 'started')
trackEngagement.conversion('signup', 1)
```

## 📝 Logging Strategy

### Structured Logging

```javascript
// Logger configuration
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'pmp-learning',
    environment: process.env.NODE_ENV,
    version: process.env.VITE_APP_VERSION,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
})

// Log levels
logger.error('Database connection failed', {
  error: err.message,
  host: 'localhost',
  port: 5432,
})

logger.warn('API rate limit approaching', {
  current: 95,
  limit: 100,
})

logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
})

logger.debug('Cache hit', {
  key: 'user:123',
  ttl: 300,
})
```

### Frontend Logging

```javascript
// Browser console wrapper
class BrowserLogger {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true
    this.level = options.level ?? 'info'
    this.remote = options.remote ?? true
    this.buffer = []
    this.maxBufferSize = 100
  }

  log(level, message, data = {}) {
    if (!this.enabled) return

    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Console output
    console[level](message, data)

    // Buffer for remote sending
    if (this.remote) {
      this.buffer.push(logEntry)
      if (this.buffer.length >= this.maxBufferSize) {
        this.flush()
      }
    }
  }

  flush() {
    if (this.buffer.length === 0) return

    // Send logs to server
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: this.buffer }),
    }).catch(console.error)

    this.buffer = []
  }

  error(message, data) {
    this.log('error', message, data)
  }
  warn(message, data) {
    this.log('warn', message, data)
  }
  info(message, data) {
    this.log('info', message, data)
  }
  debug(message, data) {
    this.log('debug', message, data)
  }
}

const logger = new BrowserLogger({
  enabled: process.env.NODE_ENV !== 'production',
  remote: true,
})

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  })
})

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise,
  })
})
```

## 🔍 Distributed Tracing

### OpenTelemetry Setup

```javascript
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'

// Configure tracer
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pmp-learning',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERSION,
  }),
})

// Configure exporter
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
})

provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter))
provider.register()

// Create spans
const tracer = opentelemetry.trace.getTracer('pmp-learning')

const span = tracer.startSpan('process-payment')
span.setAttributes({
  'payment.amount': 99.99,
  'payment.currency': 'USD',
  'user.id': userId,
})

try {
  // Process payment
  const result = await processPayment()
  span.setStatus({ code: SpanStatusCode.OK })
} catch (error) {
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  })
  span.recordException(error)
} finally {
  span.end()
}
```

### Request Tracing

```javascript
// Trace HTTP requests
const traceRequest = (req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`)

  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.target': req.path,
    'http.host': req.hostname,
    'http.scheme': req.protocol,
    'http.user_agent': req.get('user-agent'),
    'http.request_content_length': req.get('content-length'),
  })

  // Store span in request
  req.span = span

  // Intercept response
  const originalSend = res.send
  res.send = function (data) {
    span.setAttributes({
      'http.status_code': res.statusCode,
      'http.response_content_length': res.get('content-length'),
    })

    if (res.statusCode >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR })
    }

    span.end()
    originalSend.call(this, data)
  }

  next()
}
```

## 📈 Real-time Monitoring

### Server-Sent Events (SSE)

```javascript
// Server: Stream metrics
app.get('/api/metrics/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const interval = setInterval(() => {
    const metrics = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      timestamp: Date.now(),
    }

    res.write(`data: ${JSON.stringify(metrics)}\n\n`)
  }, 1000)

  req.on('close', () => {
    clearInterval(interval)
  })
})

// Client: Receive metrics
const eventSource = new EventSource('/api/metrics/stream')

eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data)
  updateDashboard(metrics)
}

eventSource.onerror = (error) => {
  console.error('SSE error:', error)
  eventSource.close()
}
```

### WebSocket Monitoring

```javascript
// Server: WebSocket metrics
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('Monitoring client connected')

  const interval = setInterval(() => {
    const metrics = collectMetrics()
    ws.send(JSON.stringify(metrics))
  }, 1000)

  ws.on('close', () => {
    clearInterval(interval)
  })
})

// Client: WebSocket connection
const ws = new WebSocket('ws://localhost:8080')

ws.onmessage = (event) => {
  const metrics = JSON.parse(event.data)
  updateRealTimeDashboard(metrics)
}
```

## 🎛️ Dashboard Components

### Metrics Dashboard

```jsx
const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/metrics')
      const data = await response.json()
      setMetrics(data)
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="metrics-dashboard">
      <div className="metric-card">
        <h3>Response Time</h3>
        <div className="metric-value">{metrics.responseTime}ms</div>
        <Sparkline data={metrics.responseTimeHistory} />
      </div>

      <div className="metric-card">
        <h3>Error Rate</h3>
        <div className="metric-value">{metrics.errorRate}%</div>
        <Gauge value={metrics.errorRate} max={100} />
      </div>

      <div className="metric-card">
        <h3>Active Users</h3>
        <div className="metric-value">{metrics.activeUsers}</div>
        <AreaChart data={metrics.userHistory} />
      </div>

      <div className="metric-card">
        <h3>System Health</h3>
        <HealthIndicator status={metrics.health} />
      </div>
    </div>
  )
}
```

## 🚨 Alerting

### Alert Configuration

```javascript
// Alert rules
const alertRules = [
  {
    name: 'High Error Rate',
    metric: 'error_rate',
    condition: 'greater_than',
    threshold: 5, // 5%
    duration: 300, // 5 minutes
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
  },
  {
    name: 'Slow Response Time',
    metric: 'response_time_p95',
    condition: 'greater_than',
    threshold: 1000, // 1 second
    duration: 600, // 10 minutes
    severity: 'warning',
    channels: ['email', 'slack'],
  },
  {
    name: 'Low Disk Space',
    metric: 'disk_usage_percent',
    condition: 'greater_than',
    threshold: 90,
    duration: 0, // Immediate
    severity: 'warning',
    channels: ['email'],
  },
]

// Alert evaluator
class AlertManager {
  constructor(rules) {
    this.rules = rules
    this.activeAlerts = new Map()
  }

  evaluate(metrics) {
    for (const rule of this.rules) {
      const value = metrics[rule.metric]
      const triggered = this.checkCondition(value, rule)

      if (triggered) {
        this.triggerAlert(rule, value)
      } else {
        this.resolveAlert(rule)
      }
    }
  }

  checkCondition(value, rule) {
    switch (rule.condition) {
      case 'greater_than':
        return value > rule.threshold
      case 'less_than':
        return value < rule.threshold
      case 'equals':
        return value === rule.threshold
      default:
        return false
    }
  }

  triggerAlert(rule, value) {
    const alertKey = rule.name

    if (!this.activeAlerts.has(alertKey)) {
      const alert = {
        rule,
        value,
        triggeredAt: Date.now(),
        id: crypto.randomUUID(),
      }

      this.activeAlerts.set(alertKey, alert)
      this.sendAlert(alert)
    }
  }

  sendAlert(alert) {
    for (const channel of alert.rule.channels) {
      this.notifyChannel(channel, alert)
    }
  }

  notifyChannel(channel, alert) {
    switch (channel) {
      case 'email':
        sendEmail({
          to: 'ops@pmp-learning.com',
          subject: `[${alert.rule.severity}] ${alert.rule.name}`,
          body: `Alert triggered: ${alert.rule.name}\nValue: ${alert.value}\nThreshold: ${alert.rule.threshold}`,
        })
        break

      case 'slack':
        postToSlack({
          channel: '#alerts',
          text: `:warning: ${alert.rule.name}`,
          attachments: [
            {
              color: alert.rule.severity === 'critical' ? 'danger' : 'warning',
              fields: [
                { title: 'Metric', value: alert.rule.metric },
                { title: 'Value', value: alert.value },
                { title: 'Threshold', value: alert.rule.threshold },
              ],
            },
          ],
        })
        break

      case 'pagerduty':
        if (alert.rule.severity === 'critical') {
          createPagerDutyIncident({
            title: alert.rule.name,
            urgency: 'high',
            details: alert,
          })
        }
        break
    }
  }

  resolveAlert(rule) {
    const alertKey = rule.name
    if (this.activeAlerts.has(alertKey)) {
      const alert = this.activeAlerts.get(alertKey)
      this.activeAlerts.delete(alertKey)
      this.sendResolution(alert)
    }
  }
}
```

## 📊 Performance Monitoring

### Application Performance Monitoring (APM)

```javascript
// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint()

  // Override end method
  const originalEnd = res.end
  res.end = function (...args) {
    const duration = Number(process.hrtime.bigint() - start) / 1000000 // Convert to ms

    // Record metrics
    histogram.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      },
      duration
    )

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        status: res.statusCode,
      })
    }

    originalEnd.apply(this, args)
  }

  next()
}

// Database query monitoring
const monitorQuery = async (query, params) => {
  const start = Date.now()

  try {
    const result = await executeQuery(query, params)
    const duration = Date.now() - start

    // Record metrics
    dbHistogram.observe({ query: query.split(' ')[0] }, duration)

    // Log slow queries
    if (duration > 100) {
      logger.warn('Slow query detected', {
        query,
        duration,
        rows: result.length,
      })
    }

    return result
  } catch (error) {
    dbErrors.inc({ query: query.split(' ')[0] })
    throw error
  }
}
```

### Resource Monitoring

```javascript
// System resource monitoring
const monitorResources = () => {
  setInterval(() => {
    const usage = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid,
    }

    // Calculate percentages
    const totalMemory = os.totalmem()
    const memoryPercent = (usage.memory.rss / totalMemory) * 100

    // Check thresholds
    if (memoryPercent > 80) {
      logger.warn('High memory usage', {
        percent: memoryPercent,
        rss: usage.memory.rss,
      })
    }

    // Send to monitoring
    sendMetrics('system.resources', usage)
  }, 30000) // Every 30 seconds
}

// Garbage collection monitoring
if (global.gc) {
  const gcStats = require('gc-stats')()

  gcStats.on('stats', (stats) => {
    logger.debug('Garbage collection', {
      type: stats.gctype,
      pause: stats.pause,
      heap: stats.diff.usedHeapSize,
    })

    // Alert on frequent GC
    if (stats.pause > 100) {
      logger.warn('Long GC pause detected', { pause: stats.pause })
    }
  })
}
```

## 📈 Grafana Dashboard

### Dashboard Configuration

```json
{
  "dashboard": {
    "title": "PMP Learning Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
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
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(http_requests_total{status=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
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

## 🔄 Log Aggregation

### ELK Stack Configuration

```yaml
# Logstash pipeline
input {
file {
path => "/var/log/pmp-learning/*.log"
start_position => "beginning"
codec => "json"
}
}

filter {
date {
match => [ "timestamp", "ISO8601" ]
}

geoip {
source => "client_ip"
}

mutate {
add_field => { "environment" => "%{[fields][environment]}" }
}
}

output {
elasticsearch {
hosts => ["localhost:9200"]
index => "pmp-learning-%{+YYYY.MM.dd}"
}
}
```

### Log Queries

```javascript
// Elasticsearch queries
const searchLogs = async (query) => {
  const response = await elastic.search({
    index: 'pmp-learning-*',
    body: {
      query: {
        bool: {
          must: [{ match: { message: query } }, { range: { timestamp: { gte: 'now-1h' } } }],
        },
      },
      aggs: {
        by_level: {
          terms: { field: 'level.keyword' },
        },
        over_time: {
          date_histogram: {
            field: 'timestamp',
            interval: '5m',
          },
        },
      },
    },
  })

  return response.body
}
```

## 🎯 SLIs and SLOs

### Service Level Indicators

```yaml
SLIs:
  availability:
    definition: 'Percentage of successful requests'
    measurement: '(1 - (5xx_errors / total_requests)) * 100'

  latency:
    definition: '95th percentile response time'
    measurement: 'histogram_quantile(0.95, response_time)'

  error_rate:
    definition: 'Percentage of failed requests'
    measurement: '(4xx_errors + 5xx_errors) / total_requests * 100'
```

### Service Level Objectives

```yaml
SLOs:
  availability:
    target: 99.9%
    window: 30 days

  latency:
    target: < 200ms
    percentile: 95
    window: 7 days

  error_rate:
    target: < 1%
    window: 24 hours
```

## 📋 Monitoring Checklist

### Daily Checks

```yaml
✅ Check error rates
✅ Review response times
✅ Monitor active users
✅ Check disk space
✅ Review error logs
✅ Verify backup completion
```

### Weekly Tasks

```yaml
✅ Review performance trends
✅ Analyze user behavior
✅ Check security alerts
✅ Update monitoring thresholds
✅ Test alert channels
✅ Review SLO compliance
```

### Monthly Reviews

```yaml
✅ Capacity planning
✅ Cost optimization
✅ Incident post-mortems
✅ Dashboard updates
✅ Alert rule tuning
✅ Documentation updates
```

---

_Monitoring configuration is continuously updated. Last update: Check with `npm run monitor:status`_
