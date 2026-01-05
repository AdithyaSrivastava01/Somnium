"""
Authentication request/response schemas.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.domain.auth.models import UserRole
from app.core.validators import validate_password_strength, sanitize_string_input


# Request Schemas
class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, max_length=128, description="User password"
    )
    role: UserRole = Field(..., description="User role for verification")
    remember_me: bool = Field(default=False, description="Remember user login")


class RegisterRequest(BaseModel):
    """Register request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, max_length=128, description="User password"
    )
    full_name: str = Field(
        ..., min_length=2, max_length=100, description="User full name"
    )
    role: UserRole = Field(..., description="User role")
    department: str | None = Field(None, max_length=100, description="User department")
    hospital_id: UUID = Field(..., description="Hospital UUID")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength meets security requirements."""
        return validate_password_strength(v)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Sanitize full name to prevent XSS."""
        return sanitize_string_input(v, max_length=100, field_name="Full name")

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str | None) -> str | None:
        """Sanitize department to prevent XSS."""
        if v:
            return sanitize_string_input(v, max_length=100, field_name="Department")
        return v


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
    hospital_id: UUID
    is_active: bool
    created_at: datetime
    last_login: datetime | None

    class Config:
        from_attributes = True


class HospitalResponse(BaseModel):
    """Hospital response schema."""

    id: UUID
    name: str
    city: str
    state: str
    email_domain: str
    created_at: datetime

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
    """Refresh token response schema with token rotation."""

    access_token: str
    refresh_token: str  # New refresh token after rotation
    token_type: str = "bearer"
