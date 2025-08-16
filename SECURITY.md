# Security Policy

## Supported Versions

The following versions of PMP Learning Management System are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you have discovered a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should NOT be reported through public GitHub issues.

### 2. Report Privately

Please report security vulnerabilities by emailing the maintainers directly or through GitHub's Security Advisory feature:

1. Go to the Security tab of the repository
2. Click on "Report a vulnerability"
3. Fill in the details of the vulnerability

### 3. Include Details

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Within 30 days for critical issues

## Security Best Practices

### For Contributors

1. **Never commit secrets**: Use environment variables for sensitive data
2. **Validate input**: Always validate and sanitize user input
3. **Update dependencies**: Keep dependencies up to date
4. **Use HTTPS**: Always use HTTPS for external communications
5. **Follow OWASP guidelines**: Adhere to OWASP security best practices

### For Users

1. **Keep your instance updated**: Always use the latest stable version
2. **Use strong passwords**: Implement strong password policies
3. **Enable 2FA**: Use two-factor authentication when available
4. **Regular backups**: Maintain regular backups of your data
5. **Monitor logs**: Regularly review access and error logs

## Security Features

The PMP Learning Management System implements the following security measures:

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS/SSL for data in transit
- **Input Validation**: Comprehensive input sanitization
- **CSRF Protection**: Anti-CSRF tokens
- **XSS Prevention**: Content Security Policy (CSP)
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API rate limiting to prevent abuse
- **Session Management**: Secure session handling

## Dependencies

We regularly audit our dependencies for known vulnerabilities using:

```bash
npm audit
npm audit fix
```

## Contact

For security concerns, please contact the project maintainers through:

- GitHub Security Advisories
- Direct message to repository maintainers

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities and will acknowledge security researchers who help us maintain the security of our project.

---

Last Updated: 2025-08-16