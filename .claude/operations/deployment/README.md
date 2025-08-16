# Deployment Management

## Overview

The deployment directory contains all deployment configurations, scripts, and environment-specific settings for the PMPLearningManagement platform. Our deployment strategy emphasizes zero-downtime deployments, infrastructure as code, and progressive rollouts.

## Directory Structure

```
deployment/
├── environments/        # Environment-specific configurations
│   ├── development/    # Development environment
│   ├── staging/        # Staging environment
│   ├── production/     # Production environment
│   └── disaster-recovery/ # DR environment
├── configurations/     # Application configurations
│   ├── app-config/     # Application settings
│   ├── nginx/          # Web server configs
│   └── database/       # Database configs
├── secrets/            # Encrypted secrets management
│   ├── vault/          # HashiCorp Vault configs
│   └── kms/            # AWS KMS configs
├── scripts/            # Deployment scripts
│   ├── deploy.sh       # Main deployment script
│   ├── rollback.sh     # Rollback procedures
│   └── health-check.sh # Post-deployment verification
└── manifests/          # Kubernetes manifests
    ├── base/           # Base configurations
    └── overlays/       # Environment overlays
```

## Deployment Strategies

### 1. Blue-Green Deployment

```yaml
# deployment/strategies/blue-green.yml
strategy:
  type: blue-green
  settings:
    # Current live environment
    active: blue

    # Staging environment
    staging: green

    # Traffic routing
    routing:
      type: instant # instant or gradual
      warmup_time: 5m

    # Health checks
    health_check:
      endpoint: /health
      interval: 10s
      timeout: 5s
      success_threshold: 3
      failure_threshold: 2

    # Rollback triggers
    rollback:
      auto_rollback: true
      error_rate_threshold: 5%
      response_time_threshold: 2s
```

### 2. Canary Deployment

```yaml
# deployment/strategies/canary.yml
strategy:
  type: canary
  settings:
    # Traffic split progression
    stages:
      - weight: 5
        duration: 10m
        metrics_check: true
      - weight: 25
        duration: 30m
        metrics_check: true
      - weight: 50
        duration: 1h
        metrics_check: true
      - weight: 100

    # Success criteria
    success_criteria:
      error_rate: '< 1%'
      p95_latency: '< 500ms'
      cpu_usage: '< 70%'
      memory_usage: '< 80%'

    # Analysis
    analysis:
      provider: prometheus
      interval: 1m
      lookback: 5m
```

### 3. Rolling Update

```yaml
# deployment/strategies/rolling.yml
strategy:
  type: rolling
  settings:
    max_surge: 25%
    max_unavailable: 0

    update_strategy:
      batch_size: 2
      pause_between_batches: 30s

    readiness_probe:
      http_get:
        path: /ready
        port: 3000
      initial_delay: 10s
      period: 5s

    liveness_probe:
      http_get:
        path: /health
        port: 3000
      initial_delay: 30s
      period: 10s
```

## Environment Configurations

### Development Environment

```bash
# environments/development/.env
NODE_ENV=development
API_URL=http://localhost:3000
DATABASE_URL=postgresql://dev:dev@localhost:5432/pmp_dev
REDIS_URL=redis://localhost:6379/0
LOG_LEVEL=debug
ENABLE_DEBUG=true
ENABLE_PROFILING=true
```

### Staging Environment

```bash
# environments/staging/.env
NODE_ENV=staging
API_URL=https://staging-api.pmplearning.com
DATABASE_URL=$STAGING_DB_CONNECTION_STRING
REDIS_URL=$STAGING_REDIS_URL
LOG_LEVEL=info
ENABLE_MONITORING=true
ENABLE_ANALYTICS=true
FEATURE_FLAGS_URL=https://flags.pmplearning.com
```

### Production Environment

```bash
# environments/production/.env
NODE_ENV=production
API_URL=https://api.pmplearning.com
DATABASE_URL=$PROD_DB_CONNECTION_STRING
REDIS_URL=$PROD_REDIS_CLUSTER
LOG_LEVEL=warn
ENABLE_MONITORING=true
ENABLE_ANALYTICS=true
ENABLE_RATE_LIMITING=true
CDN_URL=https://cdn.pmplearning.com
```

## Deployment Scripts

### Main Deployment Script

```bash
#!/bin/bash
# deployment/scripts/deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
STRATEGY=${3:-rolling}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check environment
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        exit 1
    fi

    # Check version
    if [ "$VERSION" == "latest" ]; then
        VERSION=$(git describe --tags --abbrev=0)
        log_info "Using version: $VERSION"
    fi

    # Verify image exists
    docker pull "pmplearning/app:$VERSION" || {
        log_error "Docker image not found: pmplearning/app:$VERSION"
        exit 1
    }

    # Check database migrations
    log_info "Checking database migrations..."
    npm run migrate:status -- --env=$ENVIRONMENT

    # Backup current deployment
    log_info "Creating backup..."
    ./scripts/backup.sh $ENVIRONMENT
}

# Deploy application
deploy_application() {
    log_info "Deploying to $ENVIRONMENT using $STRATEGY strategy..."

    case $STRATEGY in
        blue-green)
            deploy_blue_green
            ;;
        canary)
            deploy_canary
            ;;
        rolling)
            deploy_rolling
            ;;
        *)
            log_error "Unknown deployment strategy: $STRATEGY"
            exit 1
            ;;
    esac
}

# Blue-Green deployment
deploy_blue_green() {
    log_info "Starting Blue-Green deployment..."

    # Determine inactive environment
    ACTIVE=$(kubectl get service app-service -o jsonpath='{.spec.selector.deployment}')
    INACTIVE=$([[ "$ACTIVE" == "blue" ]] && echo "green" || echo "blue")

    log_info "Active: $ACTIVE, Deploying to: $INACTIVE"

    # Deploy to inactive environment
    kubectl set image deployment/app-$INACTIVE app=pmplearning/app:$VERSION

    # Wait for rollout
    kubectl rollout status deployment/app-$INACTIVE

    # Run smoke tests
    log_info "Running smoke tests..."
    npm run test:smoke -- --url=http://app-$INACTIVE-service

    # Switch traffic
    log_info "Switching traffic to $INACTIVE..."
    kubectl patch service app-service -p '{"spec":{"selector":{"deployment":"'$INACTIVE'"}}}'

    # Monitor for 5 minutes
    log_info "Monitoring deployment..."
    sleep 300

    # Check metrics
    check_deployment_metrics || {
        log_error "Metrics check failed, rolling back..."
        kubectl patch service app-service -p '{"spec":{"selector":{"deployment":"'$ACTIVE'"}}}'
        exit 1
    }

    log_info "Blue-Green deployment successful!"
}

# Canary deployment
deploy_canary() {
    log_info "Starting Canary deployment..."

    # Deploy canary version
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pmplearning
      version: canary
  template:
    metadata:
      labels:
        app: pmplearning
        version: canary
    spec:
      containers:
      - name: app
        image: pmplearning/app:$VERSION
EOF

    # Progressive traffic shift
    for WEIGHT in 5 25 50 100; do
        log_info "Shifting $WEIGHT% traffic to canary..."

        kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: app-routing
spec:
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: app-service
        subset: stable
      weight: $((100 - WEIGHT))
    - destination:
        host: app-service
        subset: canary
      weight: $WEIGHT
EOF

        # Monitor metrics
        sleep 600  # 10 minutes

        check_deployment_metrics || {
            log_error "Canary metrics check failed at $WEIGHT%"
            rollback_canary
            exit 1
        }
    done

    # Promote canary to stable
    kubectl set image deployment/app-stable app=pmplearning/app:$VERSION
    kubectl delete deployment app-canary

    log_info "Canary deployment successful!"
}

# Rolling deployment
deploy_rolling() {
    log_info "Starting Rolling deployment..."

    # Update deployment
    kubectl set image deployment/app app=pmplearning/app:$VERSION

    # Monitor rollout
    kubectl rollout status deployment/app

    # Verify deployment
    READY=$(kubectl get deployment app -o jsonpath='{.status.readyReplicas}')
    DESIRED=$(kubectl get deployment app -o jsonpath='{.spec.replicas}')

    if [ "$READY" != "$DESIRED" ]; then
        log_error "Deployment failed: $READY/$DESIRED replicas ready"
        kubectl rollout undo deployment/app
        exit 1
    fi

    log_info "Rolling deployment successful!"
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."

    # Health checks
    ./scripts/health-check.sh $ENVIRONMENT

    # Smoke tests
    npm run test:smoke -- --env=$ENVIRONMENT

    # Performance tests
    npm run test:performance -- --env=$ENVIRONMENT --threshold

    # Security scan
    npm run security:scan -- --env=$ENVIRONMENT
}

# Check deployment metrics
check_deployment_metrics() {
    log_info "Checking deployment metrics..."

    # Query Prometheus for key metrics
    ERROR_RATE=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" | jq '.data.result[0].value[1]' | tr -d '"')
    RESPONSE_TIME=$(curl -s "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,http_request_duration_seconds_bucket)" | jq '.data.result[0].value[1]' | tr -d '"')

    # Check thresholds
    if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
        log_error "Error rate too high: $ERROR_RATE"
        return 1
    fi

    if (( $(echo "$RESPONSE_TIME > 2" | bc -l) )); then
        log_error "Response time too high: $RESPONSE_TIME"
        return 1
    fi

    log_info "Metrics check passed"
    return 0
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    log_info "Strategy: $STRATEGY"

    pre_deployment_checks
    deploy_application
    post_deployment_verification

    log_info "Deployment completed successfully!"

    # Send notification
    ./scripts/notify.sh "Deployment successful" \
        "Environment: $ENVIRONMENT\nVersion: $VERSION\nStrategy: $STRATEGY"
}

# Run main function
main
```

### Rollback Script

```bash
#!/bin/bash
# deployment/scripts/rollback.sh

set -e

ENVIRONMENT=${1:-staging}
ROLLBACK_TO=${2:-previous}

log_info() {
    echo "[INFO] $1"
}

log_error() {
    echo "[ERROR] $1"
}

# Perform rollback
perform_rollback() {
    log_info "Starting rollback for $ENVIRONMENT..."

    if [ "$ROLLBACK_TO" == "previous" ]; then
        # Rollback to previous version
        kubectl rollout undo deployment/app
    else
        # Rollback to specific version
        kubectl rollout undo deployment/app --to-revision=$ROLLBACK_TO
    fi

    # Wait for rollback to complete
    kubectl rollout status deployment/app

    # Verify rollback
    ./scripts/health-check.sh $ENVIRONMENT

    log_info "Rollback completed successfully"
}

# Create incident report
create_incident_report() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    REPORT_FILE="incidents/rollback_${ENVIRONMENT}_${TIMESTAMP}.md"

    cat > $REPORT_FILE <<EOF
# Rollback Incident Report

**Date**: $(date)
**Environment**: $ENVIRONMENT
**Rollback To**: $ROLLBACK_TO

## Reason for Rollback
[To be filled]

## Impact
[To be filled]

## Timeline
- Rollback initiated: $(date)
- Rollback completed: [To be filled]

## Lessons Learned
[To be filled]
EOF

    log_info "Incident report created: $REPORT_FILE"
}

# Main execution
perform_rollback
create_incident_report
```

## Kubernetes Manifests

### Base Deployment

```yaml
# manifests/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pmp-learning-app
  labels:
    app: pmp-learning
    component: frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: pmp-learning
      component: frontend
  template:
    metadata:
      labels:
        app: pmp-learning
        component: frontend
      annotations:
        prometheus.io/scrape: 'true'
        prometheus.io/port: '9090'
        prometheus.io/path: '/metrics'
    spec:
      containers:
        - name: app
          image: pmplearning/app:latest
          ports:
            - containerPort: 3000
              name: http
            - containerPort: 9090
              name: metrics
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: node_env
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database_url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: app-config
```

### Service Configuration

```yaml
# manifests/base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: pmp-learning-service
  labels:
    app: pmp-learning
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
    - port: 9090
      targetPort: 9090
      protocol: TCP
      name: metrics
  selector:
    app: pmp-learning
    component: frontend
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

## Secret Management

### HashiCorp Vault Integration

```yaml
# secrets/vault/config.yml
vault:
  address: https://vault.pmplearning.com
  namespace: production

  auth:
    method: kubernetes
    role: pmp-learning-app

  secrets:
    database:
      path: secret/data/database
      keys:
        - connection_string
        - username
        - password

    api:
      path: secret/data/api
      keys:
        - jwt_secret
        - api_key
        - oauth_client_secret

  policies:
    - name: pmp-learning-read
      rules: |
        path "secret/data/*" {
          capabilities = ["read", "list"]
        }
```

### AWS KMS Configuration

```yaml
# secrets/kms/config.yml
kms:
  region: us-east-1

  keys:
    - alias: pmp-learning-prod
      description: Production encryption key
      key_policy:
        Version: '2012-10-17'
        Statement:
          - Sid: Enable IAM policies
            Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: 'kms:*'
            Resource: '*'

  secrets_manager:
    secrets:
      - name: pmp-learning/prod/database
        kms_key: pmp-learning-prod
        rotation:
          enabled: true
          lambda: rotate-db-password
          days: 30
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/terraform/main.tf

terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "pmp-learning-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-state-lock"
  }
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  cluster_name    = "pmp-learning-${var.environment}"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 2

      instance_types = ["t3.medium"]

      k8s_labels = {
        Environment = var.environment
        Application = "pmp-learning"
      }
    }
  }
}

# RDS Database
module "rds" {
  source = "./modules/rds"

  identifier = "pmp-learning-${var.environment}"

  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.environment == "production" ? "db.r6g.large" : "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 1000

  db_name  = "pmplearning"
  username = "admin"

  vpc_security_group_ids = [module.security_group.rds_sg_id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = var.environment == "production"
}
```

## Monitoring & Alerts

### Deployment Monitoring

```yaml
# monitoring/deployment-alerts.yml
alerts:
  - name: DeploymentFailed
    condition: |
      kube_deployment_status_replicas_unavailable{deployment="pmp-learning-app"} > 0
    for: 5m
    severity: critical
    annotations:
      summary: 'Deployment has unavailable replicas'
      description: '{{ $value }} replicas are unavailable'

  - name: HighRollbackRate
    condition: |
      rate(deployment_rollback_total[1h]) > 0.1
    severity: warning
    annotations:
      summary: 'High rollback rate detected'
      description: 'Rollback rate is {{ $value }} per hour'

  - name: SlowDeployment
    condition: |
      deployment_duration_seconds > 600
    severity: warning
    annotations:
      summary: 'Deployment taking too long'
      description: 'Deployment duration is {{ $value }} seconds'
```

## Best Practices

### 1. Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security scan completed
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] Rollback plan documented
- [ ] Team notification sent
- [ ] Monitoring alerts configured
- [ ] Load testing completed

### 2. Deployment Windows

```yaml
Deployment Schedule:
  Production:
    - Tuesday: 10:00 AM - 12:00 PM UTC
    - Thursday: 10:00 AM - 12:00 PM UTC
    - Emergency: Requires approval

  Staging:
    - Daily: 2:00 PM UTC (automated)

  Development:
    - Continuous deployment on merge to main
```

### 3. Rollback Criteria

- Error rate > 5%
- P95 latency > 2 seconds
- CPU usage > 90%
- Memory usage > 95%
- Failed health checks
- Customer complaints

## Troubleshooting

### Common Issues

#### 1. Deployment Stuck

```bash
# Check pod status
kubectl get pods -l app=pmp-learning

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check logs
kubectl logs -l app=pmp-learning --tail=100

# Force rollback if needed
kubectl rollout undo deployment/pmp-learning-app
```

#### 2. Database Migration Failed

```bash
# Check migration status
npm run migrate:status

# Rollback migration
npm run migrate:rollback

# Run migration manually
npm run migrate:up -- --env=production
```

#### 3. Service Unavailable

```bash
# Check service endpoints
kubectl get endpoints

# Check ingress
kubectl get ingress

# Test connectivity
kubectl run debug --image=alpine/curl --rm -it -- sh
curl http://pmp-learning-service
```

## Disaster Recovery

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * /scripts/backup.sh production

# Backup includes:
- Database dumps
- Application state
- Configuration files
- Persistent volumes
- Secrets (encrypted)
```

### Recovery Procedures

1. **Data Recovery**: Restore from latest backup
2. **Service Recovery**: Deploy to DR region
3. **DNS Failover**: Update Route53 records
4. **Verification**: Run comprehensive tests
5. **Communication**: Notify stakeholders

## References

- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Canary Deployments](https://martinfowler.com/bliki/CanaryRelease.html)
- [GitOps Principles](https://www.gitops.tech/)

---

**Last Updated**: 2025-08-15  
**Version**: 2.0.0  
**Owner**: DevOps Team
