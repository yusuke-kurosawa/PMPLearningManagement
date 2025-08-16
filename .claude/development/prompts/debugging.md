# Debugging Prompts - Systematic Troubleshooting Guide

## 🔍 Quick Debug Analysis

```
Analyze this error and provide a systematic debugging approach:

**Error Context:**
- Environment: {development/staging/production}
- Service: {service name}
- Error Message: {error details}
- Stack Trace: {if available}
- Recent Changes: {recent deployments or changes}

**Required Output:**
1. Root cause hypothesis (ranked by probability)
2. Immediate mitigation steps
3. Debugging commands to run
4. Data to collect
5. Long-term fix recommendations

**Success Criteria:**
- Issue identified within 15 minutes
- No data loss during debugging
- Minimal service disruption
```

## 🐛 Production Issue Debugging

```
Debug a production issue with the following symptoms:

**Issue Details:**
- Alert: {alert name and details}
- Impact: {user impact percentage}
- Duration: {how long has it been happening}
- Affected Components: {list of services}
- Current Metrics:
  - Error Rate: {percentage}
  - Latency: {p50, p95, p99}
  - Traffic: {requests per second}

**Constraints:**
- Cannot take service offline
- Must preserve audit trail
- Rollback available: {yes/no}
- Last known good deployment: {timestamp}

**Provide:**
1. Triage priority (P0-P4)
2. Incident commander checklist
3. Communication template for stakeholders
4. Debug script with safety checks
5. Rollback decision matrix
```

## 🔬 Performance Degradation Debugging

```
Investigate performance degradation in PMPLearningManagement:

**Symptoms:**
- Response time increased from {X}ms to {Y}ms
- Specific endpoints affected: {list}
- Time pattern: {continuous/periodic/random}
- Infrastructure metrics:
  - CPU: {usage}
  - Memory: {usage}
  - Disk I/O: {metrics}
  - Network: {latency/throughput}

**Available Tools:**
- APM: {DataDog/NewRelic/AppDynamics}
- Profiler: {available profilers}
- Logs: {log aggregation system}
- Traces: {distributed tracing}

**Analysis Framework:**
1. Bottleneck identification
2. Resource contention analysis
3. Query performance review
4. Cache effectiveness
5. External dependency impact

**Expected Deliverables:**
- Performance flame graph
- Optimization recommendations (ranked by impact)
- Implementation plan with risk assessment
```

## 🔎 Memory Leak Investigation

````
Diagnose and fix a suspected memory leak:

**Observations:**
- Memory growth rate: {MB/hour}
- Service uptime before OOM: {hours}
- Restart frequency: {per day}
- Heap dump available: {yes/no}

**Environment Details:**
- Runtime: Node.js {version}
- Framework: React {version}
- Key libraries: {list major dependencies}

**Investigation Steps:**
1. Heap analysis commands
2. Memory profiling setup
3. Leak detection methodology
4. Common leak patterns to check
5. Fix verification process

**Output Format:**
```javascript
// Memory Leak Report
{
  "leak_source": "identified source",
  "impact_severity": "critical|high|medium|low",
  "memory_retained": "size in MB",
  "fix_complexity": "simple|moderate|complex",
  "recommended_fix": "detailed solution",
  "verification_method": "how to verify fix"
}
````

```

## 🚨 Database Debugging

```

Debug database performance issues:

**Problem Statement:**

- Query slowdown: {specific queries or general}
- Lock contention: {yes/no}
- Connection pool exhaustion: {yes/no}
- Replication lag: {seconds}

**Database Info:**

- Type: PostgreSQL {version}
- Size: {database size}
- Connections: {current/max}
- Key metrics:
  - QPS: {queries per second}
  - Slow queries: {count}
  - Deadlocks: {frequency}

**Diagnostic Queries:**

```sql
-- Provide these diagnostic queries:
1. Current running queries
2. Lock analysis
3. Index usage statistics
4. Table bloat analysis
5. Query execution plans
```

**Resolution Path:**

1. Immediate actions (kill queries, increase connections)
2. Short-term fixes (index creation, query optimization)
3. Long-term solutions (sharding, read replicas)

```

## 🔗 API Integration Debugging

```

Debug third-party API integration issues:

**Integration Details:**

- API: {service name}
- Endpoint: {URL}
- Authentication: {method}
- Error Pattern: {intermittent/consistent}
- Error Codes: {list of error codes}

**Current Behavior:**

- Success rate: {percentage}
- Average latency: {ms}
- Timeout frequency: {rate}
- Retry logic: {implemented/not implemented}

**Debug Checklist:**
□ Network connectivity test
□ DNS resolution check
□ SSL certificate validation
□ Authentication token validity
□ Rate limit verification
□ Request/response payload validation
□ Timeout configuration review
□ Retry mechanism effectiveness

**Provide:**

1. curl commands for manual testing
2. Network diagnostic tools usage
3. Monitoring setup for API health
4. Circuit breaker implementation
5. Fallback strategy

```

## 🎯 Frontend Debugging

```

Debug React application issues in PMPLearningManagement:

**Issue Type:**

- [ ] Rendering problems
- [ ] State management issues
- [ ] Performance degradation
- [ ] Memory leaks
- [ ] Event handler problems
- [ ] Routing issues

**Browser Details:**

- Browser: {Chrome/Firefox/Safari/Edge}
- Version: {version}
- Console errors: {paste errors}
- Network errors: {paste errors}

**React DevTools Data:**

- Component tree anomalies
- Excessive re-renders
- State inconsistencies
- Props drilling issues

**Debug Strategy:**

1. React DevTools Profiler analysis
2. Component lifecycle debugging
3. State flow tracing
4. Performance recording
5. Memory snapshot comparison

**Code Instrumentation:**

```javascript
// Add these debug helpers
console.time('ComponentRender')
console.log('State:', currentState)
console.log('Props:', props)
performance.mark('feature-start')
```

```

## 🔐 Authentication/Authorization Debugging

```

Debug authentication and authorization issues:

**Issue Description:**

- Auth method: JWT/OAuth/SAML
- Failure point: {login/token refresh/authorization}
- Error message: {exact error}
- Affected users: {specific/all/pattern}

**Token Analysis:**

- Token type: {access/refresh/id}
- Expiration: {timestamp}
- Claims: {relevant claims}
- Signature valid: {yes/no}

**Debug Flow:**

1. Token generation verification
2. Token validation logic review
3. Permission checking trace
4. Session management audit
5. CORS configuration check

**Security Considerations:**

- Log sanitization requirements
- PII handling during debug
- Audit trail maintenance
- Compliance requirements

```

## 🐳 Container Debugging

```

Debug containerized application issues:

**Container Environment:**

- Orchestrator: Kubernetes {version}
- Container runtime: Docker {version}
- Pod status: {Running/CrashLoopBackOff/Error}
- Restart count: {number}

**Symptoms:**

- Exit code: {code}
- Last logs: {tail of logs}
- Resource limits: CPU {limit}, Memory {limit}
- Resource usage: CPU {usage}, Memory {usage}

**Debugging Commands:**

```bash
# Provide these commands
kubectl describe pod {pod-name}
kubectl logs {pod-name} --previous
kubectl exec -it {pod-name} -- /bin/sh
kubectl top pod {pod-name}
kubectl get events --sort-by='.lastTimestamp'
```

**Investigation Areas:**

1. Container startup issues
2. Resource constraints
3. Network policies
4. Volume mount problems
5. Environment variable configuration
6. Health check failures

```

## 📊 Metrics-Driven Debugging

```

Use metrics to identify and debug issues:

**Available Metrics:**

- Business metrics: {conversion rate, user activity}
- Application metrics: {response time, error rate}
- Infrastructure metrics: {CPU, memory, disk, network}
- Custom metrics: {specific to application}

**Anomaly Detection:**

- Baseline period: {last 7 days}
- Deviation threshold: {2 standard deviations}
- Correlation analysis: {metrics that changed together}

**Analysis Queries:**

```promql
# Prometheus queries for investigation
rate(http_requests_total[5m])
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
rate(errors_total[5m]) / rate(requests_total[5m])
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600)
```

**Correlation Matrix:**

- Build correlation between:
  - Deploy events and error rates
  - Traffic patterns and latency
  - Database load and application performance

```

## 🔄 Distributed System Debugging

```

Debug issues in distributed microservices:

**System Topology:**

- Services involved: {list services}
- Communication pattern: {sync/async}
- Message queue: {RabbitMQ/Kafka/SQS}
- Service mesh: {Istio/Linkerd/none}

**Distributed Tracing:**

- Trace ID: {correlation ID}
- Span analysis: {critical path}
- Service latencies: {breakdown}
- Error propagation: {error source}

**Debug Approach:**

1. Trace collection and analysis
2. Service dependency mapping
3. Timeout and retry analysis
4. Circuit breaker status review
5. Message queue inspection
6. Distributed transaction verification

**Observability Stack:**

- Tracing: Jaeger/Zipkin
- Metrics: Prometheus/DataDog
- Logs: ELK/Splunk
- Correlation: Trace ID injection

```

## 💾 Cache Debugging

```

Debug caching layer issues:

**Cache System:**

- Type: Redis/Memcached/CDN
- Hit rate: {percentage}
- Miss rate: {percentage}
- Eviction rate: {rate}

**Problem Symptoms:**

- [ ] Low hit rate
- [ ] Cache stampede
- [ ] Stale data
- [ ] Memory pressure
- [ ] Connection pool exhaustion

**Analysis Commands:**

```redis
INFO stats
INFO memory
SLOWLOG GET 10
CLIENT LIST
MONITOR  # Use carefully in production
```

**Cache Strategy Review:**

1. TTL configuration audit
2. Invalidation logic verification
3. Warm-up strategy assessment
4. Key naming convention check
5. Serialization overhead analysis

```

## 🚀 Deployment Debugging

```

Debug failed or problematic deployments:

**Deployment Info:**

- Type: Blue-green/Canary/Rolling
- Version: {from version} → {to version}
- Rollout percentage: {if canary}
- Affected regions: {list}

**Failure Indicators:**

- Health checks: {passing/failing}
- Smoke tests: {results}
- Error rate change: {before/after}
- Performance impact: {metrics}

**Rollback Decision Tree:**

```yaml
if error_rate > 5%: immediate_rollback()
elif latency_increase > 50%: investigate_then_decide()
elif memory_usage > 90%: scale_then_monitor()
else: continue_monitoring()
```

**Post-Deployment Verification:**

1. Feature flag verification
2. Database migration status
3. Configuration drift detection
4. Dependency version conflicts
5. SSL certificate validation

```

## 🧪 Test Failure Debugging

```

Debug failing tests in CI/CD pipeline:

**Test Failure Context:**

- Test type: Unit/Integration/E2E
- Failure rate: {percentage}
- Flakiness: {intermittent/consistent}
- Environment: CI/Local
- Recent changes: {commits}

**Failure Analysis:**

```javascript
// Test failure pattern
{
  "test_name": "specific test",
  "failure_type": "assertion/timeout/error",
  "error_message": "detailed error",
  "stack_trace": "full trace",
  "related_tests": ["test1", "test2"],
  "environmental_factors": {
    "timing_sensitive": true,
    "order_dependent": false,
    "resource_intensive": true
  }
}
```

**Debug Strategy:**

1. Test isolation execution
2. Seed data verification
3. Mock/stub inspection
4. Timing and race condition analysis
5. Environment parity check

**Fix Validation:**

- Run test 100 times locally
- Verify in CI environment
- Check test execution time
- Review test dependencies

```

## 📝 Debug Documentation Template

```

Create debug documentation for resolved issues:

## Issue Title: {descriptive title}

### Summary

- **Date**: {when it occurred}
- **Duration**: {how long to resolve}
- **Impact**: {user/business impact}
- **Severity**: P0/P1/P2/P3

### Root Cause

{detailed explanation of what caused the issue}

### Timeline

- **HH:MM** - Issue detected by {monitoring/user report}
- **HH:MM** - Investigation started
- **HH:MM** - Root cause identified
- **HH:MM** - Fix deployed
- **HH:MM** - Issue resolved

### Debug Process

1. Initial hypothesis: {what we thought}
2. Investigation steps: {what we did}
3. Key findings: {what we discovered}
4. Solution: {how we fixed it}

### Lessons Learned

- What went well
- What could be improved
- Action items for prevention

### Monitoring Improvements

- New alerts added
- Metrics enhanced
- Runbook updates

### Code Changes

- PRs: {link to pull requests}
- Configuration changes: {what was modified}

```

## 🔮 Predictive Debugging

```

Implement predictive debugging based on patterns:

**Historical Issues Database:**

- Error signature → Known solution mapping
- Symptom patterns → Likely causes
- Performance degradation → Common culprits

**Pattern Matching:**

```python
def predict_issue_cause(symptoms):
    patterns = {
        "high_memory_low_cpu": "Memory leak likely",
        "spike_after_deploy": "Check recent changes",
        "gradual_degradation": "Resource exhaustion",
        "periodic_issues": "Scheduled job interference"
    }
    return match_pattern(symptoms, patterns)
```

**Proactive Monitoring:**

1. Anomaly detection thresholds
2. Trend analysis alerts
3. Capacity planning warnings
4. Dependency health checks
5. Error rate predictions

**ML-Assisted Debugging:**

- Log pattern clustering
- Anomaly scoring
- Root cause probability ranking
- Suggested fix recommendations

```

---

**Usage Notes:**
- Always start with the simplest hypothesis
- Preserve evidence before making changes
- Document every step for knowledge sharing
- Consider business impact in prioritization
- Maintain security and compliance during debugging
- Use staging environment when possible
- Implement fixes incrementally with validation

**Integration Points:**
- Links to runbooks in `.claude/operations/runbooks/`
- References to monitoring setup in `monitoring-observability.md`
- Incident response procedures in `incident-analysis.md`
- Deployment rollback procedures in `deployment-checklist.md`

**Success Metrics:**
- Mean Time To Detect (MTTD) < 5 minutes
- Mean Time To Resolve (MTTR) < 30 minutes
- Debug documentation completion rate: 100%
- Pattern recognition accuracy > 80%
- First-touch resolution rate > 60%
```
