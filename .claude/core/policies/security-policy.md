# 🔒 Security Policy

## Document Information

- **Version**: 1.0.0
- **Last Updated**: 2025-08-15
- **Status**: Active
- **Compliance Level**: 🔴 Critical (Mandatory)
- **Owner**: Security Team & DevOps Team
- **Review Cycle**: Monthly
- **Compliance Standards**: OWASP Top 10, ISO 27001, GDPR

## 1. Executive Summary

This security policy establishes comprehensive security standards, procedures, and best practices for the PMPLearningManagement project. Compliance with this policy is mandatory for all code, infrastructure, and operations.

## 2. Security Principles

### 2.1 Core Security Tenets

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal necessary access rights
3. **Zero Trust**: Verify everything, trust nothing
4. **Shift Left**: Security integrated early in development
5. **Continuous Monitoring**: Real-time threat detection

## 3. Application Security

### 3.1 Authentication & Authorization

#### Implementation Standards

```javascript
// ✅ SECURE: JWT with refresh tokens
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'pmp-learning',
      audience: 'pmp-users',
    })

    const refreshToken = jwt.sign(
      { userId, type: 'refresh', jti: crypto.randomBytes(16).toString('hex') },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    return { accessToken, refreshToken }
  }

  async validateToken(token, type = 'access') {
    try {
      const secret = type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET

      const decoded = jwt.verify(token, secret, {
        issuer: 'pmp-learning',
        audience: 'pmp-users',
      })

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(decoded.jti)) {
        throw new Error('Token has been revoked')
      }

      return decoded
    } catch (error) {
      throw new SecurityError('Invalid token', { cause: error })
    }
  }
}
```

#### Password Policy

```javascript
// Password requirements enforced at application level
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
  maxAge: 90, // days
  historyCount: 5, // prevent reuse of last 5 passwords
  lockoutThreshold: 5, // failed attempts
  lockoutDuration: 30, // minutes
}

// ✅ SECURE: Password hashing with bcrypt
import bcrypt from 'bcrypt'

const hashPassword = async (password) => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}
```

#### Multi-Factor Authentication (MFA)

```javascript
// ✅ SECURE: TOTP-based MFA
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

class MFAService {
  generateSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `PMP Learning (${user.email})`,
      issuer: 'PMP Learning Management',
      length: 32,
    })

    return {
      secret: secret.base32,
      qrCode: QRCode.toDataURL(secret.otpauth_url),
    }
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps for clock skew
    })
  }

  generateBackupCodes() {
    return Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase())
  }
}
```

### 3.2 Input Validation & Sanitization

#### Validation Framework

```javascript
// ✅ SECURE: Comprehensive input validation
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Schema validation
const userInputSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255)
    .refine(val => !validator.isEmail(val, { allow_display_name: true })),

  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid characters in username'),

  bio: z.string()
    .max(500)
    .transform(val => DOMPurify.sanitize(val, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    })),

  age: z.number()
    .int()
    .min(13, 'Must be at least 13 years old')
    .max(120),

  url: z.string()
    .url()
    .refine(val => {
      const parsed = new URL(val);
      return ['http:', 'https:'].includes(parsed.protocol);
    }, 'Only HTTP(S) URLs allowed')
});

// SQL injection prevention
const sanitizeSQLInput = (input) => {
  // Use parameterized queries instead
  return input.replace(/['";\\]/g, '');
};

// File upload validation
const validateFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Check file signature (magic numbers)
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46]
  };

  // Verify file signature matches claimed type
  const buffer = new Uint8Array(await file.arrayBuffer());
  const signature = signatures[file.type];

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      throw new Error('File signature mismatch');
    }
  }

  return true;
};
```

### 3.3 Cross-Site Scripting (XSS) Prevention

```javascript
// ✅ SECURE: Content Security Policy
const cspPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://trusted-cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.pmplms.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: [],
  },
}

// React component with XSS protection
const SafeContent = ({ userContent }) => {
  // ✅ SECURE: Sanitize user content
  const sanitized = DOMPurify.sanitize(userContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  })

  // ✅ SECURE: Use dangerouslySetInnerHTML safely
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} className="user-content" />
}

// ❌ INSECURE: Never do this
const UnsafeContent = ({ userContent }) => {
  return <div dangerouslySetInnerHTML={{ __html: userContent }} />
}
```

### 3.4 CSRF Protection

```javascript
// ✅ SECURE: CSRF token implementation
import crypto from 'crypto'

class CSRFProtection {
  generateToken(session) {
    const token = crypto.randomBytes(32).toString('hex')
    session.csrfToken = token
    return token
  }

  validateToken(session, providedToken) {
    if (!session.csrfToken || !providedToken) {
      return false
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(session.csrfToken), Buffer.from(providedToken))
  }

  middleware() {
    return (req, res, next) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
      }

      const token = req.headers['x-csrf-token'] || req.body._csrf

      if (!this.validateToken(req.session, token)) {
        return res.status(403).json({ error: 'Invalid CSRF token' })
      }

      next()
    }
  }
}
```

### 3.5 SQL Injection Prevention

```javascript
// ✅ SECURE: Parameterized queries with Prisma
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Safe query
const getUser = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
  })
}

// ✅ SECURE: Safe raw query when needed
const searchUsers = async (searchTerm) => {
  return prisma.$queryRaw`
    SELECT * FROM users 
    WHERE name ILIKE ${`%${searchTerm}%`}
    LIMIT 10
  `
}

// ❌ INSECURE: Never do this
const unsafeQuery = async (userId) => {
  return prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`)
}
```

## 4. Infrastructure Security

### 4.1 Network Security

```yaml
# Security Groups Configuration
security_groups:
  web_tier:
    ingress:
      - protocol: tcp
        port: 443
        source: 0.0.0.0/0
      - protocol: tcp
        port: 80
        source: 0.0.0.0/0
        action: redirect_to_https
    egress:
      - protocol: tcp
        port: 5432
        destination: database_tier

  app_tier:
    ingress:
      - protocol: tcp
        port: 3000
        source: web_tier
    egress:
      - protocol: tcp
        port: 5432
        destination: database_tier
      - protocol: tcp
        port: 6379
        destination: cache_tier

  database_tier:
    ingress:
      - protocol: tcp
        port: 5432
        source: app_tier
    egress:
      - protocol: tcp
        port: 443
        destination: backup_service
```

### 4.2 Secrets Management

```javascript
// ✅ SECURE: Environment-based secrets
class SecretsManager {
  constructor() {
    this.provider = process.env.SECRETS_PROVIDER || 'env'
    this.cache = new Map()
    this.ttl = 300000 // 5 minutes
  }

  async getSecret(key) {
    // Check cache first
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.value
    }

    let value

    switch (this.provider) {
      case 'aws':
        value = await this.getFromAWSSecretsManager(key)
        break
      case 'vault':
        value = await this.getFromHashiVault(key)
        break
      case 'azure':
        value = await this.getFromAzureKeyVault(key)
        break
      default:
        value = process.env[key]
    }

    if (!value) {
      throw new Error(`Secret ${key} not found`)
    }

    // Cache the secret
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    })

    return value
  }

  rotateSecrets() {
    // Implement secret rotation logic
    this.cache.clear()
  }
}

// ✅ SECURE: Never log secrets
const sanitizeForLogging = (obj) => {
  const sensitive = ['password', 'token', 'secret', 'key', 'api_key']
  const sanitized = { ...obj }

  for (const key of Object.keys(sanitized)) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]'
    }
  }

  return sanitized
}
```

### 4.3 Encryption

```javascript
// ✅ SECURE: Data encryption at rest
import crypto from 'crypto'

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.keyLength = 32
    this.ivLength = 16
    this.tagLength = 16
    this.saltLength = 64
    this.iterations = 100000
  }

  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256')
  }

  encrypt(text, password) {
    const salt = crypto.randomBytes(this.saltLength)
    const key = this.deriveKey(password, salt)
    const iv = crypto.randomBytes(this.ivLength)

    const cipher = crypto.createCipheriv(this.algorithm, key, iv)

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])

    const tag = cipher.getAuthTag()

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
  }

  decrypt(encryptedData, password) {
    const data = Buffer.from(encryptedData, 'base64')

    const salt = data.slice(0, this.saltLength)
    const iv = data.slice(this.saltLength, this.saltLength + this.ivLength)
    const tag = data.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    )
    const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength)

    const key = this.deriveKey(password, salt)

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return decrypted.toString('utf8')
  }
}
```

## 5. Security Monitoring

### 5.1 Logging & Auditing

```javascript
// Security event logging
class SecurityLogger {
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      action: event.action,
      result: event.result,
      metadata: this.sanitizeMetadata(event.metadata),
    }

    // Send to SIEM
    this.sendToSIEM(logEntry)

    // Store in audit log
    this.storeAuditLog(logEntry)

    // Alert if critical
    if (event.severity === 'CRITICAL') {
      this.sendAlert(logEntry)
    }
  }

  // Security events to monitor
  monitoredEvents = {
    AUTH_FAILURE: { severity: 'MEDIUM', alert: false },
    AUTH_SUCCESS: { severity: 'LOW', alert: false },
    MULTIPLE_AUTH_FAILURES: { severity: 'HIGH', alert: true },
    PRIVILEGE_ESCALATION: { severity: 'CRITICAL', alert: true },
    DATA_EXPORT: { severity: 'MEDIUM', alert: false },
    CONFIG_CHANGE: { severity: 'HIGH', alert: true },
    SUSPICIOUS_ACTIVITY: { severity: 'HIGH', alert: true },
    SQL_INJECTION_ATTEMPT: { severity: 'CRITICAL', alert: true },
    XSS_ATTEMPT: { severity: 'HIGH', alert: true },
    CSRF_VIOLATION: { severity: 'HIGH', alert: true },
  }
}
```

### 5.2 Intrusion Detection

```javascript
// Rate limiting and anomaly detection
class IntrusionDetection {
  constructor() {
    this.attempts = new Map()
    this.blacklist = new Set()
    this.thresholds = {
      maxAttempts: 5,
      timeWindow: 300000, // 5 minutes
      blacklistDuration: 3600000, // 1 hour
    }
  }

  checkForIntrusion(identifier, action) {
    if (this.isBlacklisted(identifier)) {
      throw new SecurityError('Access denied: Blacklisted')
    }

    const key = `${identifier}:${action}`
    const now = Date.now()

    if (!this.attempts.has(key)) {
      this.attempts.set(key, [])
    }

    const userAttempts = this.attempts.get(key)

    // Remove old attempts
    const recentAttempts = userAttempts.filter((time) => now - time < this.thresholds.timeWindow)

    if (recentAttempts.length >= this.thresholds.maxAttempts) {
      this.blacklist.add(identifier)
      this.logSecurityEvent({
        type: 'INTRUSION_DETECTED',
        severity: 'CRITICAL',
        identifier,
        action,
        attemptCount: recentAttempts.length,
      })

      setTimeout(() => {
        this.blacklist.delete(identifier)
      }, this.thresholds.blacklistDuration)

      throw new SecurityError('Too many attempts. Access blocked.')
    }

    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
  }

  isBlacklisted(identifier) {
    return this.blacklist.has(identifier)
  }
}
```

## 6. Vulnerability Management

### 6.1 Dependency Scanning

```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix",
    "security:check": "snyk test",
    "security:monitor": "snyk monitor",
    "security:update": "npm-check-updates -u && npm install && npm audit fix"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run security:audit"
    }
  }
}
```

### 6.2 Security Testing

```javascript
// Security test suite
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('should prevent brute force attacks', async () => {
      const attempts = 10
      const results = []

      for (let i = 0; i < attempts; i++) {
        try {
          await login('user@example.com', 'wrongpassword')
          results.push('success')
        } catch (error) {
          results.push(error.message)
        }
      }

      expect(results.filter((r) => r === 'Too many attempts')).toHaveLength(
        attempts - 5 // Should block after 5 attempts
      )
    })

    test('should validate JWT signatures', async () => {
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX'

      await expect(validateToken(tamperedToken)).rejects.toThrow('Invalid token signature')
    })
  })

  describe('Input Validation', () => {
    test('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --"

      await expect(searchUsers(maliciousInput)).resolves.toEqual([])

      // Verify table still exists
      await expect(getUsers()).resolves.toBeDefined()
    })

    test('should sanitize XSS attempts', () => {
      const xssPayload = '<script>alert("XSS")</script>'
      const sanitized = sanitizeInput(xssPayload)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
    })
  })
})
```

## 7. Incident Response

### 7.1 Incident Classification

| Severity      | Description                      | Response Time | Examples                                          |
| ------------- | -------------------------------- | ------------- | ------------------------------------------------- |
| P0 - Critical | System compromise or data breach | 15 minutes    | Data leak, ransomware, full system compromise     |
| P1 - High     | Significant security risk        | 1 hour        | Active exploitation attempt, privilege escalation |
| P2 - Medium   | Potential security issue         | 4 hours       | Suspicious activity, policy violation             |
| P3 - Low      | Minor security concern           | 24 hours      | Failed login attempts, low-risk vulnerability     |

### 7.2 Response Procedures

```yaml
incident_response:
  detection:
    - Automated monitoring alerts
    - User reports
    - Security scan results

  triage:
    - Assess severity and impact
    - Identify affected systems
    - Determine attack vector

  containment:
    - Isolate affected systems
    - Revoke compromised credentials
    - Block malicious IPs

  eradication:
    - Remove malware/backdoors
    - Patch vulnerabilities
    - Reset compromised accounts

  recovery:
    - Restore from clean backups
    - Rebuild affected systems
    - Verify integrity

  lessons_learned:
    - Conduct post-incident review
    - Update security controls
    - Document findings
    - Train team on prevention
```

### 7.3 Communication Plan

```markdown
## Incident Communication Matrix

| Stakeholder       | Severity         | Method              | Timeframe  |
| ----------------- | ---------------- | ------------------- | ---------- |
| Security Team     | All              | Slack + PagerDuty   | Immediate  |
| DevOps Team       | P0-P1            | Slack + Email       | 5 minutes  |
| Development Team  | P0-P2            | Slack               | 15 minutes |
| Management        | P0-P1            | Phone + Email       | 30 minutes |
| Legal Team        | P0 (data breach) | Phone + Email       | 1 hour     |
| Customers         | P0 (if affected) | Email + Status Page | 2 hours    |
| Regulatory Bodies | P0 (if required) | Official channels   | 72 hours   |
```

## 8. Compliance Requirements

### 8.1 Regulatory Compliance

```yaml
compliance_frameworks:
  GDPR:
    data_protection: true
    right_to_erasure: true
    consent_management: true
    breach_notification: 72_hours

  PCI_DSS:
    encryption_at_rest: true
    encryption_in_transit: true
    access_control: true
    regular_testing: quarterly

  SOC2:
    security: true
    availability: true
    processing_integrity: true
    confidentiality: true
    privacy: true

  ISO_27001:
    risk_assessment: annual
    security_controls: implemented
    continuous_improvement: true
    documentation: maintained
```

### 8.2 Audit Requirements

```javascript
// Compliance audit checklist
const auditChecklist = {
  access_control: {
    mfa_enabled: 'All admin accounts',
    password_policy: 'Enforced',
    session_timeout: '15 minutes',
    role_based_access: 'Implemented',
  },

  data_protection: {
    encryption_at_rest: 'AES-256',
    encryption_in_transit: 'TLS 1.3',
    key_management: 'HSM/KMS',
    data_classification: 'Implemented',
  },

  monitoring: {
    security_logging: 'Centralized SIEM',
    intrusion_detection: 'Real-time',
    vulnerability_scanning: 'Weekly',
    penetration_testing: 'Annually',
  },

  incident_response: {
    response_plan: 'Documented',
    team_training: 'Quarterly',
    backup_recovery: 'Tested monthly',
    communication_plan: 'Established',
  },
}
```

## 9. Security Training

### 9.1 Required Training

| Role       | Training Modules        | Frequency | Certification |
| ---------- | ----------------------- | --------- | ------------- |
| All Staff  | Security Awareness      | Annual    | Required      |
| Developers | Secure Coding           | Bi-annual | Required      |
| DevOps     | Infrastructure Security | Quarterly | Recommended   |
| Admins     | Incident Response       | Quarterly | Required      |

### 9.2 Security Champions Program

```yaml
security_champions:
  responsibilities:
    - Security code reviews
    - Threat modeling sessions
    - Security training delivery
    - Vulnerability triage

  requirements:
    - Complete advanced security training
    - Pass security certification
    - Dedicate 20% time to security

  benefits:
    - Additional training budget
    - Conference attendance
    - Recognition program
    - Career advancement priority
```

## 10. Security Tools

### 10.1 Required Security Tools

```yaml
scanning_tools:
  SAST:
    - SonarQube
    - Semgrep
    - ESLint Security Plugin

  DAST:
    - OWASP ZAP
    - Burp Suite

  dependency_scanning:
    - Snyk
    - npm audit
    - OWASP Dependency Check

  container_scanning:
    - Trivy
    - Clair
    - Anchore

  infrastructure_scanning:
    - Terraform Security Scanner
    - AWS Security Hub
    - Cloud Custodian
```

### 10.2 Security Automation

```javascript
// Automated security checks in CI/CD
const securityPipeline = {
  preCommit: ['secrets-scan', 'lint-security'],

  build: ['sast-scan', 'dependency-check', 'container-scan'],

  test: ['security-tests', 'penetration-tests'],

  deploy: ['infrastructure-scan', 'compliance-check', 'ssl-verification'],

  production: ['runtime-protection', 'continuous-monitoring', 'threat-detection'],
}
```

## 11. Security Metrics

### 11.1 Key Security Indicators

```javascript
const securityKPIs = {
  vulnerabilities: {
    critical: 0,
    high: '< 5',
    medium: '< 20',
    meanTimeToRemediate: '< 7 days',
  },

  incidents: {
    monthlyCount: '< 3',
    meanTimeToDetect: '< 1 hour',
    meanTimeToRespond: '< 4 hours',
    meanTimeToResolve: '< 24 hours',
  },

  compliance: {
    policyAdherence: '> 95%',
    trainingCompletion: '100%',
    auditFindings: '< 5',
    patchingCompliance: '> 98%',
  },

  testing: {
    codeCoverage: '> 80%',
    securityTestCoverage: '> 90%',
    penetrationTestFrequency: 'Quarterly',
    vulnerabilityScanFrequency: 'Weekly',
  },
}
```

## 12. Emergency Contacts

```yaml
security_contacts:
  internal:
    security_team:
      primary: security@pmplms.com
      oncall: +1-XXX-XXX-XXXX
      escalation: ciso@pmplms.com

  external:
    incident_response:
      provider: 'Mandiant'
      hotline: +1-XXX-XXX-XXXX

    legal:
      firm: 'Security Law Firm'
      contact: legal@lawfirm.com

    forensics:
      provider: 'Digital Forensics Inc'
      contact: forensics@dfi.com
```

## 13. Version History

| Version | Date       | Changes                               | Author                 |
| ------- | ---------- | ------------------------------------- | ---------------------- |
| 1.0.0   | 2025-08-15 | Initial comprehensive security policy | Security & DevOps Team |

---

**Approval**: CISO / Security Team Lead  
**Effective Date**: 2025-08-15  
**Next Review**: 2025-09-15  
**Classification**: CONFIDENTIAL
