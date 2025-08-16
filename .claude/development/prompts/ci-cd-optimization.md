# CI/CD Optimization Prompts - Pipeline Enhancement Guide

## 🚀 Quick CI/CD Assessment

```
Analyze and optimize the CI/CD pipeline for PMPLearningManagement:

**Current Pipeline Metrics:**
- Build Time: {minutes}
- Test Execution: {minutes}
- Deployment Time: {minutes}
- Total Pipeline Duration: {minutes}
- Success Rate: {percentage}%
- Feedback Time to Developer: {minutes}

**Target Metrics:**
- Build Time: < 5 minutes
- Test Execution: < 10 minutes
- Deployment: < 5 minutes
- Total Duration: < 20 minutes
- Success Rate: > 95%
- Feedback Time: < 10 minutes

**Required Analysis:**
1. Bottleneck identification
2. Parallelization opportunities
3. Caching improvements
4. Test optimization
5. Deployment automation

**Success Criteria:**
- 50% reduction in pipeline duration
- 99% pipeline reliability
- < 10 minute developer feedback
- Zero manual interventions
- Full rollback capability
```

## 📊 GitHub Actions Optimization

````
Optimize GitHub Actions workflows:

**Current Workflow Analysis:**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Optimized job structure
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-key: ${{ steps.cache.outputs.cache-key }}
    steps:
      - uses: actions/checkout@v4

      - name: Generate cache key
        id: cache
        run: echo "cache-key=${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}" >> $GITHUB_OUTPUT

  lint-and-format:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ needs.setup.outputs.cache-key }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit

      - name: Run linting
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  test:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ needs.setup.outputs.cache-key }}

      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit

      - name: Run ${{ matrix.test-suite }} tests
        run: npm run test:${{ matrix.test-suite }}

      - name: Upload coverage
        if: matrix.test-suite == 'unit'
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          flags: unittests

  build:
    needs: [lint-and-format, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache build
        uses: actions/cache@v4
        with:
          path: |
            dist
            .next/cache
          key: ${{ runner.os }}-build-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-build-

      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy security scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Dependency audit
        run: npm audit --audit-level=moderate

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [build, security-scan]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://pmplearning.com
    steps:
      - uses: actions/checkout@v4

      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts
          path: dist/

      - name: Deploy to production
        run: |
          # Deployment script
          echo "Deploying to production..."

      - name: Smoke tests
        run: |
          # Run smoke tests against production
          npm run test:smoke

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed'
        if: always()
````

**Optimization Strategies:**

1. Job parallelization
2. Matrix builds for tests
3. Dependency caching
4. Artifact management
5. Conditional execution
6. Self-hosted runners for heavy workloads

```

## ⚡ Build Optimization

```

Optimize build process:

**Webpack Configuration:**

```javascript
// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  mode: 'production',

  entry: {
    main: './src/index.js',
    vendor: ['react', 'react-dom', 'react-router-dom'],
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],

    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },

    runtimeChunk: 'single',
    moduleIds: 'deterministic',
  },

  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
      },
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),

    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
}
```

**Docker Build Optimization:**

```dockerfile
# Multi-stage build with caching
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

**Build Cache Strategy:**

```yaml
# GitHub Actions build caching
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      node_modules/.cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-nextjs-
```

```

## 🧪 Test Optimization

```

Optimize test execution:

**Parallel Test Execution:**

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: true,
    maxThreads: 4,
    minThreads: 2,
    isolate: true,

    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', '*.config.js'],
    },

    testTimeout: 10000,
    hookTimeout: 10000,

    // Test sharding for CI
    ...(process.env.CI && {
      shard: process.env.SHARD,
    }),
  },
})
```

**Test Selection Strategy:**

```javascript
// Smart test selection based on changes
class TestSelector {
  async selectTests(changedFiles) {
    const impactedTests = new Set()

    for (const file of changedFiles) {
      // Direct test files
      if (file.endsWith('.test.js') || file.endsWith('.spec.js')) {
        impactedTests.add(file)
      }

      // Find tests for source files
      const dependencies = await this.findDependencies(file)
      const relatedTests = await this.findRelatedTests(dependencies)
      relatedTests.forEach((test) => impactedTests.add(test))
    }

    return Array.from(impactedTests)
  }

  async findDependencies(file) {
    // Use dependency graph to find impacted modules
    const graph = await this.buildDependencyGraph()
    return graph.getDependents(file)
  }

  async findRelatedTests(files) {
    const tests = []
    for (const file of files) {
      const testFile = file.replace(/\.js$/, '.test.js')
      if (await this.fileExists(testFile)) {
        tests.push(testFile)
      }
    }
    return tests
  }
}
```

**Test Data Management:**

```javascript
// Efficient test data setup
class TestDataManager {
  constructor() {
    this.fixtures = new Map()
  }

  async setupFixture(name) {
    if (!this.fixtures.has(name)) {
      const fixture = await this.createFixture(name)
      this.fixtures.set(name, fixture)
    }
    return this.fixtures.get(name)
  }

  async createFixture(name) {
    switch (name) {
      case 'database':
        return this.setupTestDatabase()
      case 'users':
        return this.createTestUsers()
      case 'data':
        return this.loadTestData()
      default:
        throw new Error(`Unknown fixture: ${name}`)
    }
  }

  async setupTestDatabase() {
    // Use transaction rollback for test isolation
    const tx = await db.transaction()
    return {
      db: tx,
      cleanup: () => tx.rollback(),
    }
  }
}
```

```

## 🚢 Deployment Pipeline Optimization

```

Optimize deployment pipeline:

**Blue-Green Deployment Automation:**

```yaml
# Kubernetes blue-green deployment
apiVersion: batch/v1
kind: Job
metadata:
  name: blue-green-deploy
spec:
  template:
    spec:
      containers:
        - name: deploy
          image: kubectl:latest
          command:
            - /bin/sh
            - -c
            - |
              # Deploy green version
              kubectl apply -f green-deployment.yaml

              # Wait for green to be ready
              kubectl wait --for=condition=available --timeout=600s \
                deployment/app-green -n production

              # Run smoke tests
              ./smoke-tests.sh green

              # Switch traffic to green
              kubectl patch service app-service -n production \
                -p '{"spec":{"selector":{"version":"green"}}}'

              # Verify switch
              sleep 30
              ./verify-deployment.sh

              # Clean up blue deployment
              kubectl delete deployment app-blue -n production
```

**Progressive Delivery:**

```javascript
// Flagger configuration for canary deployments
const flaggerConfig = {
  apiVersion: 'flagger.app/v1beta1',
  kind: 'Canary',
  metadata: {
    name: 'pmp-app',
    namespace: 'production',
  },
  spec: {
    targetRef: {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      name: 'pmp-app',
    },
    progressDeadlineSeconds: 600,
    service: {
      port: 80,
      targetPort: 3000,
    },
    analysis: {
      interval: '1m',
      threshold: 5,
      maxWeight: 50,
      stepWeight: 10,
      metrics: [
        {
          name: 'request-success-rate',
          thresholdRange: {
            min: 99,
          },
          interval: '1m',
        },
        {
          name: 'request-duration',
          thresholdRange: {
            max: 500,
          },
          interval: '30s',
        },
      ],
    },
  },
}
```

**GitOps Workflow:**

```yaml
# ArgoCD application manifest
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: pmp-learning
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yusuke-kurosawa/PMPLearningManagement
    targetRevision: HEAD
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

```

## 📈 Pipeline Metrics & Monitoring

```

Monitor and analyze pipeline performance:

**Pipeline Metrics Collection:**

```javascript
// CI/CD metrics collector
class PipelineMetrics {
  async collectMetrics(pipelineRun) {
    return {
      duration: {
        total: this.calculateDuration(pipelineRun),
        build: this.getStageDuration(pipelineRun, 'build'),
        test: this.getStageDuration(pipelineRun, 'test'),
        deploy: this.getStageDuration(pipelineRun, 'deploy'),
      },

      quality: {
        testsPassed: this.getTestResults(pipelineRun),
        coverage: this.getCodeCoverage(pipelineRun),
        codeQuality: this.getCodeQualityScore(pipelineRun),
        vulnerabilities: this.getSecurityScanResults(pipelineRun),
      },

      efficiency: {
        parallelization: this.getParallelizationFactor(pipelineRun),
        cacheHitRate: this.getCacheHitRate(pipelineRun),
        resourceUtilization: this.getResourceUsage(pipelineRun),
      },

      reliability: {
        successRate: await this.getSuccessRate(),
        mttr: await this.getMeanTimeToRecovery(),
        flakyTests: await this.identifyFlakyTests(),
      },
    }
  }

  async generateReport(metrics) {
    return {
      summary: {
        efficiency_score: this.calculateEfficiencyScore(metrics),
        recommendations: this.generateRecommendations(metrics),
        trends: await this.analyzeTrends(),
      },

      details: metrics,

      actionItems: this.identifyImprovements(metrics),
    }
  }
}
```

**DORA Metrics Dashboard:**

```sql
-- Deployment frequency
SELECT
  DATE_TRUNC('day', deployed_at) as date,
  COUNT(*) as deployments,
  COUNT(DISTINCT committer) as unique_deployers,
  AVG(EXTRACT(EPOCH FROM (deployed_at - committed_at))/3600) as lead_time_hours
FROM deployments
WHERE environment = 'production'
  AND deployed_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;

-- Lead time for changes
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lead_time) as median_lead_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lead_time) as p95_lead_time,
  AVG(lead_time) as mean_lead_time
FROM (
  SELECT
    EXTRACT(EPOCH FROM (deployed_at - committed_at))/3600 as lead_time
  FROM deployments
  WHERE deployed_at > NOW() - INTERVAL '30 days'
) t;

-- Change failure rate
SELECT
  COUNT(CASE WHEN status = 'failed' THEN 1 END)::float / COUNT(*)::float * 100 as failure_rate
FROM deployments
WHERE deployed_at > NOW() - INTERVAL '30 days';
```

```

## 🔧 Pipeline as Code

```

Implement pipeline as code best practices:

**Reusable Workflow Components:**

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18'
      test-command:
        required: true
        type: string
    secrets:
      npm-token:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.npm-token }}

      - name: Run tests
        run: ${{ inputs.test-command }}
```

**Dynamic Pipeline Generation:**

```javascript
// Generate pipeline based on project structure
class PipelineGenerator {
  async generatePipeline(projectConfig) {
    const pipeline = {
      version: '2.1',
      workflows: {},
      jobs: {},
    }

    // Add jobs based on project type
    if (projectConfig.type === 'node') {
      pipeline.jobs.test = this.generateNodeTestJob(projectConfig)
      pipeline.jobs.build = this.generateNodeBuildJob(projectConfig)
    }

    // Add deployment based on environment
    for (const env of projectConfig.environments) {
      pipeline.jobs[`deploy-${env}`] = this.generateDeployJob(env)
    }

    // Create workflow
    pipeline.workflows.main = {
      jobs: this.createWorkflowJobs(projectConfig),
    }

    return pipeline
  }

  generateNodeTestJob(config) {
    return {
      docker: [{ image: `node:${config.nodeVersion}` }],
      steps: [
        'checkout',
        { run: 'npm ci' },
        { run: 'npm test' },
        {
          store_test_results: {
            path: 'test-results',
          },
        },
      ],
    }
  }
}
```

**Pipeline Validation:**

```javascript
// Validate pipeline configuration
class PipelineValidator {
  async validate(pipelineConfig) {
    const errors = []
    const warnings = []

    // Check for required fields
    if (!pipelineConfig.jobs) {
      errors.push('No jobs defined')
    }

    // Validate job dependencies
    for (const [jobName, job] of Object.entries(pipelineConfig.jobs)) {
      if (job.needs) {
        for (const dependency of job.needs) {
          if (!pipelineConfig.jobs[dependency]) {
            errors.push(`Job ${jobName} depends on undefined job ${dependency}`)
          }
        }
      }
    }

    // Check for security best practices
    if (!this.hasSecurityScanning(pipelineConfig)) {
      warnings.push('No security scanning job found')
    }

    // Validate secrets usage
    const secrets = this.extractSecrets(pipelineConfig)
    for (const secret of secrets) {
      if (!this.isSecretValid(secret)) {
        errors.push(`Invalid secret reference: ${secret}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
```

```

## 🔄 Continuous Improvement

```

Implement continuous CI/CD improvement:

**Pipeline Analytics:**

```javascript
// Analyze pipeline performance trends
class PipelineAnalytics {
  async analyzeTrends(days = 30) {
    const runs = await this.getPipelineRuns(days)

    return {
      performance: {
        avg_duration: this.calculateAverageDuration(runs),
        trend: this.calculateTrend(runs, 'duration'),
        bottlenecks: this.identifyBottlenecks(runs),
      },

      reliability: {
        success_rate: this.calculateSuccessRate(runs),
        failure_patterns: this.analyzeFailurePatterns(runs),
        mttr: this.calculateMTTR(runs),
      },

      efficiency: {
        resource_usage: this.analyzeResourceUsage(runs),
        parallelization: this.analyzeParallelization(runs),
        cache_effectiveness: this.analyzeCacheUsage(runs),
      },

      recommendations: this.generateRecommendations(runs),
    }
  }

  identifyBottlenecks(runs) {
    const stageDurations = {}

    for (const run of runs) {
      for (const stage of run.stages) {
        if (!stageDurations[stage.name]) {
          stageDurations[stage.name] = []
        }
        stageDurations[stage.name].push(stage.duration)
      }
    }

    const bottlenecks = []
    for (const [stage, durations] of Object.entries(stageDurations)) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length
      const variance = this.calculateVariance(durations)

      if (avg > 300 || variance > 100) {
        // 5 minutes or high variance
        bottlenecks.push({
          stage,
          avgDuration: avg,
          variance,
          impact: 'high',
        })
      }
    }

    return bottlenecks
  }
}
```

**Cost Optimization:**

```javascript
// Optimize CI/CD costs
class CICDCostOptimizer {
  async optimizeCosts() {
    const usage = await this.getResourceUsage()
    const recommendations = []

    // Analyze runner usage
    if (usage.runnerUtilization < 0.5) {
      recommendations.push({
        type: 'runner_optimization',
        action: 'Use smaller runners or reduce concurrent jobs',
        savings: this.estimateSavings('runner', usage),
      })
    }

    // Check for inefficient caching
    if (usage.cacheHitRate < 0.8) {
      recommendations.push({
        type: 'cache_optimization',
        action: 'Improve cache key strategy',
        savings: this.estimateSavings('cache', usage),
      })
    }

    // Identify redundant builds
    const redundantBuilds = await this.findRedundantBuilds()
    if (redundantBuilds.length > 0) {
      recommendations.push({
        type: 'build_optimization',
        action: 'Skip builds for documentation changes',
        savings: redundantBuilds.length * usage.avgBuildCost,
      })
    }

    return {
      currentCost: usage.totalCost,
      potentialSavings: recommendations.reduce((sum, r) => sum + r.savings, 0),
      recommendations,
    }
  }
}
```

**Feedback Loop Implementation:**

```javascript
// Developer feedback system
class DeveloperFeedback {
  async provideFeedback(commit, pipelineResult) {
    const feedback = {
      commit,
      status: pipelineResult.status,
      duration: pipelineResult.duration,
      issues: [],
    }

    // Collect issues
    if (pipelineResult.testFailures) {
      feedback.issues.push({
        type: 'test_failure',
        severity: 'high',
        details: pipelineResult.testFailures,
        suggestion: 'Run tests locally before pushing',
      })
    }

    if (pipelineResult.lintErrors) {
      feedback.issues.push({
        type: 'lint_error',
        severity: 'medium',
        details: pipelineResult.lintErrors,
        suggestion: 'Configure pre-commit hooks',
      })
    }

    if (pipelineResult.securityVulnerabilities) {
      feedback.issues.push({
        type: 'security',
        severity: 'critical',
        details: pipelineResult.securityVulnerabilities,
        suggestion: 'Update vulnerable dependencies',
      })
    }

    // Send feedback
    await this.notifyDeveloper(feedback)
    await this.updatePRStatus(feedback)
    await this.generateReport(feedback)

    return feedback
  }
}
```

```

---

**Usage Notes:**
- Regularly review and optimize pipeline performance
- Implement progressive automation
- Monitor pipeline metrics continuously
- Maintain pipeline documentation
- Version control all pipeline configurations
- Test pipeline changes in non-production first

**Integration Points:**
- Testing strategies: `testing-guidelines.md`
- Deployment procedures: `deployment-checklist.md`
- Security scanning: `security-audit.md`
- Monitoring: `monitoring-observability.md`
- Infrastructure: `infrastructure-as-code.md`

**Success Metrics:**
- Build time < 5 minutes
- Deployment frequency > 10/day
- Pipeline success rate > 95%
- Lead time < 1 hour
- Developer satisfaction > 4.5/5
```
