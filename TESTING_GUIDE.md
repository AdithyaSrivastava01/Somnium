# Somnium ECMO Platform - Testing Guide
**httpOnly Cookies & CSRF Protection**

## 🚀 Quick Start Testing

### 1. Start Backend (Docker)
```bash
cd somnium_backend
docker-compose up -d
```

Wait for the database to be ready, then run migrations:
```bash
docker-compose exec backend uv run alembic upgrade head
```

### 2. Load Test Users
```bash
docker-compose exec -T db psql -U somnium -d somnium_db < test_users.sql
```

**Test Credentials:**
| Email | Password | Role |
|-------|----------|------|
| `admin@hospital.com` | `TestPassword123!` | Admin |
| `ecmo@hospital.com` | `TestPassword123!` | ECMO Specialist |
| `physician@hospital.com` | `TestPassword123!` | Physician |
| `nurse@hospital.com` | `TestPassword123!` | Nurse |

### 3. Start Frontend
```bash
cd ../somnium-frontend
npm run dev
```

Access at: http://localhost:3000

---

## 🔐 Understanding Token Storage

### Where Are My Tokens NOW?

**Browser Cookies (httpOnly)** - Check in DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Cookies** → `http://localhost:3000`
4. You'll see:
   - `access_token` (httpOnly: ✓, expires in 15 min)
   - `refresh_token` (httpOnly: ✓, expires in 7-30 days)
   - `csrf_token` (httpOnly: ✗, readable by JavaScript)

**Important:** You can SEE the cookies in DevTools, but JavaScript CANNOT read `access_token` or `refresh_token` due to httpOnly flag.

### What's in localStorage?

**Only user information** - Check in DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:3000`
4. Look for key: `somnium-auth`
5. Contains:
```json
{
  "state": {
    "user": {
      "id": "...",
      "email": "nurse@hospital.com",
      "full_name": "Sarah Johnson",
      "role": "nurse",
      "department": "ICU"
    },
    "isAuthenticated": true
  }
}
```

**No tokens in localStorage!** This is secure ✅

---

## 🔄 Login/Logout Workflow

### Login Flow (Step-by-Step)

**User Action:** Enter credentials and click "Sign In"

**What Happens:**

1. **Frontend fetches CSRF token** ([use-csrf.ts:17-25](somnium-frontend/src/hooks/use-csrf.ts))
   ```typescript
   GET /api/v1/csrf-token
   ```
   Response: Sets `csrf_token` cookie + returns token value

2. **Frontend sends login request** ([auth.ts:17-30](somnium-frontend/src/server/routers/auth.ts))
   ```typescript
   POST /api/v1/auth/login
   Headers:
     Content-Type: application/json
     X-CSRF-Token: <csrf_token>
   Credentials: include
   Body:
     { email, password, role, remember_me }
   ```

3. **Backend validates CSRF token** ([auth/router.py:59-60](somnium_backend/app/domain/auth/router.py))
   ```python
   await csrf_protect.validate_csrf(request)
   ```

4. **Backend validates credentials**
   - Checks email + password
   - Verifies role matches user's role
   - Creates JWT tokens

5. **Backend sets httpOnly cookies** ([auth/router.py:71-88](somnium_backend/app/domain/auth/router.py))
   ```python
   response.set_cookie(
       key="access_token",
       value=access_token,
       httponly=True,
       secure=False,  # True in production
       samesite="lax",
       max_age=900  # 15 minutes
   )
   response.set_cookie(
       key="refresh_token",
       value=refresh_token,
       httponly=True,
       secure=False,
       samesite="lax",
       max_age=604800  # 7 days (or 30 with remember_me)
   )
   ```

6. **Backend returns user info only** (no tokens in JSON)
   ```json
   {
     "id": "...",
     "email": "nurse@hospital.com",
     "full_name": "Sarah Johnson",
     "role": "nurse",
     "department": "ICU"
   }
   ```

7. **Frontend stores user in Zustand** ([login-form.tsx:58-60](somnium-frontend/src/components/auth/login-form.tsx))
   ```typescript
   setAuth(user);  // Only user data, NO tokens
   ```

8. **Redirect to dashboard**

**Result:**
- ✅ Cookies set (invisible to JavaScript)
- ✅ User data in localStorage
- ✅ User redirected to dashboard

---

### Logout Flow (Step-by-Step)

**User Action:** Click "Logout" button

**What Happens:**

1. **Frontend fetches CSRF token** (if not cached)

2. **Frontend sends logout request** ([auth.ts:100-119](somnium-frontend/src/server/routers/auth.ts))
   ```typescript
   POST /api/v1/auth/logout
   Headers:
     X-CSRF-Token: <csrf_token>
   Credentials: include  // Sends cookies automatically
   ```

3. **Backend validates CSRF token** ([auth/router.py:287](somnium_backend/app/domain/auth/router.py))

4. **Backend revokes refresh token** in database

5. **Backend deletes cookies** ([auth/router.py:297-298](somnium_backend/app/domain/auth/router.py))
   ```python
   response.delete_cookie(key="access_token", path="/")
   response.delete_cookie(key="refresh_token", path="/")
   ```

6. **Frontend clears local state** ([main-layout.tsx:34-36](somnium-frontend/src/components/layout/main-layout.tsx))
   ```typescript
   logout();           // Clears Zustand state
   clearCsrfToken();   // Clears cached CSRF token
   router.push("/auth");
   ```

**Result:**
- ✅ Cookies deleted
- ✅ localStorage cleared
- ✅ User redirected to login

---

## 🔁 Remember Me Feature

### How It Works

**Checkbox on Login:**
```tsx
<Checkbox checked={rememberMe} />
```

**Backend Behavior:**

**Without "Remember Me" (default):**
```python
refresh_max_age = 7 * 24 * 60 * 60  # 7 days
```

**With "Remember Me" checked:**
```python
refresh_max_age = 30 * 24 * 60 * 60  # 30 days
```

**Implementation:** [auth/router.py:66-68](somnium_backend/app/domain/auth/router.py)
```python
refresh_max_age = (
    30 * 24 * 60 * 60 if login_data.remember_me else 7 * 24 * 60 * 60
)
```

### Testing Remember Me

1. **Login without "Remember Me":**
   - Refresh token cookie expires in **7 days**
   - Check cookie expiry in DevTools

2. **Login with "Remember Me" checked:**
   - Refresh token cookie expires in **30 days**
   - Check cookie expiry in DevTools

3. **Session Behavior:**
   - Access token always expires in 15 minutes
   - Auto-refresh happens every 13 minutes (2 min before expiry)
   - If refresh token expires, user must login again

---

## 🧪 Testing Checklist

### 1. Login Flow
- [ ] Open browser DevTools (F12)
- [ ] Go to http://localhost:3000/auth
- [ ] **Network Tab:** Clear all requests
- [ ] Login with: `nurse@hospital.com` / `TestPassword123!`
- [ ] **Verify:**
  - ✅ See `GET /api/v1/csrf-token` request
  - ✅ See `POST /api/v1/auth/login` request with `X-CSRF-Token` header
  - ✅ Login response returns only user data (no tokens)
  - ✅ Cookies tab shows `access_token`, `refresh_token`, `csrf_token`
  - ✅ Both auth tokens have httpOnly flag
  - ✅ localStorage shows user data only
  - ✅ Redirected to dashboard

### 2. Authenticated Requests
- [ ] After login, navigate dashboard
- [ ] **Network Tab:** Check any API request
- [ ] **Verify:**
  - ✅ Request automatically includes Cookie header
  - ✅ Cookie header contains access_token
  - ✅ No Authorization header (cookies used instead)

### 3. Token Refresh (Wait 13 minutes)
- [ ] Stay logged in for 13 minutes
- [ ] **Network Tab:** Watch for refresh request
- [ ] **Verify:**
  - ✅ See `POST /api/v1/auth/refresh` request
  - ✅ Request includes refresh_token cookie
  - ✅ Response sets new cookies
  - ✅ Session continues without interruption

### 4. Logout Flow
- [ ] Click "Logout" button
- [ ] **Verify:**
  - ✅ See `POST /api/v1/auth/logout` request with `X-CSRF-Token`
  - ✅ Cookies deleted (check Application → Cookies)
  - ✅ localStorage cleared
  - ✅ Redirected to login page

### 5. Remember Me Feature
- [ ] Login with "Remember Me" **unchecked**
- [ ] Check `refresh_token` cookie expiry → **7 days**
- [ ] Logout
- [ ] Login with "Remember Me" **checked**
- [ ] Check `refresh_token` cookie expiry → **30 days**

### 6. CSRF Protection
- [ ] Open browser console
- [ ] Try to make a login request without CSRF token:
```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'nurse@hospital.com',
    password: 'TestPassword123!',
    role: 'nurse'
  })
})
```
- [ ] **Verify:**
  - ✅ Request fails with 403 Forbidden
  - ✅ Error: "CSRF token validation failed"

### 7. XSS Protection (Token Access)
- [ ] Login successfully
- [ ] Open browser console
- [ ] Try to access tokens:
```javascript
// Try to read access token
document.cookie.split(';').find(c => c.includes('access_token'))
// Result: undefined or hidden value (httpOnly protection)

// Try from localStorage
localStorage.getItem('somnium-auth')
// Result: Only user data, NO tokens ✅
```
- [ ] **Verify:**
  - ✅ Cannot access tokens via JavaScript
  - ✅ Only user data visible

---

## 🐛 Common Issues & Solutions

### Issue 1: "CSRF token validation failed"
**Cause:** Frontend didn't fetch CSRF token before login

**Solution:**
- Check Network tab for `GET /api/v1/csrf-token` request
- Should happen automatically on app load
- If missing, refresh the page

### Issue 2: Cookies not being set
**Cause:** CORS configuration mismatch

**Check:**
1. Backend `.env`: `CORS_ORIGINS=["http://localhost:3000"]`
2. Frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
3. Both must use same protocol (http/https)

**Solution:**
```bash
# Backend
CORS_ORIGINS=["http://localhost:3000"]

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Issue 3: "Not authenticated" after login
**Cause:** Cookies not being sent with requests

**Check:**
- All fetch calls must include `credentials: 'include'`
- CORS must have `allow_credentials=True`

**Solution:** Already implemented ✅

### Issue 4: Auto-refresh not working
**Cause:** `useTokenRefresh` hook not running

**Check:**
- Dashboard layout includes the hook
- User is marked as authenticated in Zustand

**Solution:** Already implemented in dashboard layout ✅

---

## 📊 Viewing Cookies in Different Browsers

### Chrome/Edge
1. F12 → Application → Cookies → http://localhost:3000
2. You'll see all cookies with flags

### Firefox
1. F12 → Storage → Cookies → http://localhost:3000
2. Shows httpOnly flag

### Safari
1. Develop → Show Web Inspector → Storage → Cookies

---

## 🎯 Production Checklist

Before deploying:

- [ ] Update `.env` with production URLs
- [ ] Set `DEBUG=False` in backend
- [ ] Use HTTPS for both frontend and backend
- [ ] Update CORS_ORIGINS to production domain
- [ ] Verify `secure=True` flag on cookies (automatic when DEBUG=False)
- [ ] Test login/logout on production domain
- [ ] Verify cookies work across subdomains if needed

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs: `docker-compose logs -f backend`
3. Verify database connection: `docker-compose ps`
4. Check CORS settings match between frontend/backend
