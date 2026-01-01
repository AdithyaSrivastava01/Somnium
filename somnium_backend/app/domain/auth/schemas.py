"""
Authentication request/response schemas.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from app.domain.auth.models import UserRole


# Request Schemas
class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    role: UserRole = Field(..., description="User role for verification")
    remember_me: bool = Field(default=False, description="Remember user login")


class RegisterRequest(BaseModel):
    """Register request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    full_name: str = Field(..., min_length=2, description="User full name")
    role: UserRole = Field(..., description="User role")
    department: str | None = Field(None, description="User department")


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str = Field(..., description="JWT refresh token")


# Response Schemas
class UserResponse(BaseModel):
    """User response schema."""

    id: UUID
    email: str
    full_name: str
    role: UserRole
    department: str | None
    is_active: bool
    created_at: datetime
    last_login: datetime | None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Login response schema."""

    user: UserResponse
    tokens: TokenResponse


class RefreshTokenResponse(BaseModel):
    """Refresh token response schema."""

    access_token: str
    token_type: str = "bearer"
