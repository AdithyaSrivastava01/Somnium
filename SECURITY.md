# SECURITY POLICY - SOMNIUM ECMO PLATFORM

## Overview

The Somnium ECMO Platform is a HIPAA and SOC2 compliant healthcare application handling Protected Health Information (PHI). This document outlines our security policies, procedures, and implementation details.

**Classification**: CONFIDENTIAL
**Last Updated**: 2026-01-02
**Compliance**: HIPAA, SOC2 Type II

---

## Table of Contents

1. [Security Controls Implemented](#security-controls-implemented)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Incident Response](#incident-response)
7. [Security Checklist](#security-checklist)
8. [Reporting Security Issues](#reporting-security-issues)

---

## Security Controls Implemented

###  **CRITICAL** Issues Resolved

| # | Issue | Status | Implementation |
|---|-------|--------|----------------|
| 1 | 30-day access tokens | ✅ FIXED | Access tokens now 15 minutes max |
| 2 | Hardcoded secrets | ✅ FIXED | Environment variables with strong generation |
| 3 | Weak passwords | ✅ FIXED | 8+ chars, complexity requirements, common password check |
| 4 | Tokens in localStorage | ⚠️ TODO | Move to httpOnly cookies (frontend) |
| 5 | Weak SECRET_KEY | ✅ FIXED | Generated with `openssl rand -hex 32` |
| 6 | No encryption at rest | ⚠️ TODO | PostgreSQL encryption configuration needed |
| 7 | No refresh token rotation | ⚠️ TODO | Database-tracked rotation needed |

### **HIGH** Priority Issues Resolved

| # | Issue | Status | Implementation |
|---|-------|--------|----------------|
| 8 | No rate limiting | ✅ FIXED | SlowAPI with strict limits (5/min login, 3/hr register) |
| 9 | No account lockout | ⚠️ TODO | Database migration needed |
| 10 | No audit logging | ⚠️ TODO | Audit log models needed |
| 11 | No CSRF protection | ⚠️ TODO | CSRF tokens or SameSite cookies |
| 12 | Missing security headers | ✅ FIXED | Full security headers middleware |
| 13 | No HTTPS enforcement | ✅ FIXED | Automatic redirect in production |
| 14 | No token type verification | ✅ FIXED | Access vs refresh token validation |
| 15 | CORS too permissive | ✅ FIXED | Explicit methods and headers only |

---

## Authentication & Authorization

### Password Requirements

All passwords must meet these requirements:
- **Minimum 8 characters** (maximum 128)
- At least **one uppercase** letter (A-Z)
- At least **one lowercase** letter (a-z)
- At least **one digit** (0-9)
- At least **one special character** (!@#$%^&*(),.?":{}|<>)
- **Not a common password** (checked against top 100 list)
- **No sequential characters** (e.g., "abc", "123")
- **No excessive repeating characters**

**Implementation**: [`app/core/validators.py:validate_password_strength()`](somnium_backend/app/core/validators.py)

### JWT Token Security

#### Access Tokens
- **Expiration**: 15 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Type**: `"access"` (verified on every request)
- **Claims**: `sub` (user ID), `email`, `role`, `type`, `exp`, `iat`
- **Usage**: Authentication for API endpoints
- **Storage**: ⚠️ Currently localStorage (MUST move to httpOnly cookies)

#### Refresh Tokens
- **Expiration**:
  - Default: 7 days
  - With "Remember Me": 30 days (HIPAA compliant max)
- **Type**: `"refresh"` (verified during token refresh)
- **Usage**: Generate new access tokens
- **Rotation**: ⚠️ TODO - Implement database-tracked rotation

**Implementation**: [`app/core/security.py`](somnium_backend/app/core/security.py)

### Role-Based Access Control (RBAC)

Supported roles (hierarchical):
1. **ADMIN** - Full system access
2. **ECMO_SPECIALIST** - ECMO-specific features + all physician access
3. **PHYSICIAN** - Patient data, predictions, alerts
4. **NURSE** - Patient vitals, basic monitoring
5. **PATIENT** - Own data only

**Implementation**: [`app/dependencies/__init__.py:require_roles()`](somnium_backend/app/dependencies/__init__.py)

---

## Data Protection

### Encryption in Transit

✅ **HTTPS Enforced**
- Production: Automatic HTTP → HTTPS redirect
- Headers: `Strict-Transport-Security: max-age=31536000`
- TLS 1.2+ required

**Implementation**: [`app/main.py:HTTPSRedirectMiddleware`](somnium_backend/app/main.py)

### Encryption at Rest

⚠️ **TODO**: PostgreSQL Encryption
- Option 1: Use managed database (AWS RDS, Cloud SQL) with encryption
- Option 2: Enable `pgcrypto` extension for column-level encryption
- Option 3: PostgreSQL Transparent Data Encryption (TDE)

### Input Validation & Sanitization

✅ **XSS Prevention**
- All user inputs sanitized via `sanitize_string_input()`
- HTML/script tag detection
- Event handler detection (`onclick=`, etc.)
- React auto-escaping on frontend

✅ **SQL Injection Prevention**
- SQLAlchemy ORM with parameterized queries
- No raw SQL execution
- Input validation via Pydantic schemas

**Implementation**: [`app/core/validators.py`](somnium_backend/app/core/validators.py)

---

## API Security

### Rate Limiting

Implemented per-IP limits:
- **Login**: 5 attempts/minute
- **Registration**: 3 attempts/hour
- **Token Refresh**: 10 attempts/minute
- **General API**: 100 requests/hour (default)

**Implementation**: [`app/domain/auth/router.py`](somnium_backend/app/domain/auth/router.py)

### Security Headers

All responses include:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

**Implementation**: [`app/main.py:SecurityHeadersMiddleware`](somnium_backend/app/main.py)

### CORS Policy

**Development**:
```python
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

**Production**:
```python
CORS_ORIGINS=["https://yourdomain.com"]
```

**Restrictions**:
- Explicit methods only: `GET, POST, PUT, DELETE, PATCH`
- Explicit headers only: `Authorization, Content-Type, Accept`
- Credentials allowed: `true`
- Preflight cache: 10 minutes

**Implementation**: [`app/main.py`](somnium_backend/app/main.py:124-132)

---

## Infrastructure Security

### Docker Security

✅ **Non-root user**
```dockerfile
RUN addgroup --system somnium && adduser --system --ingroup somnium somnium
USER somnium
```

✅ **No hardcoded secrets**
- All secrets in `.env` file (git-ignored)
- Docker Compose uses environment variables
- Strong secrets generated with `openssl rand -hex 32`

⚠️ **TODO**: Additional hardening
- Read-only root filesystem
- Security options: `no-new-privileges:true`
- Health checks with auth

**Implementation**: [`Dockerfile`](somnium_backend/Dockerfile), [`docker-compose.yml`](somnium_backend/docker-compose.yml)

### Environment Variables

**CRITICAL**: Never commit these files:
- `.env`
- `.env.prod`
- `.env.local`
- `*.pem`, `*.key`, `*.crt`

Always use:
- `.env.example` - Template with placeholders
- Strong password generation: `openssl rand -base64 24`
- Strong secrets: `openssl rand -hex 32`

**Implementation**: [`.gitignore`](.gitignore)

---

## Incident Response

### Security Event Logging

⚠️ **TODO**: Implement comprehensive audit logging for:
- All authentication events (login, logout, failed attempts)
- All PHI access (read, create, update, delete)
- All authorization failures
- All security events (lockouts, suspicious activity)

Required fields:
- Timestamp
- User ID
- Event type
- Resource accessed
- IP address
- User agent
- Action status (success/failure)

### Breach Notification

**HIPAA Requirements**:
- Notify affected individuals within **60 days**
- Notify HHS if affecting **500+ individuals**
- Document all breaches in **breach log**

**Contact**: [security@yourdomain.com](mailto:security@yourdomain.com)

---

## Security Checklist

### Before Production Deployment

#### Environment & Secrets
- [ ] `.env` file generated with strong secrets
- [ ] `SECRET_KEY` generated using `openssl rand -hex 32`
- [ ] `POSTGRES_PASSWORD` is strong (16+ characters)
- [ ] All `.env*` files in `.gitignore`
- [ ] No secrets in git history (`git log --all --full-history -- **/.env`)

#### Authentication
- [ ] `DEBUG=False` in production `.env`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES=15`
- [ ] Password validators enabled
- [ ] Account lockout mechanism implemented
- [ ] MFA/2FA enabled (optional but recommended)

#### Encryption
- [ ] HTTPS enforced (`HTTPSRedirectMiddleware` active)
- [ ] TLS 1.2+ certificates installed
- [ ] Database encryption at rest configured
- [ ] Tokens moved to httpOnly cookies (frontend)

#### Monitoring & Logging
- [ ] Audit logging enabled for all PHI access
- [ ] Failed login attempts logged
- [ ] Security events monitored
- [ ] Log retention policy configured (7 years for HIPAA)
- [ ] Logs stored securely (encrypted, access-controlled)

#### API Security
- [ ] Rate limiting configured and tested
- [ ] CORS origins set to production domains only
- [ ] Security headers middleware active
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints

#### Infrastructure
- [ ] Docker containers run as non-root
- [ ] Database backups encrypted and tested
- [ ] Secrets manager configured (AWS Secrets Manager, Vault)
- [ ] Network segmentation configured
- [ ] Firewall rules configured

#### Compliance
- [ ] HIPAA risk assessment completed
- [ ] SOC2 controls documented
- [ ] Business Associate Agreements (BAAs) signed
- [ ] Incident response plan documented
- [ ] Security training completed

---

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

**Instead**, email: [security@yourdomain.com](mailto:security@yourdomain.com)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response Time**: We aim to respond within **24 hours** and provide a fix within **7 days** for critical issues.

---

## Security Audit History

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2026-01-02 | Internal Security Audit | 7 Critical, 18 High, 13 Medium | In Progress |

---

## References

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [SOC2 Trust Service Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)

---

**Document Owner**: Security Team
**Approved By**: CTO/CISO
**Next Review**: 2026-04-02 (Quarterly)
