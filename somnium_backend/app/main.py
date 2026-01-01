"""
Somnium ECMO Platform - Main FastAPI Application
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.exceptions import (
    SomniumException,
    somnium_exception_handler,
    validation_exception_handler,
    integrity_exception_handler,
    general_exception_handler,
)


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
    print(f"📊 Initializing database connection...")
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(SomniumException, somnium_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)


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
