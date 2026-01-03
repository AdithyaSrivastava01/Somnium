# Frontend Security Documentation - Somnium ECMO Platform

## Overview
This document outlines the security measures implemented in the Somnium ECMO Platform frontend to ensure HIPAA and SOC2 compliance for handling Protected Health Information (PHI).

**Last Updated**: 2026-01-02
**Version**: 2.0.0

---

## Security Controls Implemented

### 1. Content Security Policy (CSP) ✅

**Implementation**: [next.config.ts:11-63](next.config.ts:11-63)

Configured comprehensive CSP headers to prevent XSS attacks:

```typescript
Content-Security-Policy:
  - default-src 'self'
  - script-src 'self' 'unsafe-eval' 'unsafe-inline' (Next.js requirement)
  - style-src 'self' 'unsafe-inline' (Tailwind CSS requirement)
  - img-src 'self' data: https:
  - connect-src 'self' http://localhost:8000 ws://localhost:8000
  - frame-ancestors 'none'
```

**Notes**:
- `unsafe-eval` and `unsafe-inline` required for Next.js runtime
- In production, update `connect-src` to use HTTPS backend URL
- Blocks inline scripts except those from Next.js framework

---

### 2. Security Headers ✅

**Implementation**: [next.config.ts:16-60](next.config.ts:16-60)

All responses include security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevents clickjacking attacks |
| X-Content-Type-Options | nosniff | Prevents MIME sniffing |
| X-XSS-Protection | 1; mode=block | Enables browser XSS protection |
| Strict-Transport-Security | max-age=31536000 | Enforces HTTPS in production |
| Referrer-Policy | strict-origin-when-cross-origin | Protects referrer information |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Blocks sensitive permissions |

---

### 3. XSS Protection ✅

**Implementation**: [src/lib/security.ts](src/lib/security.ts)

Multiple layers of XSS protection:

#### 3.1 React Auto-Escaping
- React automatically escapes all JSX content
- Prevents basic XSS attacks by default

#### 3.2 DOMPurify Sanitization
```typescript
import { sanitizeHtml, sanitizeText, sanitizeUrl } from "@/lib/security";

// For user-generated HTML content
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />

// For plain text inputs
const clean = sanitizeText(userInput);

// For URL validation
const safeUrl = sanitizeUrl(userProvidedUrl);
```

**Allowed HTML tags**:
- Text formatting: `b`, `i`, `em`, `strong`
- Links: `a` (with `href`, `title`, `target` attributes only)
- Structure: `p`, `br`, `ul`, `ol`, `li`, `blockquote`
- Code: `code`, `pre`

All other tags and attributes are stripped.

---

### 4. Input Validation ✅

**Implementation**: [src/lib/validations/auth.ts](src/lib/validations/auth.ts)

Zod schemas validate all user inputs:

```typescript
// Email validation
email: z.string().email("Invalid email address")

// Password validation (client-side)
password: z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")

// Name sanitization
full_name: z.string()
  .min(1, "Full name required")
  .max(100, "Name too long")
  .transform((val) => sanitizeText(val))
```

**Backend validation is authoritative** - client-side validation is for UX only.

---

### 5. Authentication Security ✅

#### 5.1 Token Storage ✅ **UPGRADED TO httpOnly Cookies**

**Current**: httpOnly cookies (✅ SECURE)
**Previous**: localStorage (⚠️ HIGH RISK - Deprecated)

**Implementation**:
- Backend: [somnium_backend/app/domain/auth/router.py](somnium_backend/app/domain/auth/router.py)
- Frontend: [somnium-frontend/src/stores/auth-store.ts](somnium-frontend/src/stores/auth-store.ts)

**Cookie Configuration**:
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,          # Inaccessible to JavaScript
    secure=not DEBUG,       # HTTPS only in production
    samesite="lax",        # CSRF protection
    max_age=900,           # 15 minutes
    path="/"
)
```

**Security Benefits**:
- ✅ Tokens completely inaccessible to JavaScript (XSS protection)
- ✅ Automatic inclusion in requests via browser
- ✅ SameSite protection against CSRF
- ✅ Secure flag ensures HTTPS transmission
- ✅ Automatic expiry and cleanup

#### 5.2 Token Transmission ✅ **UPGRADED TO httpOnly Cookies**

**Current**: Automatic cookie transmission via browser
**Previous**: Authorization header (still supported as fallback)

**Implementation**: [src/server/routers/auth.ts](somnium-frontend/src/server/routers/auth.ts)

```typescript
fetch(url, {
  credentials: "include",  // Automatically includes httpOnly cookies
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken  // CSRF protection
  }
})
```

**Security Benefits**:
- ✅ Tokens never exposed in JavaScript scope
- ✅ Automatic transmission by browser
- ✅ Not logged in server access logs (unlike Authorization header)
- ✅ Not included in Referer headers
- ✅ Protected by CORS and SameSite policies

#### 5.3 Automatic Token Refresh ✅

**Implementation**: [src/hooks/use-token-refresh.ts](src/hooks/use-token-refresh.ts)

- Access tokens expire in 15 minutes
- Automatically refreshed 2 minutes before expiry
- Refresh tokens rotated on each refresh (backend enforced)
- Failed refresh triggers logout

**Usage**:
```typescript
// Included in dashboard layout - runs automatically
useTokenRefresh();
```

---

### 6. SSE (Server-Sent Events) Security ✅

**Implementation**: [src/hooks/use-sse.ts](src/hooks/use-sse.ts)

**Previous vulnerability**: Tokens passed in URL query strings
**Fixed**: Using Authorization headers via fetch API

```typescript
// OLD (INSECURE):
const url = `/vitals/stream?token=${token}`;  // ❌ Exposed in logs

// NEW (SECURE):
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }  // ✅ Not logged
});
```

**Benefits**:
- Tokens not exposed in browser history
- Tokens not logged in server access logs
- Tokens not sent in Referer headers

---

### 7. Rate Limiting (Client-Side) ✅

**Implementation**: [src/lib/security.ts:102-138](src/lib/security.ts:102-138)

Client-side rate limiting to complement backend limits:

```typescript
import { checkRateLimit, clearRateLimit } from "@/lib/security";

// Before submitting login
if (checkRateLimit("login-attempt", 5, 60000)) {
  toast.error("Too many attempts. Please wait.");
  return;
}

// On successful login
clearRateLimit("login-attempt");
```

**Limits recommended**:
- Login: 5 attempts per minute
- Registration: 3 attempts per hour
- Password reset: 3 attempts per hour

**Note**: Backend rate limiting is authoritative.

---

### 8. Role-Based Access Control (RBAC) ✅

**Implementation**: [src/components/auth/auth-guard.tsx](src/components/auth/auth-guard.tsx)

```typescript
<AuthGuard allowedRoles={["physician", "ecmo_specialist"]}>
  <SensitiveComponent />
</AuthGuard>
```

**Roles & Scopes**:
- `nurse`: read:patients, write:vitals, write:labs
- `physician`: read/write patients, vitals, labs, predictions
- `ecmo_specialist`: physician scope + specialization
- `admin`: manage:users, read/write:all

**Backend enforces all access control** - frontend just hides UI elements.

---

### 9. CSRF Protection ✅ **FULLY IMPLEMENTED**

**Status**: Complete CSRF token validation + SameSite cookies

**Backend Implementation**: [somnium_backend/app/main.py](somnium_backend/app/main.py)

```python
# CSRF Protection using fastapi-csrf-protect
from fastapi_csrf_protect import CsrfProtect

@app.get("/api/v1/csrf-token")
async def get_csrf_token(response: Response):
    csrf_token, signed_token = csrf_protect.generate_csrf_tokens()
    response.set_cookie(
        key="csrf_token",
        value=signed_token,
        httponly=False,  # Must be accessible to JavaScript
        secure=not DEBUG,
        samesite="lax"
    )
    return {"csrf_token": csrf_token}

# Validation on protected endpoints
@router.post("/login")
async def login(csrf_protect: CsrfProtect = Depends()):
    await csrf_protect.validate_csrf(request)
    # ... login logic
```

**Frontend Implementation**: [src/hooks/use-csrf.ts](somnium-frontend/src/hooks/use-csrf.ts)

```typescript
// Fetch CSRF token on app load
const csrfToken = await getCsrfToken();

// Include in state-changing requests
fetch(url, {
  method: "POST",
  headers: {
    "X-CSRF-Token": csrfToken
  },
  credentials: "include"
})
```

**Protected Operations**:
- ✅ Login (POST /auth/login)
- ✅ Register (POST /auth/register)
- ✅ Logout (POST /auth/logout)
- ✅ All future mutations

**Multi-Layer CSRF Protection**:
1. ✅ CSRF tokens with double-submit pattern
2. ✅ SameSite=lax cookies
3. ✅ CORS restricted origins
4. ✅ Credentials allowed only from trusted domains
5. ✅ POST requests required for mutations

**CORS Configuration** (backend):
```python
CORS_ORIGINS = ["http://localhost:3000", "https://app.somnium.health"]
allow_credentials=True
allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
```

---

### 10. Environment Variable Security ✅

**Configuration**: [.env.local](.env.local), [.gitignore](.gitignore)

**Public variables** (intentionally exposed to browser):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SSE_URL=http://localhost:8000/api/v1
```

**Security measures**:
- `.env.local` in `.gitignore` ✅
- No secrets in frontend environment variables ✅
- `NEXT_PUBLIC_` prefix for intentionally public vars ✅

**Production setup**:
```bash
NEXT_PUBLIC_API_URL=https://api.somnium.health/api/v1
NEXT_PUBLIC_SSE_URL=https://api.somnium.health/api/v1
```

---

## Security Enhancements Completed ✅

### 1. localStorage Token Storage → httpOnly Cookies ✅ **COMPLETED**

**Issue (Fixed)**: Access tokens were stored in localStorage, vulnerable to XSS attacks.

**Solution Implemented**:
- ✅ Backend creates httpOnly cookies on login
- ✅ Browser automatically includes cookies in requests
- ✅ JavaScript cannot access cookies (XSS protection)
- ✅ SameSite=lax prevents CSRF attacks
- ✅ Automatic token rotation and expiry

**Files Changed**:
- Backend: `somnium_backend/app/domain/auth/router.py`
- Backend: `somnium_backend/app/dependencies/__init__.py`
- Frontend: `somnium-frontend/src/stores/auth-store.ts`
- Frontend: `somnium-frontend/src/server/routers/auth.ts`

---

### 2. CSRF Token Protection ✅ **COMPLETED**

**Issue (Fixed)**: State-changing operations lacked CSRF token validation.

**Solution Implemented**:
- ✅ fastapi-csrf-protect library integrated
- ✅ CSRF token endpoint (`GET /api/v1/csrf-token`)
- ✅ CSRF validation on all mutations (login, register, logout)
- ✅ Frontend CSRF token management hook
- ✅ Multi-layer CSRF protection (tokens + SameSite + CORS)

**Files Changed**:
- Backend: `somnium_backend/app/main.py`
- Backend: `somnium_backend/app/domain/auth/router.py`
- Frontend: `somnium-frontend/src/hooks/use-csrf.ts`
- Frontend: `somnium-frontend/src/server/routers/auth.ts`

---

## Remaining Security Tasks

### 1. Dependency Vulnerabilities 🟢 LOW RISK

**Monitoring**: Run `npm audit` regularly

**Current status**:
```bash
$ npm audit
found 0 vulnerabilities
```

**Process**:
1. Run `npm audit` weekly
2. Update dependencies monthly
3. Review security advisories
4. Test after updates

---

## Security Testing Checklist

### Manual Testing

- [ ] **XSS Prevention**
  ```javascript
  // Test in browser console
  <img src=x onerror=alert('XSS')>
  <script>alert('XSS')</script>
  ```
  Expected: Scripts should not execute

- [ ] **CSP Headers**
  ```bash
  curl -I https://app.somnium.health
  ```
  Expected: All security headers present

- [ ] **Token Refresh**
  1. Login to dashboard
  2. Wait 13 minutes (2 min before expiry)
  3. Check network tab for refresh request
  4. Verify new token received

- [ ] **SSE Security**
  1. Open patient vitals stream
  2. Check network request headers
  3. Verify Authorization header present
  4. Verify no token in URL

- [ ] **Rate Limiting**
  1. Attempt login 6 times rapidly
  2. Verify blocked after 5 attempts
  3. Wait 1 minute
  4. Verify attempts reset

### Automated Testing

```bash
# Security audit
npm audit

# Type checking
npm run type-check

# Linting
npm run lint

# Build check
npm run build
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update `NEXT_PUBLIC_API_URL` to production URL (HTTPS)
- [ ] Update `NEXT_PUBLIC_SSE_URL` to production URL (HTTPS)
- [ ] Verify CSP `connect-src` includes production backend
- [ ] Enable Strict-Transport-Security (HSTS)
- [ ] Configure HTTPS redirect at CDN/load balancer
- [ ] Remove `DEBUG=True` from backend
- [ ] Run security audit: `npm audit`
- [ ] Test all authentication flows
- [ ] Verify token refresh works

### Post-Deployment

- [ ] Verify security headers in production
- [ ] Test CSP doesn't block legitimate resources
- [ ] Monitor error logs for CSP violations
- [ ] Test SSE connections work with HTTPS
- [ ] Verify CORS allows production frontend
- [ ] Test token refresh timing
- [ ] Audit access logs for anomalies

---

## Security Incident Response

### XSS Attack Detected

1. **Immediate**: Block malicious script source in CSP
2. **Investigate**: Check audit logs for injection point
3. **Patch**: Sanitize affected input field
4. **Verify**: Add test case to prevent regression
5. **Document**: Update security review

### Authentication Bypass

1. **Immediate**: Revoke all active sessions
2. **Investigate**: Check backend auth logs
3. **Patch**: Fix authentication logic
4. **Notify**: Inform affected users
5. **Audit**: Full security review

### Token Theft

1. **Immediate**: Rotate SECRET_KEY (invalidates all tokens)
2. **Investigate**: Check for XSS vulnerabilities
3. **Notify**: Force re-authentication for all users
4. **Enhance**: Implement IP binding or device fingerprinting
5. **Monitor**: Watch for unusual access patterns

---

## Compliance Mapping

### HIPAA Technical Safeguards

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Access Control | RBAC + JWT tokens | ✅ |
| Audit Controls | Backend audit logs | ✅ |
| Integrity | CSP + input validation | ✅ |
| Transmission Security | HTTPS + TLS 1.3 | ✅ (prod) |
| Authentication | JWT + token rotation | ✅ |

### SOC 2 Type II Controls

| Control | Implementation | Evidence |
|---------|----------------|----------|
| CC6.1 Logical Access | AuthGuard + RBAC | [auth-guard.tsx](src/components/auth/auth-guard.tsx) |
| CC6.6 Encryption | HTTPS + secure headers | [next.config.ts](next.config.ts) |
| CC7.2 Monitoring | Audit logs + error tracking | Backend implementation |
| CC8.1 Change Management | Git + PR reviews | GitHub |

---

## Security Contact

**Security Issues**: Report to security@somnium.health
**Vulnerability Disclosure**: Follow responsible disclosure policy

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2026-01-03 | **MAJOR**: httpOnly cookies + CSRF protection implemented |
| 2.0.0 | 2026-01-02 | Security hardening: CSP, DOMPurify, SSE fix, token refresh |
| 1.0.0 | 2025-12-XX | Initial implementation |

---

## Additional Resources

- [Backend Security Documentation](SECURITY.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
