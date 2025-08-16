# Deployment Checklist Prompts - Comprehensive Deployment Guide

## 🚀 Quick Deployment Verification

```
Verify deployment readiness for PMPLearningManagement:

**Deployment Context:**
- Environment: {development/staging/production}
- Version: {from} → {to}
- Type: {blue-green/canary/rolling/recreate}
- Rollback Plan: {available/not available}
- Deployment Window: {datetime range}

**Pre-Deployment Checklist:**
□ All tests passing (unit, integration, E2E)
□ Code review completed and approved
□ Security scan passed
□ Performance benchmarks met
□ Documentation updated
□ Database migrations tested
□ Feature flags configured
□ Rollback plan documented
□ Stakeholders notified
□ Monitoring alerts configured

**Required Validation:**
1. Build artifacts integrity
2. Configuration correctness
3. Dependencies compatibility
4. Resource availability
5. Backup verification

**Success Criteria:**
- Zero downtime deployment
- Error rate < 0.1%
- Response time degradation < 10%
- All health checks passing
- Rollback time < 5 minutes
```

## 📋 Pre-Deployment Verification

````
Execute comprehensive pre-deployment checks:

**Code Quality Gates:**
```yaml
quality_gates:
  coverage:
    unit_tests: ">= 80%"
    integration_tests: ">= 70%"
    e2e_tests: ">= 60%"

  code_quality:
    complexity: "< 10"
    duplication: "< 5%"
    tech_debt: "< 2 days"
    code_smells: "< 10"

  security:
    vulnerabilities: "0 critical, 0 high"
    secrets_scan: "passed"
    dependency_check: "passed"

  performance:
    build_time: "< 5 minutes"
    bundle_size: "< 500KB"
    lighthouse_score: "> 90"
````

**Database Migration Validation:**

```sql
-- Pre-migration checks
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Backup verification
SELECT
  backup_id,
  backup_time,
  backup_size,
  status
FROM backup_history
WHERE backup_time > NOW() - INTERVAL '24 hours'
ORDER BY backup_time DESC
LIMIT 1;

-- Migration dry run
BEGIN;
  -- Run migrations
  SELECT migrate_up();
  -- Verify schema
  SELECT verify_schema();
ROLLBACK;
```

**Infrastructure Readiness:**

```bash
#!/bin/bash
# Infrastructure validation script

echo "Checking infrastructure readiness..."

# Check cluster capacity
kubectl top nodes
kubectl describe nodes | grep -E "Allocatable|Allocated resources"

# Verify services
kubectl get services -n production
kubectl get ingress -n production

# Check certificates
echo "SSL Certificate Status:"
openssl s_client -connect api.pmplearning.com:443 -servername api.pmplearning.com < /dev/null | openssl x509 -noout -dates

# Verify DNS
dig api.pmplearning.com
dig www.pmplearning.com

# Check storage
df -h
kubectl get pv
kubectl get pvc -n production
```

**Dependency Verification:**

```javascript
// Dependency compatibility check
const checkDependencies = async () => {
  const package = require('./package.json')
  const lockfile = require('./package-lock.json')

  // Verify lock file integrity
  const integrityCheck = await exec('npm ci --dry-run')

  // Check for conflicts
  const conflicts = []
  for (const [dep, version] of Object.entries(package.dependencies)) {
    const locked = lockfile.dependencies[dep]
    if (!locked || !semver.satisfies(locked.version, version)) {
      conflicts.push({ dep, expected: version, found: locked?.version })
    }
  }

  // Verify peer dependencies
  const peerDeps = await exec('npm ls --depth=0')

  return {
    integrity: integrityCheck.success,
    conflicts,
    peerDependencies: peerDeps.success,
  }
}
```

```

## 🔄 Deployment Execution

```

Execute deployment with safety checks:

**Blue-Green Deployment:**

```yaml
# Kubernetes blue-green deployment
apiVersion: v1
kind: Service
metadata:
  name: pmp-app
spec:
  selector:
    app: pmp-app
    version: green # Switch between blue/green
  ports:
    - port: 80
      targetPort: 3000

---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pmp-app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pmp-app
      version: green
  template:
    metadata:
      labels:
        app: pmp-app
        version: green
    spec:
      containers:
        - name: app
          image: pmplearning:v2.0.0
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
```

**Canary Deployment:**

```javascript
// Progressive canary rollout
class CanaryDeployment {
  async deploy(version, stages = [5, 25, 50, 100]) {
    for (const percentage of stages) {
      console.log(`Rolling out to ${percentage}% of traffic`)

      // Update traffic split
      await this.updateTrafficSplit(version, percentage)

      // Monitor metrics
      await this.sleep(5 * 60 * 1000) // 5 minutes

      const metrics = await this.getMetrics()
      if (!this.meetsThresholds(metrics)) {
        console.error('Canary failed health checks')
        await this.rollback()
        throw new Error('Deployment failed')
      }
    }

    console.log('Canary deployment successful')
  }

  meetsThresholds(metrics) {
    return metrics.errorRate < 0.01 && metrics.latencyP99 < 500 && metrics.successRate > 0.99
  }
}
```

**Rolling Update:**

```yaml
# Kubernetes rolling update
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pmp-app
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2 # Max pods above desired replicas
      maxUnavailable: 1 # Max pods that can be unavailable
  template:
    spec:
      containers:
        - name: app
          image: pmplearning:v2.0.0
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

**Feature Flag Management:**

```javascript
// LaunchDarkly/Unleash integration
class FeatureFlags {
  async deployWithFlags(feature, rolloutPercentage) {
    // Create feature flag
    await this.createFlag({
      key: feature,
      variations: [
        { value: false, name: 'control' },
        { value: true, name: 'treatment' },
      ],
      fallthrough: {
        rollout: {
          variations: [
            { variation: 0, weight: 100 - rolloutPercentage },
            { variation: 1, weight: rolloutPercentage },
          ],
        },
      },
    })

    // Monitor feature performance
    const metrics = await this.monitorFeature(feature)

    if (metrics.success) {
      // Gradually increase rollout
      await this.updateRollout(feature, 100)
    } else {
      // Disable feature
      await this.disableFeature(feature)
    }
  }
}
```

```

## ✅ Post-Deployment Validation

```

Validate deployment success:

**Health Check Suite:**

```javascript
// Comprehensive health checks
class HealthChecker {
  async checkAll() {
    const checks = [
      this.checkAPI(),
      this.checkDatabase(),
      this.checkCache(),
      this.checkMessageQueue(),
      this.checkDependencies(),
      this.checkDiskSpace(),
      this.checkMemory(),
    ]

    const results = await Promise.allSettled(checks)

    return {
      healthy: results.every((r) => r.status === 'fulfilled' && r.value.healthy),
      checks: results.map((r, i) => ({
        name: checks[i].name,
        status: r.status === 'fulfilled' ? r.value : 'failed',
        error: r.reason,
      })),
    }
  }

  async checkAPI() {
    const endpoints = ['/api/health', '/api/auth/status', '/api/users/me', '/api/courses']

    for (const endpoint of endpoints) {
      const response = await fetch(`${this.baseURL}${endpoint}`)
      if (!response.ok) {
        throw new Error(`Endpoint ${endpoint} returned ${response.status}`)
      }
    }

    return { healthy: true }
  }

  async checkDatabase() {
    const result = await db.raw('SELECT 1')
    return { healthy: true, connections: db.pool.numUsed() }
  }
}
```

**Smoke Tests:**

```javascript
// Critical path smoke tests
describe('Post-Deployment Smoke Tests', () => {
  test('User can login', async () => {
    const response = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'testpass',
    })
    expect(response.status).toBe(200)
    expect(response.data.token).toBeDefined()
  })

  test('Main features accessible', async () => {
    const features = ['/dashboard', '/courses', '/profile', '/settings']

    for (const feature of features) {
      const response = await api.get(feature)
      expect(response.status).toBe(200)
    }
  })

  test('Data integrity maintained', async () => {
    const count = await db.users.count()
    expect(count).toBeGreaterThan(0)

    const sample = await db.users.findFirst()
    expect(sample).toHaveProperty('id')
    expect(sample).toHaveProperty('email')
  })
})
```

**Performance Validation:**

```javascript
// Performance regression detection
class PerformanceValidator {
  async validate() {
    const baseline = await this.getBaseline()
    const current = await this.measureCurrent()

    const regression = {
      responseTime: (current.p95 - baseline.p95) / baseline.p95,
      throughput: (baseline.rps - current.rps) / baseline.rps,
      errorRate: current.errorRate - baseline.errorRate,
    }

    if (regression.responseTime > 0.1) {
      throw new Error(`Response time regression: ${regression.responseTime * 100}%`)
    }

    if (regression.throughput > 0.1) {
      throw new Error(`Throughput regression: ${regression.throughput * 100}%`)
    }

    if (regression.errorRate > 0.01) {
      throw new Error(`Error rate increased by ${regression.errorRate * 100}%`)
    }

    return { passed: true, metrics: current }
  }
}
```

**Monitoring Verification:**

```yaml
# Prometheus queries for validation
validation_queries:
  - name: 'Error Rate'
    query: |
      rate(http_requests_total{status=~"5.."}[5m])
      / rate(http_requests_total[5m])
    threshold: '< 0.01'

  - name: 'Response Time P95'
    query: |
      histogram_quantile(0.95,
        rate(http_request_duration_seconds_bucket[5m])
      )
    threshold: '< 0.5'

  - name: 'Pod Restarts'
    query: |
      rate(kube_pod_container_status_restarts_total[15m])
    threshold: '= 0'

  - name: 'Memory Usage'
    query: |
      container_memory_usage_bytes
      / container_spec_memory_limit_bytes
    threshold: '< 0.8'
```

```

## 🔄 Rollback Procedures

```

Implement safe rollback procedures:

**Automated Rollback Triggers:**

```javascript
class RollbackManager {
  constructor() {
    this.triggers = {
      errorRate: 0.05, // 5% error rate
      latency: 2000, // 2 second p95 latency
      availability: 0.99, // 99% availability
      customMetric: null, // Custom business metric
    }
  }

  async monitor(deployment) {
    const interval = setInterval(async () => {
      const metrics = await this.getMetrics()

      if (this.shouldRollback(metrics)) {
        clearInterval(interval)
        await this.initiateRollback(deployment)
      }
    }, 30000) // Check every 30 seconds

    // Stop monitoring after 30 minutes
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000)
  }

  shouldRollback(metrics) {
    return (
      metrics.errorRate > this.triggers.errorRate ||
      metrics.latencyP95 > this.triggers.latency ||
      metrics.availability < this.triggers.availability
    )
  }

  async initiateRollback(deployment) {
    console.log('Initiating automatic rollback')

    // Notify team
    await this.notify('Automatic rollback initiated', 'critical')

    // Execute rollback
    await this.executeRollback(deployment)

    // Verify rollback success
    await this.verifyRollback()
  }
}
```

**Database Rollback:**

```sql
-- Rollback procedure
BEGIN;
  -- Save current state
  CREATE TABLE rollback_snapshot AS
  SELECT * FROM affected_tables;

  -- Execute rollback migration
  SELECT migrate_down('20240101_feature_x');

  -- Verify data integrity
  SELECT verify_data_integrity();

  -- If successful
  COMMIT;

  -- If failed
  -- ROLLBACK;
```

**Infrastructure Rollback:**

```bash
#!/bin/bash
# Kubernetes rollback

# Rollback deployment
kubectl rollout undo deployment/pmp-app -n production

# Check rollback status
kubectl rollout status deployment/pmp-app -n production

# Verify pods are running old version
kubectl get pods -n production -o jsonpath='{.items[*].spec.containers[*].image}'

# Scale if needed
kubectl scale deployment/pmp-app --replicas=10 -n production

# Verify health
kubectl get pods -n production
kubectl logs -n production -l app=pmp-app --tail=100
```

**DNS Rollback:**

```javascript
// Route53 weighted routing rollback
const AWS = require('aws-sdk')
const route53 = new AWS.Route53()

async function rollbackDNS() {
  const params = {
    HostedZoneId: 'Z1234567890ABC',
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: 'api.pmplearning.com',
            Type: 'A',
            SetIdentifier: 'Blue',
            Weight: 100, // Route all traffic to blue
            AliasTarget: {
              HostedZoneId: 'Z0987654321XYZ',
              DNSName: 'blue-lb.amazonaws.com',
              EvaluateTargetHealth: true,
            },
          },
        },
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: 'api.pmplearning.com',
            Type: 'A',
            SetIdentifier: 'Green',
            Weight: 0, // No traffic to green
            AliasTarget: {
              HostedZoneId: 'Z0987654321XYZ',
              DNSName: 'green-lb.amazonaws.com',
              EvaluateTargetHealth: true,
            },
          },
        },
      ],
    },
  }

  return await route53.changeResourceRecordSets(params).promise()
}
```

```

## 📊 Deployment Metrics

```

Track and analyze deployment metrics:

**Key Deployment Indicators:**

```sql
-- Deployment frequency
SELECT
  DATE_TRUNC('week', deployed_at) as week,
  COUNT(*) as deployments,
  AVG(EXTRACT(EPOCH FROM (deployed_at - created_at))/3600) as avg_lead_time_hours,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
  SUM(CASE WHEN rollback = true THEN 1 ELSE 0 END) as rollbacks
FROM deployments
WHERE deployed_at > NOW() - INTERVAL '3 months'
GROUP BY week
ORDER BY week DESC;

-- Change failure rate
SELECT
  COUNT(CASE WHEN status = 'failed' OR rollback = true THEN 1 END)::float
  / COUNT(*)::float * 100 as change_failure_rate
FROM deployments
WHERE deployed_at > NOW() - INTERVAL '30 days';

-- Mean time to recovery
SELECT
  AVG(EXTRACT(EPOCH FROM (recovered_at - failed_at))/60) as mttr_minutes
FROM incidents
WHERE severity IN ('P0', 'P1')
  AND recovered_at IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days';
```

**Deployment Dashboard:**

```javascript
// Real-time deployment dashboard
class DeploymentDashboard {
  async getMetrics() {
    return {
      current: {
        version: process.env.APP_VERSION,
        deployedAt: process.env.DEPLOYED_AT,
        environment: process.env.NODE_ENV,
        health: await this.getHealth(),
      },

      performance: {
        responseTime: await this.getResponseTime(),
        throughput: await this.getThroughput(),
        errorRate: await this.getErrorRate(),
        availability: await this.getAvailability(),
      },

      dora: {
        deploymentFrequency: await this.getDeploymentFrequency(),
        leadTime: await this.getLeadTime(),
        changeFailureRate: await this.getChangeFailureRate(),
        mttr: await this.getMTTR(),
      },
    }
  }

  async getDeploymentFrequency() {
    const deployments = await db.query(`
      SELECT COUNT(*) as count
      FROM deployments
      WHERE deployed_at > NOW() - INTERVAL '7 days'
        AND environment = 'production'
    `)

    return deployments[0].count / 7 // Per day
  }
}
```

**Deployment Report Template:**

```markdown
## Deployment Report - v{version}

### Deployment Summary

- **Date**: {date}
- **Duration**: {duration}
- **Type**: {deployment_type}
- **Environment**: {environment}
- **Deployed By**: {user}

### Changes Included

- Features: {feature_count}
- Bug Fixes: {bugfix_count}
- Performance Improvements: {perf_count}
- Security Updates: {security_count}

### Validation Results

| Check             | Status | Details                      |
| ----------------- | ------ | ---------------------------- |
| Unit Tests        | ✅     | 100% passing                 |
| Integration Tests | ✅     | 98% passing                  |
| Smoke Tests       | ✅     | All critical paths verified  |
| Performance       | ⚠️     | 5% latency increase detected |
| Security          | ✅     | No vulnerabilities found     |

### Metrics Comparison

| Metric              | Before   | After    | Change |
| ------------------- | -------- | -------- | ------ |
| Response Time (p95) | 200ms    | 210ms    | +5%    |
| Error Rate          | 0.1%     | 0.1%     | 0%     |
| Throughput          | 1000 rps | 1000 rps | 0%     |
| CPU Usage           | 40%      | 42%      | +5%    |
| Memory Usage        | 60%      | 58%      | -3%    |

### Issues & Resolutions

- Issue: {description}
  - Resolution: {action_taken}
  - Time to resolve: {duration}

### Next Steps

1. Monitor performance regression
2. Prepare hotfix for issue X
3. Schedule post-deployment review

### Rollback Plan

- Trigger: {conditions}
- Procedure: {steps}
- Estimated time: {duration}
```

```

## 🔐 Security Deployment Checks

```

Verify security measures during deployment:

**Secret Rotation:**

```javascript
// Automated secret rotation during deployment
class SecretRotation {
  async rotateSecrets(deployment) {
    const secrets = ['JWT_SECRET', 'DATABASE_PASSWORD', 'API_KEYS', 'ENCRYPTION_KEY']

    for (const secret of secrets) {
      // Generate new secret
      const newValue = await this.generateSecret(secret)

      // Update in secret manager
      await this.updateSecret(secret, newValue)

      // Update application
      await this.updateApplication(deployment, secret, newValue)

      // Verify rotation
      await this.verifyRotation(secret)
    }

    // Grace period for old secrets
    setTimeout(() => this.revokeOldSecrets(), 24 * 60 * 60 * 1000)
  }

  async generateSecret(type) {
    switch (type) {
      case 'JWT_SECRET':
        return crypto.randomBytes(64).toString('hex')
      case 'DATABASE_PASSWORD':
        return this.generatePassword(32)
      case 'API_KEYS':
        return `sk_live_${crypto.randomBytes(32).toString('hex')}`
      default:
        return crypto.randomBytes(32).toString('hex')
    }
  }
}
```

**Certificate Validation:**

```bash
#!/bin/bash
# SSL certificate validation

DOMAINS=("pmplearning.com" "api.pmplearning.com" "www.pmplearning.com")

for domain in "${DOMAINS[@]}"; do
  echo "Checking $domain..."

  # Check certificate expiration
  expiry=$(echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null |
           openssl x509 -noout -enddate 2>/dev/null |
           cut -d= -f2)

  expiry_epoch=$(date -d "$expiry" +%s)
  current_epoch=$(date +%s)
  days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))

  if [ $days_left -lt 30 ]; then
    echo "WARNING: Certificate for $domain expires in $days_left days"
  else
    echo "✓ Certificate valid for $days_left days"
  fi

  # Verify certificate chain
  echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null |
         openssl verify
done
```

**Compliance Verification:**

```javascript
// Compliance checks during deployment
class ComplianceChecker {
  async verify() {
    const checks = {
      gdpr: await this.checkGDPR(),
      pci: await this.checkPCI(),
      accessibility: await this.checkAccessibility(),
      security: await this.checkSecurity(),
    }

    const failed = Object.entries(checks)
      .filter(([_, result]) => !result.passed)
      .map(([name, result]) => ({ name, issues: result.issues }))

    if (failed.length > 0) {
      throw new Error(`Compliance checks failed: ${JSON.stringify(failed)}`)
    }

    return checks
  }

  async checkGDPR() {
    return {
      passed: true,
      checks: [
        'Privacy policy updated',
        'Cookie consent implemented',
        'Data retention policies enforced',
        'Right to deletion available',
      ],
    }
  }
}
```

```

## 🎯 Environment-Specific Checklists

```

Environment-specific deployment procedures:

**Development Environment:**

````yaml
development:
  pre_deployment:
    - pull_latest_code
    - install_dependencies
    - run_migrations
    - seed_test_data

  deployment:
    - build_application
    - run_tests
    - start_services

  post_deployment:
    - verify_endpoints
    - check_logs
    - notify_team

**Staging Environment:**
```yaml
staging:
  pre_deployment:
    - backup_database
    - snapshot_infrastructure
    - notify_qa_team
    - feature_flags_setup

  deployment:
    - blue_green_switch
    - run_smoke_tests
    - performance_baseline

  post_deployment:
    - qa_validation
    - security_scan
    - load_testing
    - user_acceptance_testing

**Production Environment:**
```yaml
production:
  pre_deployment:
    - change_request_approval
    - maintenance_window_check
    - backup_everything
    - notify_stakeholders
    - scale_up_resources

  deployment:
    - canary_rollout:
        stages: [1%, 5%, 25%, 50%, 100%]
        duration_per_stage: "10m"
    - monitor_metrics
    - verify_sla

  post_deployment:
    - extended_monitoring: "24h"
    - performance_report
    - incident_readiness
    - documentation_update
    - scale_down_resources
````

**Disaster Recovery Testing:**

```bash
#!/bin/bash
# DR validation during deployment

echo "Testing disaster recovery procedures..."

# Backup validation
echo "Verifying backups..."
aws s3 ls s3://pmp-backups/production/ --recursive | tail -5

# Restore test
echo "Testing restore procedure..."
pg_restore --dbname=test_restore latest_backup.dump
if [ $? -eq 0 ]; then
  echo "✓ Backup restoration successful"
else
  echo "✗ Backup restoration failed"
  exit 1
fi

# Failover test (dry run)
echo "Testing failover capability..."
aws rds describe-db-instances --db-instance-identifier pmp-production | \
  jq '.DBInstances[0].ReadReplicaDBInstanceIdentifiers'

echo "DR validation complete"
```

```

---

**Usage Notes:**
- Always follow the checklist sequentially
- Document any deviations from standard procedure
- Maintain deployment runbooks up-to-date
- Conduct post-deployment reviews
- Automate repetitive checks
- Keep rollback procedures tested and ready

**Integration Points:**
- Incident response: `incident-analysis.md`
- Monitoring setup: `monitoring-observability.md`
- Performance validation: `performance-optimization.md`
- Security checks: `security-audit.md`
- Infrastructure: `infrastructure-as-code.md`

**Success Metrics:**
- Deployment success rate > 95%
- Zero-downtime deployments: 100%
- Rollback time < 5 minutes
- Mean lead time < 1 day
- Deployment frequency > 1/day
```
