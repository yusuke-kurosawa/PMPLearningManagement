# Security Audit Prompts - Comprehensive Security Assessment Guide

## 🔒 Quick Security Assessment

````
Perform a security audit of PMPLearningManagement application:

**Application Context:**
- Type: React SPA with Node.js backend
- Authentication: JWT/Supabase
- Data Sensitivity: User learning data, payment info
- Compliance Requirements: GDPR, PCI DSS
- Current Security Measures: {list implemented features}

**Security Checklist:**
□ Authentication & Authorization
□ Input Validation & Sanitization
□ XSS Prevention
□ CSRF Protection
□ SQL Injection Prevention
□ Secure Communication (HTTPS/TLS)
□ Secrets Management
□ Dependency Vulnerabilities
□ Security Headers
□ Rate Limiting

**Required Output:**
1. Critical vulnerabilities (immediate action)
2. High-risk issues (24-48 hours)
3. Medium-risk issues (1 week)
4. Low-risk issues (next sprint)
5. Security score: X/100

**Remediation Priority Matrix:**
```markdown
| Vulnerability | Severity | Effort | Priority | Timeline |
|--------------|----------|--------|----------|----------|
| Issue 1      | Critical | Low    | P0       | Today    |
| Issue 2      | High     | Medium | P1       | 48h      |
````

```

## 🛡️ OWASP Top 10 Assessment

```

Evaluate the application against OWASP Top 10 (2021):

**A01: Broken Access Control**

```javascript
// Check for issues like:
// - Privilege escalation
// - IDOR vulnerabilities
// - Missing function level access control
// - JWT token manipulation
// - CORS misconfiguration

// Example vulnerable code:
app.get('/api/user/:id', (req, res) => {
  // Missing authorization check
  const user = db.getUser(req.params.id)
  res.json(user)
})

// Secure implementation:
app.get('/api/user/:id', authenticate, authorize, (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const user = db.getUser(req.params.id)
  res.json(user)
})
```

**A02: Cryptographic Failures**

- Encryption at rest: {status}
- Encryption in transit: {status}
- Password hashing: {algorithm}
- Key management: {approach}
- Sensitive data exposure: {assessment}

**A03: Injection**

```sql
-- SQL Injection check
-- Vulnerable:
const query = `SELECT * FROM users WHERE id = ${userId}`;

-- Secure:
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

**A04: Insecure Design**

- Threat modeling conducted: {yes/no}
- Security requirements defined: {yes/no}
- Secure design patterns used: {list}
- Security user stories: {count}

**A05: Security Misconfiguration**

- Default credentials changed: {yes/no}
- Error handling reveals info: {yes/no}
- Security headers configured: {list}
- Unnecessary features disabled: {yes/no}

**A06: Vulnerable Components**

```bash
# Dependency audit
npm audit
# or
yarn audit

# Check for outdated packages
npm outdated
```

**A07: Identification and Authentication Failures**

- Multi-factor authentication: {enabled/disabled}
- Password complexity requirements: {policy}
- Session management: {implementation}
- Account lockout: {policy}

**A08: Software and Data Integrity Failures**

- CI/CD pipeline security: {assessment}
- Code signing: {yes/no}
- Update mechanism security: {assessment}
- Serialization vulnerabilities: {check}

**A09: Security Logging and Monitoring Failures**

- Security events logged: {list}
- Log integrity protected: {yes/no}
- Alerting configured: {yes/no}
- Incident response plan: {exists/missing}

**A10: Server-Side Request Forgery (SSRF)**

- URL validation: {implementation}
- Network segmentation: {yes/no}
- Allowlist/Denylist: {configuration}

```

## 🔐 Authentication & Authorization Audit

```

Audit authentication and authorization implementation:

**Authentication Review:**

```javascript
// JWT Implementation Review
{
  "algorithm": "HS256/RS256",
  "expiration": "15m/1h/24h",
  "refresh_token": "enabled/disabled",
  "token_storage": "localStorage/sessionStorage/httpOnly cookie",
  "csrf_protection": "double submit/synchronizer token",
  "session_fixation": "protected/vulnerable"
}
```

**Authorization Matrix:**

```markdown
| Resource         | Public | User | Admin | Owner Only |
| ---------------- | ------ | ---- | ----- | ---------- |
| GET /api/profile | ❌     | ✅   | ✅    | ✅         |
| PUT /api/profile | ❌     | ❌   | ✅    | ✅         |
| DELETE /api/user | ❌     | ❌   | ✅    | ❌         |
```

**Security Checks:**

1. Password Policy

```javascript
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
  expirationDays: 90,
  historyCount: 5,
}
```

2. MFA Implementation

```javascript
// TOTP implementation review
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

// Setup MFA
const secret = speakeasy.generateSecret({
  name: 'PMPLearning',
})

// Verify token
const verified = speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: 'base32',
  token: userToken,
  window: 2,
})
```

3. Session Management

```javascript
// Secure session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // No JS access
      sameSite: 'strict', // CSRF protection
      maxAge: 1000 * 60 * 15, // 15 minutes
    },
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    }),
  })
)
```

**Audit Results:**

- Authentication strength: {score}/10
- Authorization correctness: {score}/10
- Session security: {score}/10
- Recommendations: {list}

```

## 🛠️ Input Validation & Sanitization

```

Audit input validation and sanitization practices:

**Validation Strategy:**

```javascript
// Schema validation with Zod
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email().max(255),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  age: z.number().int().min(13).max(120),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
})

// XSS prevention
const DOMPurify = require('isomorphic-dompurify')
const cleanHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
})

// SQL injection prevention (Prisma)
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: userInput, // Automatically parameterized
    },
  },
})
```

**File Upload Security:**

```javascript
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Generate secure filename
    const uniqueName = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, uniqueName + ext)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})
```

**API Rate Limiting:**

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
})

app.use('/api/', limiter)
app.use('/api/auth/', authLimiter)
```

**Validation Checklist:**
□ All inputs validated
□ Whitelisting over blacklisting
□ Length limits enforced
□ Type checking implemented
□ Range validation for numbers
□ Format validation (email, URL, etc.)
□ File type validation
□ Size limits enforced
□ Path traversal prevention
□ Command injection prevention

```

## 🔓 API Security Audit

```

Comprehensive API security assessment:

**API Inventory:**

```yaml
endpoints:
  - path: /api/auth/login
    method: POST
    authentication: none
    rate_limit: 5/min
    sensitive_data: password

  - path: /api/users/{id}
    method: GET
    authentication: JWT
    authorization: owner_or_admin
    rate_limit: 100/min
    sensitive_data: email, phone
```

**Security Headers Review:**

```javascript
// Required security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // XSS Protection
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // CSP
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.pmplearning.com"
  )

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  next()
})
```

**CORS Configuration:**

```javascript
const cors = require('cors')

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://pmplearning.com', 'https://www.pmplearning.com']

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))
```

**API Versioning & Deprecation:**

```javascript
// Version management
app.use('/api/v1', v1Routes)
app.use('/api/v2', v2Routes)

// Deprecation headers
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Sunset', 'Sat, 31 Dec 2024 23:59:59 GMT')
  res.setHeader('Deprecation', 'true')
  res.setHeader('Link', '</api/v2>; rel="successor-version"')
  next()
})
```

```

## 🗝️ Secrets Management Audit

```

Audit secrets and sensitive data management:

**Current Secrets Inventory:**

```yaml
secrets:
  - name: DATABASE_URL
    type: connection_string
    rotation: manual
    last_rotated: 2024-01-01

  - name: JWT_SECRET
    type: signing_key
    rotation: never
    encryption: none

  - name: API_KEYS
    type: third_party
    storage: environment_variable
    audit: disabled
```

**Secrets Management Best Practices:**

1. **Environment Variables**

```javascript
// Use dotenv for local development
require('dotenv').config()

// Validate required env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL', 'STRIPE_SECRET_KEY']

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

2. **Secrets Rotation**

```javascript
// Automated secret rotation
class SecretRotation {
  async rotateJWTSecret() {
    const newSecret = crypto.randomBytes(64).toString('hex')

    // Update in secrets manager
    await secretsManager.update('JWT_SECRET', newSecret)

    // Graceful rotation with dual validation
    this.secrets = [newSecret, this.currentSecret]

    // Remove old secret after grace period
    setTimeout(
      () => {
        this.secrets = [newSecret]
      },
      24 * 60 * 60 * 1000
    ) // 24 hours
  }
}
```

3. **Encryption at Rest**

```javascript
const crypto = require('crypto')

class Encryption {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    }
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
```

**Audit Findings:**

- Hardcoded secrets: {count}
- Unencrypted secrets: {count}
- Expired certificates: {count}
- Weak encryption: {instances}
- Recommendations: {list}

```

## 🔍 Dependency Vulnerability Scanning

```

Scan and audit third-party dependencies:

**Automated Scanning Setup:**

```json
// package.json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:check": "npm audit fix --dry-run",
    "security:fix": "npm audit fix",
    "security:snyk": "snyk test",
    "security:owasp": "dependency-check --scan . --format HTML"
  }
}
```

**GitHub Security Configuration:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'daily'
    security-updates-only: true

  - package-ecosystem: 'docker'
    directory: '/'
    schedule:
      interval: 'weekly'
```

**Vulnerability Assessment:**

```javascript
// Custom vulnerability checker
const checkVulnerabilities = async () => {
  const audit = await exec('npm audit --json')
  const vulnerabilities = JSON.parse(audit)

  const critical = vulnerabilities.metadata.vulnerabilities.critical
  const high = vulnerabilities.metadata.vulnerabilities.high

  if (critical > 0) {
    throw new Error(`${critical} critical vulnerabilities found!`)
  }

  if (high > 0) {
    console.warn(`${high} high severity vulnerabilities found`)
  }

  return {
    total: vulnerabilities.metadata.vulnerabilities.total,
    critical,
    high,
    moderate: vulnerabilities.metadata.vulnerabilities.moderate,
    low: vulnerabilities.metadata.vulnerabilities.low,
  }
}
```

**License Compliance:**

```javascript
// Check for problematic licenses
const licenseChecker = require('license-checker')

licenseChecker.init(
  {
    start: './',
    production: true,
    onlyAllow: 'MIT;ISC;BSD-3-Clause;BSD-2-Clause;Apache-2.0',
    excludePrivatePackages: true,
  },
  (err, packages) => {
    if (err) {
      console.error('License check failed:', err)
      process.exit(1)
    }
    console.log('All licenses compliant')
  }
)
```

**Supply Chain Security:**

```bash
# Verify package integrity
npm ci --audit

# Lock file validation
npm install --package-lock-only
git diff package-lock.json

# SBOM generation
npm sbom --output sbom.json
```

```

## 🚨 Infrastructure Security Audit

```

Audit infrastructure and deployment security:

**Cloud Security Assessment:**

```yaml
# AWS Security Checklist
aws_security:
  iam:
    - mfa_enabled: true
    - password_policy: compliant
    - unused_credentials: 0
    - root_account_usage: disabled

  s3:
    - public_buckets: 0
    - encryption: AES256
    - versioning: enabled
    - access_logging: enabled

  rds:
    - encryption_at_rest: enabled
    - backup_retention: 30_days
    - multi_az: true
    - public_access: false

  vpc:
    - flow_logs: enabled
    - nacls_configured: true
    - security_groups_audited: true
    - bastion_host: true
```

**Container Security:**

```dockerfile
# Secure Dockerfile
FROM node:18-alpine AS builder

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Run application
CMD ["node", "server.js"]
```

**Kubernetes Security:**

```yaml
# Pod Security Policy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

**Network Security:**

```yaml
# Network Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-netpol
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: reverse-proxy
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

```

## 📋 Compliance & Regulatory Audit

```

Audit compliance with regulatory requirements:

**GDPR Compliance:**

```javascript
// Data protection implementation
class GDPRCompliance {
  // Right to be forgotten
  async deleteUserData(userId) {
    await Promise.all([
      db.users.delete(userId),
      db.userLogs.deleteMany({ userId }),
      cache.del(`user:${userId}:*`),
      searchIndex.delete(userId),
    ])

    await this.logDeletion(userId)
  }

  // Data portability
  async exportUserData(userId) {
    const data = {
      profile: await db.users.findOne(userId),
      activities: await db.activities.findMany({ userId }),
      preferences: await db.preferences.findOne({ userId }),
    }

    return {
      format: 'json',
      data: JSON.stringify(data, null, 2),
      timestamp: new Date().toISOString(),
    }
  }

  // Consent management
  async updateConsent(userId, consents) {
    await db.consents.upsert({
      userId,
      marketing: consents.marketing,
      analytics: consents.analytics,
      timestamp: new Date(),
      ip: req.ip,
    })
  }
}
```

**PCI DSS Requirements:**

```javascript
// Payment card security
class PCICompliance {
  // Never store sensitive card data
  constructor() {
    this.prohibitedFields = ['cardNumber', 'cvv', 'pin']
  }

  // Tokenization
  async tokenizeCard(cardData) {
    // Use payment provider's tokenization
    const token = await stripe.tokens.create({
      card: {
        number: cardData.number,
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        cvc: cardData.cvc,
      },
    })

    return token.id
  }

  // Audit logging
  logTransaction(event) {
    const sanitized = this.sanitize(event)
    auditLog.write({
      timestamp: new Date(),
      event: sanitized,
      hash: crypto.createHash('sha256').update(JSON.stringify(sanitized)).digest('hex'),
    })
  }
}
```

**Audit Trail Requirements:**

```javascript
// Comprehensive audit logging
class AuditLogger {
  log(event) {
    const auditEntry = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      result: event.result,
      ip: event.ip,
      userAgent: event.userAgent,
      metadata: event.metadata,
    }

    // Ensure tamper-proof
    auditEntry.signature = this.sign(auditEntry)

    // Store in append-only log
    this.appendOnlyLog.write(auditEntry)

    // Alert on suspicious activity
    if (this.isSuspicious(event)) {
      this.alert(auditEntry)
    }
  }
}
```

**Compliance Checklist:**
□ Data encryption (at rest & transit)
□ Access controls implemented
□ Audit logging enabled
□ Data retention policies
□ Privacy policy updated
□ Cookie consent banner
□ Data breach procedures
□ Security training completed
□ Penetration testing done
□ Compliance certification

```

## 🔬 Penetration Testing Guide

```

Guide for penetration testing the application:

**Testing Methodology:**

1. Reconnaissance
   - DNS enumeration
   - Subdomain discovery
   - Technology stack identification
   - Open ports scanning

2. Vulnerability Scanning
   - Automated scanning (OWASP ZAP, Burp Suite)
   - Manual testing
   - API fuzzing
   - Authentication bypass attempts

3. Exploitation
   - XSS payload testing
   - SQL injection attempts
   - CSRF token manipulation
   - Session hijacking
   - Privilege escalation

4. Post-Exploitation
   - Data exfiltration paths
   - Persistence mechanisms
   - Lateral movement possibilities

**Testing Payloads:**

```javascript
// XSS test payloads
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<svg onload=alert(1)>',
  '"><script>alert(1)</script>',
]

// SQL injection payloads
const sqlPayloads = [
  "' OR '1'='1",
  '1; DROP TABLE users--',
  "' UNION SELECT * FROM users--",
  "admin'--",
  "' OR 1=1--",
]

// Path traversal payloads
const pathPayloads = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  'file:///etc/passwd',
  '....//....//etc/passwd',
]
```

**Automated Testing Script:**

```python
# Security testing automation
import requests
from urllib.parse import urljoin

class SecurityTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()

    def test_security_headers(self):
        response = self.session.get(self.base_url)
        required_headers = [
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Strict-Transport-Security',
            'Content-Security-Policy'
        ]

        missing = []
        for header in required_headers:
            if header not in response.headers:
                missing.append(header)

        return {
            'missing_headers': missing,
            'score': (len(required_headers) - len(missing)) / len(required_headers) * 100
        }

    def test_ssl_configuration(self):
        # Check SSL/TLS configuration
        # Verify certificate
        # Check supported protocols
        pass
```

**Reporting Template:**

```markdown
## Penetration Test Report

### Executive Summary

- Test Duration: X days
- Vulnerabilities Found: X critical, X high, X medium, X low
- Overall Security Score: X/100

### Critical Findings

1. **Vulnerability Name**
   - Severity: Critical
   - CVSS Score: X.X
   - Description: ...
   - Impact: ...
   - Reproduction Steps: ...
   - Remediation: ...
   - Evidence: [screenshots/logs]

### Recommendations

1. Immediate actions required
2. Short-term improvements
3. Long-term security enhancements
```

```

## 🛡️ Security Monitoring & Incident Response

```

Setup security monitoring and incident response:

**Security Event Monitoring:**

```javascript
// Real-time security monitoring
class SecurityMonitor {
  constructor() {
    this.thresholds = {
      failedLogins: 5,
      requestRate: 100,
      errorRate: 0.05,
      suspiciousPatterns: [
        /(\.\.|\/\/)/, // Path traversal
        /<script|javascript:/i, // XSS attempts
        /union.*select|drop.*table/i, // SQL injection
      ],
    }
  }

  async detectAnomalies(event) {
    const anomalies = []

    // Failed login attempts
    const failedLogins = await this.getFailedLogins(event.ip, '5m')
    if (failedLogins > this.thresholds.failedLogins) {
      anomalies.push({
        type: 'BRUTE_FORCE',
        severity: 'HIGH',
        action: 'BLOCK_IP',
      })
    }

    // Suspicious patterns
    for (const pattern of this.thresholds.suspiciousPatterns) {
      if (pattern.test(event.payload)) {
        anomalies.push({
          type: 'MALICIOUS_PAYLOAD',
          severity: 'CRITICAL',
          action: 'BLOCK_REQUEST',
        })
      }
    }

    return anomalies
  }

  async respond(anomalies) {
    for (const anomaly of anomalies) {
      switch (anomaly.action) {
        case 'BLOCK_IP':
          await this.blockIP(anomaly.ip)
          break
        case 'BLOCK_REQUEST':
          await this.blockRequest(anomaly.requestId)
          break
        case 'ALERT':
          await this.sendAlert(anomaly)
          break
      }

      await this.logIncident(anomaly)
    }
  }
}
```

**Incident Response Plan:**

```yaml
incident_response:
  detection:
    - monitoring_tools: [Datadog, Sentry, CloudWatch]
    - alert_channels: [PagerDuty, Slack, Email]

  triage:
    severity_levels:
      P0:
        description: 'Critical security breach'
        response_time: '< 15 minutes'
        escalation: 'CTO, Security Team'
      P1:
        description: 'High risk vulnerability'
        response_time: '< 1 hour'
        escalation: 'Security Team Lead'

  containment:
    - isolate_affected_systems
    - revoke_compromised_credentials
    - block_malicious_ips
    - enable_read_only_mode

  eradication:
    - patch_vulnerabilities
    - remove_malware
    - reset_passwords
    - update_security_rules

  recovery:
    - restore_from_backup
    - verify_system_integrity
    - monitor_for_reoccurrence
    - gradual_service_restoration

  lessons_learned:
    - incident_postmortem
    - update_runbooks
    - security_training
    - process_improvements
```

**Security Metrics Dashboard:**

```sql
-- Security KPIs
SELECT
  DATE(timestamp) as date,
  COUNT(CASE WHEN event_type = 'failed_login' THEN 1 END) as failed_logins,
  COUNT(CASE WHEN event_type = 'blocked_request' THEN 1 END) as blocked_requests,
  COUNT(DISTINCT ip) as unique_attackers,
  COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_events
FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

```

---

**Usage Notes:**
- Perform security audits regularly (monthly minimum)
- Automate security scanning in CI/CD pipeline
- Maintain security documentation up-to-date
- Conduct security training for development team
- Implement defense in depth strategy
- Follow principle of least privilege

**Integration Points:**
- Incident procedures: `incident-analysis.md`
- Deployment security: `deployment-checklist.md`
- Infrastructure security: `infrastructure-as-code.md`
- Monitoring setup: `monitoring-observability.md`

**Success Metrics:**
- Zero critical vulnerabilities in production
- < 24 hour remediation for high severity issues
- 100% of dependencies scanned
- Security training completion > 95%
- Incident response time < 15 minutes
```
