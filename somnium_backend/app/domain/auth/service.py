"""
Authentication business logic and service layer.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.models import User, UserRole
from app.domain.auth.schemas import LoginResponse, UserResponse, TokenResponse
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import SomniumException


class AuthService:
    """Authentication service for user login and token management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_user(self, email: str, password: str) -> User | None:
        """
        Authenticate a user by email and password.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User if authenticated, None otherwise
        """
        stmt = select(User).where(User.email == email, User.is_active == True)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def login(
        self, email: str, password: str, role: UserRole, remember_me: bool = False
    ) -> LoginResponse:
        """
        Login user and generate tokens.

        Args:
            email: User email
            password: User password
            role: User role for verification
            remember_me: Whether to extend token expiration times

        Returns:
            LoginResponse with user info and tokens

        Raises:
            SomniumException: If credentials are invalid or role mismatch
        """
        user = await self.authenticate_user(email, password)
        if not user:
            raise SomniumException(
                status_code=401,
                message="Incorrect email or password",
                error_code="INVALID_CREDENTIALS",
            )

        # Verify role matches
        if user.role != role:
            raise SomniumException(
                status_code=403,
                message=f"Role mismatch. This account is registered as {user.role.value}, not {role.value}",
                error_code="ROLE_MISMATCH",
            )

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)

        # Create tokens with extended expiration if remember_me is True
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}

        if remember_me:
            # Extended expiration: 30 days for access token, 90 days for refresh token
            access_token = create_access_token(
                token_data, expires_delta=timedelta(days=30)
            )
            refresh_token = create_refresh_token(
                token_data, expires_delta=timedelta(days=90)
            )
        else:
            # Default expiration from settings
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)

        return LoginResponse(
            user=UserResponse.model_validate(user),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
            ),
        )

    async def refresh_access_token(self, refresh_token: str) -> str:
        """
        Generate new access token from refresh token.

        Args:
            refresh_token: JWT refresh token

        Returns:
            New access token

        Raises:
            SomniumException: If refresh token is invalid
        """
        try:
            payload = decode_token(refresh_token)

            # Verify it's a refresh token
            if payload.get("type") != "refresh":
                raise SomniumException(
                    status_code=401,
                    message="Invalid token type",
                    error_code="INVALID_TOKEN_TYPE",
                )

            # Verify user still exists and is active
            user_id = UUID(payload.get("sub"))
            stmt = select(User).where(User.id == user_id, User.is_active == True)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()

            if not user:
                raise SomniumException(
                    status_code=401,
                    message="User not found or inactive",
                    error_code="USER_NOT_FOUND",
                )

            # Create new access token
            token_data = {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value,
            }
            access_token = create_access_token(token_data)

            return access_token

        except Exception as e:
            if isinstance(e, SomniumException):
                raise
            # Log the actual error for debugging
            print(f"Refresh token error: {type(e).__name__}: {str(e)}")
            raise SomniumException(
                status_code=401,
                message="Invalid or expired refresh token",
                error_code="INVALID_REFRESH_TOKEN",
            )

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """
        Get user by ID.

        Args:
            user_id: User UUID

        Returns:
            User if found, None otherwise
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        password: str,
        full_name: str,
        role: UserRole,
        department: str | None = None,
    ) -> User:
        """
        Create a new user.

        Args:
            email: User email
            password: Plain text password
            full_name: User's full name
            role: User role
            department: Optional department

        Returns:
            Created user

        Raises:
            SomniumException: If email already exists
        """
        # Check if email exists
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise SomniumException(
                status_code=400,
                message="Email already registered",
                error_code="EMAIL_EXISTS",
            )

        # Create user
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=role,
            department=department,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user
