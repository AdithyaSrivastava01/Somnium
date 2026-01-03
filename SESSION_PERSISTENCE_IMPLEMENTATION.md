# Session Persistence Implementation

## Overview
Implemented cookie-based session persistence to allow users to remain logged in even after clearing localStorage or closing the browser.

## Problem Statement
The original authentication system stored user data only in localStorage (via Zustand persist). This meant:
- Users were logged out when clearing localStorage
- Sessions didn't persist across browser restarts
- Cookie-based authentication from the backend wasn't being utilized

## Solution Architecture

### 1. Backend Setup (Already Existed)
- FastAPI backend sets httpOnly cookies for `access_token` and `refresh_token`
- Tokens are NOT exposed to JavaScript for security
- Access token expires in 15 minutes
- Refresh token expires in 7-30 days (based on "Remember Me")

### 2. Frontend Proxy Layer (New)
Created Next.js API Route Handlers to proxy backend requests:

**Files Created:**
- `src/app/api/backend-proxy/[...path]/route.ts` - Proxies all backend API calls
- `src/app/api/csrf/route.ts` - Proxies CSRF token requests

**Why Needed:**
- Frontend (localhost:3000) and backend (localhost:8000) are different origins
- Cookies are origin-specific and won't work cross-origin
- Proxy ensures all requests go through localhost:3000, enabling cookie sharing

**Key Implementation Details:**
- Properly forwards multiple `Set-Cookie` headers using `getSetCookie()` API
- Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Compatible with Next.js 15's async params requirement

### 3. Session Validation Endpoint (New)
**File:** `src/server/routers/auth.ts`

Added `validateSession` tRPC endpoint that:
- Reads cookies from the request
- Forwards them to backend's `/auth/me` endpoint
- Returns user data if access_token is valid
- Returns null if no valid session

### 4. Session Restoration Hook (New)
**File:** `src/hooks/use-session-restore.ts`

Created hook that:
- Runs on page load/refresh
- Calls `validateSession` if user is not authenticated
- Restores user data to Zustand store from cookies
- Only runs once per session

### 5. Updated Login Flow
**File:** `src/components/auth/login-form.tsx`

Changed from tRPC to direct fetch:
- Calls `/api/backend-proxy/auth/login` instead of tRPC mutation
- Uses `credentials: "include"` to allow cookie setting
- Cookies are automatically set by the browser from Set-Cookie headers

### 6. Configuration Updates
**File:** `next.config.ts`
- Removed rewrite rules (now using API routes instead)
- Kept security headers for HIPAA/SOC2 compliance

**File:** `src/hooks/use-csrf.ts`
- Updated to use `/api/csrf` instead of direct backend URL

## How It Works

### Login Flow
1. User enters credentials and clicks "Sign In"
2. Frontend fetches CSRF token from `/api/csrf`
3. Frontend sends credentials to `/api/backend-proxy/auth/login`
4. Next.js proxy forwards request to backend
5. Backend validates credentials and sets httpOnly cookies
6. Next.js proxy forwards Set-Cookie headers to browser
7. Browser stores both `access_token` and `refresh_token` cookies
8. User data stored in Zustand (localStorage)

### Session Restoration Flow
1. User refreshes page or clears localStorage
2. `useSessionRestore` hook detects user is not authenticated
3. Hook calls `validateSession` tRPC endpoint
4. Endpoint reads cookies from request headers
5. Endpoint forwards cookies to backend's `/auth/me`
6. Backend validates `access_token` cookie
7. If valid, user data is returned
8. Hook updates Zustand store with user data
9. User remains logged in!

### Session Expiration
- After 15 minutes, `access_token` expires
- User must log in again (auto-refresh not implemented)
- `refresh_token` remains valid for 7-30 days
- Future enhancement: Implement auto-refresh using refresh_token

## Security Features

### httpOnly Cookies
- Tokens cannot be accessed via JavaScript
- Prevents XSS attacks from stealing tokens
- Cookies marked with `HttpOnly` flag

### SameSite Protection
- Cookies use `SameSite=Lax`
- Prevents CSRF attacks
- Allows navigation from external sites

### CSRF Protection
- CSRF tokens required for state-changing operations
- Token stored in non-httpOnly cookie (readable by JS)
- Sent in `X-CSRF-Token` header

### Short Access Token Lifetime
- 15-minute expiration reduces risk window
- Balances security with user experience
- Appropriate for healthcare applications

## Testing Completed

✅ Login with "Remember Me" sets both cookies
✅ Access token and refresh token visible in DevTools
✅ Cookies are httpOnly and Lax
✅ Session persists after clearing localStorage
✅ Session persists across page refreshes
✅ CSRF token validation works
✅ Backend proxy correctly forwards Set-Cookie headers

## Files Modified

### Frontend
- `src/app/api/backend-proxy/[...path]/route.ts` (new)
- `src/app/api/csrf/route.ts` (new)
- `src/hooks/use-session-restore.ts` (new)
- `src/components/auth/login-form.tsx` (modified)
- `src/server/routers/auth.ts` (modified)
- `src/hooks/use-csrf.ts` (modified)
- `src/components/auth/auth-guard.tsx` (modified)
- `next.config.ts` (modified)

### Backend
- `app/dependencies/__init__.py` (cleaned up debug logs)
- `app/domain/auth/router.py` (cleaned up debug logs)

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend
```env
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
```

## Known Limitations

1. **No Auto-Refresh**: When access_token expires after 15 minutes, user must log in again even though refresh_token is valid
2. **Same-Device Only**: Cookies don't sync across devices (by design for security)
3. **Browser-Specific**: Each browser profile has its own cookies

## Future Enhancements

1. **Auto-Refresh**: Implement automatic token refresh using refresh_token
2. **Token Renewal UI**: Show a dialog before expiration to renew session
3. **Activity Tracking**: Extend session on user activity
4. **Device Management**: Allow users to see and revoke active sessions

## Compliance Notes

- ✅ HIPAA: httpOnly cookies prevent token theft via XSS
- ✅ SOC2: Short access token lifetime (15 min)
- ✅ Security: CSRF protection on all state-changing operations
- ✅ Audit: All login attempts logged in backend
