# Security Commands & Best Practices / セキュリティコマンド・ベストプラクティス

> 🔒 **Security scanner**: `npm run security:scan`  
> 🛡️ **Vulnerability check**: `npm run security:audit`  
> 📊 **Security dashboard**: `npm run security:dashboard`

## 🚨 Security Quick Actions

### Immediate Security Check

```bash
# Full security audit
npm run security:full

# This runs:
# 1. npm audit
# 2. Dependency scanning
# 3. Secret detection
# 4. OWASP checks
# 5. Security headers validation
```

## 🔐 Authentication & Authorization

### JWT Token Management

```javascript
// Secure token storage
class TokenManager {
  // Store in memory, not localStorage
  private accessToken: string | null = null;

  // Store refresh token in httpOnly cookie
  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    // Refresh token handled by backend cookie
  }

  // Add token to requests
  getAuthHeader() {
    return this.accessToken
      ? { Authorization: `Bearer ${this.accessToken}` }
      : {};
  }

  // Clear on logout
  clearTokens() {
    this.accessToken = null;
    // Call backend to clear httpOnly cookie
  }
}

// Token refresh logic
const refreshToken = async () => {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Include httpOnly cookies
    });
    const { access_token } = await response.json();
    tokenManager.setTokens(access_token, null);
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

### Session Security

```javascript
// Session timeout handler
const SessionManager = {
  timeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minute warning
  timer: null,

  resetTimer() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.showWarning()
    }, this.timeout - this.warningTime)
  },

  showWarning() {
    if (confirm('Session expiring. Continue?')) {
      this.extendSession()
    } else {
      this.logout()
    }
  },

  extendSession() {
    refreshToken()
    this.resetTimer()
  },

  logout() {
    tokenManager.clearTokens()
    window.location.href = '/login'
  },
}

// Track user activity
;['mousedown', 'keypress', 'scroll', 'touchstart'].forEach((event) => {
  document.addEventListener(event, () => SessionManager.resetTimer(), true)
})
```

### Password Security

```javascript
// Password validation
const validatePassword = (password) => {
  const rules = [
    { test: /.{8,}/, message: 'At least 8 characters' },
    { test: /[A-Z]/, message: 'One uppercase letter' },
    { test: /[a-z]/, message: 'One lowercase letter' },
    { test: /[0-9]/, message: 'One number' },
    { test: /[^A-Za-z0-9]/, message: 'One special character' },
  ]

  const failures = rules.filter((rule) => !rule.test.test(password))
  return {
    valid: failures.length === 0,
    errors: failures.map((f) => f.message),
  }
}

// Password strength meter
const getPasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  return ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]
}
```

## 🛡️ Input Validation & Sanitization

### XSS Prevention

```javascript
// Sanitize user input
import DOMPurify from 'dompurify'

const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  })
}

// Safe rendering in React
const SafeHTML = ({ html }) => {
  const sanitized = useMemo(() => sanitizeHTML(html), [html])
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// Escape special characters
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
```

### SQL Injection Prevention

```javascript
// Use parameterized queries (Prisma)
// ✅ SAFE
const user = await prisma.user.findUnique({
  where: { email: userInput },
})

// ❌ UNSAFE - Never do this!
const query = `SELECT * FROM users WHERE email = '${userInput}'`

// Safe raw queries when needed
const result = await prisma.$queryRaw`
  SELECT * FROM users 
  WHERE email = ${email} 
  AND age > ${minAge}
`
```

### File Upload Security

```javascript
// Secure file upload validation
const validateFile = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']

  // Check file size
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Max 10MB allowed.')
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type.')
  }

  // Check file extension
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file extension.')
  }

  // Scan for malware (integrate with ClamAV or similar)
  // await scanFile(file);

  return true
}

// Generate secure filename
const generateSecureFilename = (originalName) => {
  const ext = originalName.slice(originalName.lastIndexOf('.'))
  const uuid = crypto.randomUUID()
  return `${uuid}${ext}`
}
```

## 🔒 HTTPS & TLS

### Force HTTPS

```javascript
// Redirect to HTTPS in production
if (location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length))
}

// HSTS Header (server-side)
app.use((req, res, next) => {
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  next()
})
```

### Certificate Pinning

```javascript
// Certificate pinning for API calls
const https = require('https')
const tls = require('tls')

const agent = new https.Agent({
  checkServerIdentity: (host, cert) => {
    // Verify certificate fingerprint
    const fingerprint = cert.fingerprint256
    const expected = 'AA:BB:CC:DD:EE:FF...'

    if (fingerprint !== expected) {
      throw new Error('Certificate fingerprint mismatch')
    }

    return tls.checkServerIdentity(host, cert)
  },
})
```

## 🛡️ Security Headers

### Content Security Policy (CSP)

```javascript
// CSP Configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.pmp-learning.com'],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
}

// Generate CSP header
const csp = Object.entries(cspDirectives)
  .map(([key, value]) => `${key} ${value.join(' ')}`)
  .join('; ')

// Apply CSP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', csp)
  next()
})
```

### Security Headers Configuration

```nginx
# nginx.conf
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

## 🔍 Security Scanning

### Dependency Scanning

```bash
# NPM Audit
npm audit
npm audit fix
npm audit fix --force # Careful with breaking changes

# Snyk scanning
npx snyk test
npx snyk monitor
npx snyk wizard # Interactive fixes

# OWASP Dependency Check
dependency-check --project "PMP Learning" --scan ./package-lock.json

# Retire.js for known vulnerabilities
npx retire --path .
```

### Code Scanning

```bash
# ESLint security plugin
npm install --save-dev eslint-plugin-security

# .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}

# Run security linting
npx eslint --ext .js,.jsx,.ts,.tsx src/

# Semgrep static analysis
semgrep --config=auto --json -o semgrep-report.json .
```

### Secret Detection

```bash
# Gitleaks - scan for secrets
gitleaks detect --source . --verbose

# TruffleHog - find secrets in git history
trufflehog git https://github.com/org/repo --json

# detect-secrets
detect-secrets scan --baseline .secrets.baseline
detect-secrets audit .secrets.baseline
```

## 🚨 OWASP Top 10 Prevention

### 1. Injection

```javascript
// Prevention: Use parameterized queries, validate input
// See SQL Injection Prevention section above
```

### 2. Broken Authentication

```javascript
// Prevention: Strong passwords, MFA, secure sessions
const enforeMFA = async (user) => {
  if (!user.mfaEnabled) {
    return redirect('/setup-mfa')
  }
  // Verify MFA token
}
```

### 3. Sensitive Data Exposure

```javascript
// Encrypt sensitive data
import crypto from 'crypto'

const encrypt = (text, key) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}
```

### 4. XML External Entities (XXE)

```javascript
// Disable XML external entity processing
const parser = new DOMParser()
const doc = parser.parseFromString(xmlString, 'text/xml', {
  // Disable external entities
  resolveExternals: false,
  validateOnParse: false,
})
```

### 5. Broken Access Control

```javascript
// Implement proper authorization
const authorize = (user, resource, action) => {
  // Check user permissions
  if (!user.permissions.includes(`${resource}:${action}`)) {
    throw new ForbiddenError('Access denied')
  }
}

// Row-level security
const getResource = async (userId, resourceId) => {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      userId: userId, // Ensure user owns resource
    },
  })
  if (!resource) throw new NotFoundError()
  return resource
}
```

### 6. Security Misconfiguration

```bash
# Security configuration checklist
✅ Remove default passwords
✅ Disable directory listing
✅ Remove unnecessary services
✅ Keep software updated
✅ Configure proper error handling
✅ Set secure defaults
```

### 7. Cross-Site Scripting (XSS)

```javascript
// See XSS Prevention section above
// Additional: Use Content Security Policy
```

### 8. Insecure Deserialization

```javascript
// Validate JSON schema
import Ajv from 'ajv'
const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 100 },
    age: { type: 'number', minimum: 0, maximum: 150 },
  },
  required: ['name', 'age'],
  additionalProperties: false,
}

const validate = ajv.compile(schema)
if (!validate(data)) {
  throw new ValidationError(validate.errors)
}
```

### 9. Using Components with Known Vulnerabilities

```bash
# Regular dependency updates
npm outdated
npm update
npm audit fix

# Automated updates with Dependabot
# .github/dependabot.yml
```

### 10. Insufficient Logging & Monitoring

```javascript
// Comprehensive logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'security.log' })],
})

// Log security events
securityLogger.info('Login attempt', {
  userId,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString(),
})
```

## 🔐 Secrets Management

### Environment Variables

```bash
# Never commit .env files with secrets
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use different secrets per environment
development: .env.development
staging: .env.staging
production: .env.production
```

### Secure Secret Storage

```javascript
// Use secret management services
// AWS Secrets Manager
const AWS = require('aws-sdk')
const client = new AWS.SecretsManager({ region: 'us-east-1' })

const getSecret = async (secretName) => {
  const data = await client.getSecretValue({ SecretId: secretName }).promise()
  return JSON.parse(data.SecretString)
}

// HashiCorp Vault
const vault = require('node-vault')()
const secret = await vault.read('secret/data/api-keys')
```

## 🛡️ API Security

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// Different limits for different endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes
})

app.use('/api/auth/password-reset', strictLimiter)
```

### API Key Management

```javascript
// Generate secure API keys
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Validate API keys
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' })
  }

  // Hash API key for storage
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')

  const validKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
  })

  if (!validKey || validKey.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Invalid API key' })
  }

  req.apiKey = validKey
  next()
}
```

## 🔒 Client-Side Security

### Secure Storage

```javascript
// Never store sensitive data in localStorage
// ❌ UNSAFE
localStorage.setItem('token', authToken)
localStorage.setItem('creditCard', cardNumber)

// ✅ SAFE - Use memory or secure cookies
class SecureStorage {
  constructor() {
    this.storage = new Map()
  }

  set(key, value) {
    // Store in memory only
    this.storage.set(key, value)
  }

  get(key) {
    return this.storage.get(key)
  }

  clear() {
    this.storage.clear()
  }
}
```

### Secure Communication

```javascript
// Always use HTTPS
if (window.location.protocol !== 'https:') {
  console.error('Insecure connection detected')
}

// Validate SSL certificates
const validateSSL = async (url) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    })
    return response.ok
  } catch (error) {
    console.error('SSL validation failed:', error)
    return false
  }
}
```

## 📊 Security Monitoring

### Security Dashboard

```bash
# Run security dashboard
npm run security:dashboard

# This shows:
# - Vulnerability count
# - Security score
# - Recent security events
# - Compliance status
```

### Audit Logging

```javascript
// Audit log schema
const auditLog = {
  timestamp: new Date().toISOString(),
  userId: user.id,
  action: 'LOGIN',
  resource: 'auth',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
  metadata: {
    // Additional context
  },
}

// Store audit logs
await prisma.auditLog.create({ data: auditLog })
```

## 🚨 Incident Response

### Security Incident Checklist

```yaml
1. Detect:
  - Monitor alerts
  - Check logs
  - User reports

2. Contain:
  - Isolate affected systems
  - Disable compromised accounts
  - Block malicious IPs

3. Investigate:
  - Analyze logs
  - Identify root cause
  - Assess damage

4. Remediate:
  - Patch vulnerabilities
  - Reset credentials
  - Update security measures

5. Recover:
  - Restore services
  - Verify integrity
  - Monitor closely

6. Learn:
  - Document incident
  - Update procedures
  - Train team
```

## 📚 Security Resources

### Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Web app security scanner
- [Burp Suite](https://portswigger.net/burp) - Security testing
- [Metasploit](https://www.metasploit.com/) - Penetration testing
- [Wireshark](https://www.wireshark.org/) - Network analysis

### References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SANS Security Resources](https://www.sans.org/security-resources/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

_Security measures are continuously updated. Last security audit: Check with `npm run security:audit`_
