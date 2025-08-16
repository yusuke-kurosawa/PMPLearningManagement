# Infrastructure Management

## Overview

The infrastructure directory contains Infrastructure as Code (IaC) definitions, container configurations, and orchestration templates for the PMPLearningManagement platform. We follow the principle of "everything as code" to ensure reproducibility, scalability, and maintainability.

## Directory Structure

```
infrastructure/
├── terraform/          # Terraform IaC definitions
│   ├── modules/        # Reusable Terraform modules
│   ├── environments/   # Environment-specific configs
│   └── providers/      # Provider configurations
├── docker/             # Docker configurations
│   ├── images/         # Dockerfile definitions
│   ├── compose/        # Docker Compose files
│   └── registry/       # Private registry configs
├── kubernetes/         # Kubernetes manifests
│   ├── base/           # Base configurations
│   ├── overlays/       # Kustomize overlays
│   └── helm/           # Helm charts
├── ansible/            # Ansible playbooks
│   ├── playbooks/      # Configuration playbooks
│   ├── roles/          # Ansible roles
│   └── inventory/      # Host inventories
└── cloudformation/     # AWS CloudFormation templates
    ├── stacks/         # Stack definitions
    └── nested/         # Nested templates
```

## Terraform Infrastructure

### Module Structure

```hcl
# terraform/modules/networking/main.tf

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.project_name}-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-vpc"
      Environment = var.environment
    }
  )
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-alb-sg"
    }
  )
}
```

### EKS Cluster Configuration

```hcl
# terraform/modules/eks/main.tf

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = var.kubernetes_version

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  # Cluster access
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = var.allowed_cidr_blocks

  # Cluster addons
  cluster_addons = {
    coredns = {
      resolve_conflicts = "OVERWRITE"
    }
    kube-proxy = {}
    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
    }
    aws-ebs-csi-driver = {
      resolve_conflicts = "OVERWRITE"
    }
  }

  # Node groups
  eks_managed_node_groups = {
    main = {
      name = "${var.project_name}-${var.environment}-main"

      instance_types = var.instance_types

      min_size     = var.min_size
      max_size     = var.max_size
      desired_size = var.desired_size

      disk_size = 50
      disk_type = "gp3"

      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }

      taints = []

      update_config = {
        max_unavailable_percentage = 50
      }
    }

    spot = {
      name = "${var.project_name}-${var.environment}-spot"

      capacity_type  = "SPOT"
      instance_types = var.spot_instance_types

      min_size     = 0
      max_size     = 10
      desired_size = 2

      labels = {
        Environment = var.environment
        NodeGroup   = "spot"
        CapacityType = "SPOT"
      }

      taints = [
        {
          key    = "spot"
          value  = "true"
          effect = "NoSchedule"
        }
      ]
    }
  }

  # IRSA
  enable_irpsa = true

  # Security
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  tags = var.common_tags
}
```

### RDS Database

```hcl
# terraform/modules/rds/main.tf

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "${var.project_name}-${var.environment}-db"

  # Engine
  engine               = "postgres"
  engine_version       = var.postgres_version
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = var.instance_class

  # Storage
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_encrypted     = true
  storage_type          = "gp3"
  iops                  = var.iops
  storage_throughput    = var.storage_throughput

  # Database
  db_name  = var.database_name
  username = var.master_username
  port     = 5432

  # Multi-AZ
  multi_az = var.environment == "production" ? true : false

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.database.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  skip_final_snapshot    = var.environment != "production"
  deletion_protection    = var.environment == "production"

  # Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_enhanced_monitoring.arn

  # Parameters
  parameters = [
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    },
    {
      name  = "log_statement"
      value = "all"
    }
  ]

  tags = var.common_tags
}

# Read replicas for production
resource "aws_db_instance" "read_replica" {
  count = var.environment == "production" ? var.read_replica_count : 0

  identifier     = "${var.project_name}-${var.environment}-db-replica-${count.index + 1}"
  replicate_source_db = module.rds.db_instance_id

  instance_class = var.read_replica_instance_class

  # Different AZ for HA
  availability_zone = data.aws_availability_zones.available.names[count.index % length(data.aws_availability_zones.available.names)]

  # Performance Insights
  performance_insights_enabled = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-db-replica-${count.index + 1}"
      Type = "ReadReplica"
    }
  )
}
```

## Docker Configurations

### Multi-stage Dockerfile

```dockerfile
# docker/images/app/Dockerfile

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NODE_ENV production
RUN npm run build && \
    npm prune --production

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV production
ENV PORT 3000

# Start application
CMD ["node", "dist/server.js"]
```

### Docker Compose for Development

```yaml
# docker/compose/development.yml
version: '3.9'

services:
  app:
    build:
      context: ../..
      dockerfile: docker/images/app/Dockerfile
      target: builder
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@db:5432/pmplearning
      REDIS_URL: redis://redis:6379
    volumes:
      - ../../src:/app/src
      - ../../public:/app/public
      - node_modules:/app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pmp-network

  db:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pmplearning
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../../scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pmp-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pmp-network

  adminer:
    image: adminer
    ports:
      - '8080:8080'
    environment:
      ADMINER_DEFAULT_SERVER: db
    networks:
      - pmp-network

volumes:
  postgres_data:
  redis_data:
  node_modules:

networks:
  pmp-network:
    driver: bridge
```

## Kubernetes Configurations

### Application Deployment

```yaml
# kubernetes/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pmp-learning-app
  labels:
    app: pmp-learning
    component: frontend
    version: v1
spec:
  replicas: 3
  revisionHistoryLimit: 10
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
        version: v1
      annotations:
        prometheus.io/scrape: 'true'
        prometheus.io/port: '9090'
        prometheus.io/path: '/metrics'
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - pmp-learning
                topologyKey: kubernetes.io/hostname

      initContainers:
        - name: wait-for-db
          image: busybox:1.35
          command:
            [
              'sh',
              '-c',
              'until nc -z database-service 5432; do echo waiting for db; sleep 2; done;',
            ]

      containers:
        - name: app
          image: pmplearning/app:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
            - containerPort: 9090
              name: metrics
              protocol: TCP

          env:
            - name: NODE_ENV
              value: 'production'
            - name: PORT
              value: '3000'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: redis-url

          resources:
            requests:
              memory: '256Mi'
              cpu: '100m'
            limits:
              memory: '512Mi'
              cpu: '500m'

          livenessProbe:
            httpGet:
              path: /health
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            successThreshold: 1
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            successThreshold: 1
            failureThreshold: 3

          startupProbe:
            httpGet:
              path: /startup
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 10
            timeoutSeconds: 3
            successThreshold: 1
            failureThreshold: 30

          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
            - name: cache
              mountPath: /app/.cache

          securityContext:
            runAsNonRoot: true
            runAsUser: 1001
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL

      volumes:
        - name: config
          configMap:
            name: app-config
        - name: cache
          emptyDir: {}

      serviceAccountName: pmp-learning-sa
      securityContext:
        fsGroup: 1001
```

### Helm Chart

```yaml
# kubernetes/helm/pmp-learning/values.yaml

replicaCount: 3

image:
  repository: pmplearning/app
  pullPolicy: IfNotPresent
  tag: ''

imagePullSecrets: []
nameOverride: ''
fullnameOverride: ''

serviceAccount:
  create: true
  annotations: {}
  name: ''

podAnnotations:
  prometheus.io/scrape: 'true'
  prometheus.io/port: '9090'

podSecurityContext:
  fsGroup: 1001

securityContext:
  capabilities:
    drop:
      - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1001

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/force-ssl-redirect: 'true'
  hosts:
    - host: pmplearning.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: pmp-learning-tls
      hosts:
        - pmplearning.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

persistence:
  enabled: true
  storageClass: 'gp3'
  accessMode: ReadWriteOnce
  size: 10Gi

postgresql:
  enabled: true
  auth:
    database: pmplearning
    username: pmpuser
  primary:
    persistence:
      enabled: true
      size: 20Gi
  readReplicas:
    replicaCount: 2

redis:
  enabled: true
  auth:
    enabled: true
  master:
    persistence:
      enabled: true
      size: 8Gi
  replica:
    replicaCount: 2

monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s
```

## Ansible Automation

### Kubernetes Setup Playbook

```yaml
# ansible/playbooks/setup-k8s.yml
---
- name: Setup Kubernetes Cluster
  hosts: k8s_masters
  become: yes
  vars:
    kubernetes_version: '1.27.0'
    pod_network_cidr: '10.244.0.0/16'

  tasks:
    - name: Install Docker
      package:
        name: docker.io
        state: present

    - name: Add Kubernetes APT repository
      apt_repository:
        repo: 'deb https://apt.kubernetes.io/ kubernetes-xenial main'
        state: present

    - name: Install Kubernetes packages
      package:
        name:
          - kubelet={{ kubernetes_version }}
          - kubeadm={{ kubernetes_version }}
          - kubectl={{ kubernetes_version }}
        state: present

    - name: Initialize Kubernetes cluster
      command: |
        kubeadm init \
          --pod-network-cidr={{ pod_network_cidr }} \
          --kubernetes-version={{ kubernetes_version }}
      args:
        creates: /etc/kubernetes/admin.conf

    - name: Create .kube directory
      file:
        path: /home/{{ ansible_user }}/.kube
        state: directory
        owner: '{{ ansible_user }}'
        group: '{{ ansible_user }}'

    - name: Copy admin.conf
      copy:
        src: /etc/kubernetes/admin.conf
        dest: /home/{{ ansible_user }}/.kube/config
        owner: '{{ ansible_user }}'
        group: '{{ ansible_user }}'
        mode: '0644'
        remote_src: yes

    - name: Install Flannel CNI
      command: |
        kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
      environment:
        KUBECONFIG: /home/{{ ansible_user }}/.kube/config

    - name: Generate join command
      command: kubeadm token create --print-join-command
      register: join_command

    - name: Set join command fact
      set_fact:
        kubeadm_join_command: '{{ join_command.stdout }}'

- name: Join Worker Nodes
  hosts: k8s_workers
  become: yes

  tasks:
    - name: Join cluster
      command: "{{ hostvars[groups['k8s_masters'][0]]['kubeadm_join_command'] }}"
      args:
        creates: /etc/kubernetes/kubelet.conf
```

## CloudFormation Templates

### VPC Stack

```yaml
# cloudformation/stacks/vpc.yaml

AWSTemplateFormatVersion: '2010-09-09'
Description: VPC Infrastructure for PMP Learning Management

Parameters:
  EnvironmentName:
    Type: String
    Default: production
    AllowedValues:
      - development
      - staging
      - production

  VpcCIDR:
    Type: String
    Default: 10.0.0.0/16

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCIDR
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-vpc

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: !Select [0, !Cidr [!Ref VpcCIDR, 6, 8]]
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-public-subnet-1
        - Key: kubernetes.io/role/elb
          Value: 1

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: !Select [3, !Cidr [!Ref VpcCIDR, 6, 8]]
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-private-subnet-1
        - Key: kubernetes.io/role/internal-elb
          Value: 1

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-igw

  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

  NatGateway1EIP:
    Type: AWS::EC2::EIP
    DependsOn: InternetGatewayAttachment
    Properties:
      Domain: vpc

  NatGateway1:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NatGateway1EIP.AllocationId
      SubnetId: !Ref PublicSubnet1

Outputs:
  VPC:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub ${EnvironmentName}-vpc-id

  PublicSubnets:
    Description: Public subnet IDs
    Value: !Join [',', [!Ref PublicSubnet1]]
    Export:
      Name: !Sub ${EnvironmentName}-public-subnets

  PrivateSubnets:
    Description: Private subnet IDs
    Value: !Join [',', [!Ref PrivateSubnet1]]
    Export:
      Name: !Sub ${EnvironmentName}-private-subnets
```

## Infrastructure Monitoring

### Prometheus Configuration

```yaml
# monitoring/prometheus-config.yaml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/rules/*.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels:
          [
            __meta_kubernetes_namespace,
            __meta_kubernetes_service_name,
            __meta_kubernetes_endpoint_port_name,
          ]
        action: keep
        regex: default;kubernetes;https

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

## Cost Optimization

### Auto-scaling Policies

```yaml
# infrastructure/autoscaling/policies.yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pmp-learning-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pmp-learning-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: '1000'
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
        - type: Pods
          value: 4
          periodSeconds: 60
      selectPolicy: Max
```

## Disaster Recovery

### Backup Configuration

```yaml
# infrastructure/backup/velero-config.yaml

apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: '0 2 * * *'
  template:
    ttl: 720h0m0s
    includedNamespaces:
      - default
      - pmp-learning
    includedResources:
      - '*'
    excludedResources:
      - events
      - events.events.k8s.io
    storageLocation: default
    volumeSnapshotLocations:
      - default
```

## Best Practices

### 1. Infrastructure Standards

- **Immutable Infrastructure**: Never modify running infrastructure
- **Version Everything**: Tag all resources with version numbers
- **Least Privilege**: Apply minimal permissions required
- **Encryption**: Encrypt data at rest and in transit
- **Monitoring**: Instrument everything

### 2. Resource Naming

```yaml
Naming Convention:
  Format: {project}-{environment}-{resource}-{identifier}
  Example: pmp-prod-rds-primary

  Environments:
    - dev: Development
    - stg: Staging
    - prod: Production
    - dr: Disaster Recovery
```

### 3. Tagging Strategy

```yaml
Required Tags:
  - Environment: dev|stg|prod
  - Project: pmp-learning
  - Owner: team-name
  - CostCenter: department-code
  - ManagedBy: terraform|manual
  - CreatedDate: YYYY-MM-DD
  - Purpose: brief-description
```

## Troubleshooting

### Common Issues

#### 1. Terraform State Lock

```bash
# Force unlock state
terraform force-unlock <lock-id>

# Check who holds the lock
aws dynamodb get-item \
  --table-name terraform-state-lock \
  --key '{"LockID":{"S":"pmp-learning-prod"}}'
```

#### 2. Kubernetes Node Issues

```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Drain node for maintenance
kubectl drain <node-name> --ignore-daemonsets

# Uncordon node
kubectl uncordon <node-name>
```

#### 3. Docker Build Failures

```bash
# Clean Docker system
docker system prune -a

# Check disk space
df -h

# Build with no cache
docker build --no-cache -t app:latest .
```

## References

- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Last Updated**: 2025-08-15  
**Version**: 2.0.0  
**Owner**: DevOps Team
