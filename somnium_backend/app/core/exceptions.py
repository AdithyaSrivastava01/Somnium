"""
Custom exceptions and error handlers.
"""

from typing import Any, Dict
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError


class SomniumException(Exception):
    """Base exception for Somnium application."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class AuthenticationError(SomniumException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(SomniumException):
    """Raised when user doesn't have permission."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class NotFoundError(SomniumException):
    """Raised when resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class ConflictError(SomniumException):
    """Raised when there's a conflict (e.g., duplicate entry)."""

    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)


class ValidationError(SomniumException):
    """Raised when validation fails."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)


async def somnium_exception_handler(
    request: Request, exc: SomniumException
) -> JSONResponse:
    """Handle custom Somnium exceptions."""
    content = {"error": exc.message, "type": exc.__class__.__name__}
    if exc.error_code:
        content["error_code"] = exc.error_code
    return JSONResponse(
        status_code=exc.status_code,
        content=content,
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "details": exc.errors(),
        },
    )


async def integrity_exception_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    """Handle database integrity errors."""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": "Database integrity error",
            "details": "The operation conflicts with existing data (e.g., duplicate entry)",
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "details": str(exc) if settings.DEBUG else "An unexpected error occurred",
        },
    )


from app.core.config import settings
