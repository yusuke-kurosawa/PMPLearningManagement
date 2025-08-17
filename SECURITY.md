# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Current         |
| 1.x.x   | ❌ Deprecated      |

## Reporting a Vulnerability

**DO NOT** create public issues for security vulnerabilities.

### Private Reporting

1. Use GitHub Security Advisory ("Report a vulnerability")
2. Include vulnerability details, reproduction steps, impact assessment
### Response Timeline

- **Initial**: 48 hours
- **Resolution**: 30 days (critical)

## Security Features

### Core Security
- **Auth**: Supabase JWT + RBAC + MFA
- **Encryption**: AES-GCM + TLS/SSL
- **Protection**: CSRF/XSS/SQL Injection prevention
- **Infrastructure**: Rate limiting + Code scanning

### Current Status
- ✅ **CodeQL**: 0 vulnerabilities  
- ✅ **Dependencies**: 0 alerts
- ✅ **Score**: 9.1/10

## Dependencies

Automated security monitoring with `npm audit` and Dependabot.

## Contact

Use GitHub Security Advisories for all security reports.

---
Last Updated: 2025-08-17