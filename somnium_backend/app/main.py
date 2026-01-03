"""
Somnium ECMO Platform - Main FastAPI Application
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import CsrfProtectError
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.exceptions import (
    SomniumException,
    somnium_exception_handler,
    validation_exception_handler,
    integrity_exception_handler,
    general_exception_handler,
)


# CSRF Settings
class CsrfSettings(BaseModel):
    """CSRF protection settings."""

    secret_key: str = settings.CSRF_SECRET_KEY or settings.SECRET_KEY
    cookie_key: str = (
        settings.CSRF_COOKIE_NAME
    )  # Library expects 'cookie_key' not 'cookie_name'
    header_name: str = settings.CSRF_HEADER_NAME
    cookie_samesite: str = "lax"
    cookie_secure: bool = not settings.DEBUG
    httponly: bool = False  # CSRF token needs to be accessible by JS
    max_age: int = 3600  # 1 hour


@CsrfProtect.load_config
def get_csrf_config():
    """Load CSRF configuration."""
    return CsrfSettings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses for HIPAA/SOC2 compliance.
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Enable XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Force HTTPS (max-age = 1 year)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions policy (disable unnecessary features)
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        return response


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/hour"])


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for startup and shutdown events.

    Handles:
    - Database initialization on startup
    - Database connection cleanup on shutdown
    """
    # Startup
    print("🚀 Starting Somnium ECMO Platform...")
    print("📊 Initializing database connection...")
    await init_db()
    print("✅ Database initialized successfully")
    print(f"🌐 CORS enabled for origins: {settings.CORS_ORIGINS}")
    print(f"🔒 Security: JWT with {settings.ALGORITHM}")
    print("✨ Somnium backend ready!")

    yield

    # Shutdown
    print("🛑 Shutting down Somnium platform...")
    await close_db()
    print("✅ Database connections closed")
    print("👋 Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ECMO Patient Survivability Prediction Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Security Middleware (order matters!)
# 1. HTTPS Redirect (only in production)
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)

# 2. Trusted Host (prevent Host header attacks)
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
# )

# 3. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 4. CORS Middleware (more restrictive)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # Explicit methods only
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "X-CSRF-Token",
    ],  # Include CSRF token header
    expose_headers=["X-Total-Count"],  # Only expose what's needed
    max_age=600,  # Cache preflight for 10 minutes
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Exception Handlers
app.add_exception_handler(SomniumException, somnium_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)


# CSRF Exception Handler
@app.exception_handler(CsrfProtectError)
async def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    """Handle CSRF protection errors."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": "CSRF token validation failed"},
    )


# Health Check Endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check endpoint",
    status_code=status.HTTP_200_OK,
)
async def health_check() -> JSONResponse:
    """
    Health check endpoint to verify the API is running.

    Returns:
        JSONResponse: Status and version information
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> dict:
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Somnium ECMO Platform API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health",
    }


# CSRF Token Endpoint
@app.get(
    "/api/v1/csrf-token",
    tags=["Security"],
    summary="Get CSRF token",
    description="Get CSRF token for form submissions",
)
async def get_csrf_token(request: Request, response: Response):
    """
    Get CSRF token and set it in a cookie.

    Returns:
        CSRF token that should be included in X-CSRF-Token header
    """
    csrf_protect = CsrfProtect()
    csrf_token, signed_token = csrf_protect.generate_csrf_tokens()

    # Set CSRF token in cookie
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=signed_token,
        max_age=3600,  # 1 hour
        httponly=False,  # Must be accessible by JavaScript
        secure=not settings.DEBUG,
        samesite="lax",
        path="/",
    )

    return {"csrf_token": csrf_token}


# Register domain routers
from app.domain.auth.router import router as auth_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

# TODO: Register additional domain routers
# from app.domain.patients.router import router as patients_router
# from app.domain.vitals.router import router as vitals_router
# from app.domain.labs.router import router as labs_router
# from app.domain.alerts.router import router as alerts_router
# from app.domain.prediction.router import router as prediction_router
# from app.domain.digital_twin.router import router as digital_twin_router
# from app.domain.dashboard.router import router as dashboard_router
# from app.domain.chatbot.router import router as chatbot_router

# app.include_router(patients_router, prefix="/api/v1/patients", tags=["Patients"])
# app.include_router(vitals_router, prefix="/api/v1", tags=["Vitals"])
# app.include_router(labs_router, prefix="/api/v1", tags=["Labs"])
# app.include_router(alerts_router, prefix="/api/v1", tags=["Alerts"])
# app.include_router(prediction_router, prefix="/api/v1", tags=["Predictions"])
# app.include_router(digital_twin_router, prefix="/api/v1", tags=["Digital Twin"])
# app.include_router(dashboard_router, prefix="/api/v1", tags=["Dashboard"])
# app.include_router(chatbot_router, prefix="/api/v1/chat", tags=["Chatbot"])
