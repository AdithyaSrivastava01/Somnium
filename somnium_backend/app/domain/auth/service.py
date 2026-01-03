"""
Authentication business logic and service layer with HIPAA/SOC2 security controls.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.models import User, UserRole, RefreshToken
from app.domain.auth.schemas import LoginResponse, UserResponse, TokenResponse
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import SomniumException
from app.core.audit import AuditService, hash_token


class AuthService:
    """
    Authentication service with security controls:
    - Account lockout after failed attempts
    - Audit logging for all auth events
    - Refresh token rotation
    - Password change invalidation
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit_service = AuditService(db)

    async def login(
        self,
        email: str,
        password: str,
        role: UserRole,
        remember_me: bool = False,
        ip_address: str = "unknown",
        user_agent: str | None = None,
    ) -> LoginResponse:
        """
        Login user with account lockout protection and audit logging.

        Args:
            email: User email
            password: User password
            role: User role for verification
            remember_me: Whether to extend refresh token expiration
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            LoginResponse with user info and tokens

        Raises:
            SomniumException: If credentials invalid, account locked, or role mismatch
        """
        # Get user
        stmt = select(User).where(User.email == email, User.is_active == True)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Log failed attempt
            await self.audit_service.log_authentication(
                event_type="login_failed",
                user_id=None,
                status="failure",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"reason": "user_not_found", "email": email},
            )
            raise SomniumException("Invalid credentials", 401, "INVALID_CREDENTIALS")

        # SECURITY: Check if account is locked
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            minutes_left = (
                user.locked_until - datetime.now(timezone.utc)
            ).seconds // 60
            await self.audit_service.log_authentication(
                event_type="login_blocked",
                user_id=user.id,
                status="failure",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"reason": "account_locked", "minutes_remaining": minutes_left},
            )
            raise SomniumException(
                f"Account locked. Try again in {minutes_left} minutes",
                423,
                "ACCOUNT_LOCKED",
            )

        # Verify password
        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1

            # Lock account after 5 failed attempts (15 minute lockout)
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
                await self.audit_service.log_security_event(
                    event_type="account_locked",
                    user_id=user.id,
                    ip_address=ip_address,
                    details={
                        "reason": "too_many_failed_attempts",
                        "lockout_duration_minutes": 15,
                    },
                )

            await self.db.commit()

            await self.audit_service.log_authentication(
                event_type="login_failed",
                user_id=user.id,
                status="failure",
                ip_address=ip_address,
                user_agent=user_agent,
                details={
                    "reason": "invalid_password",
                    "attempts": user.failed_login_attempts,
                },
            )
            raise SomniumException("Invalid credentials", 401, "INVALID_CREDENTIALS")

        # Verify role matches
        if user.role != role:
            await self.audit_service.log_authentication(
                event_type="login_failed",
                user_id=user.id,
                status="failure",
                ip_address=ip_address,
                user_agent=user_agent,
                details={
                    "reason": "role_mismatch",
                    "expected": role.value,
                    "actual": user.role.value,
                },
            )
            raise SomniumException(
                403,
                f"Role mismatch. This account is {user.role.value}, not {role.value}",
                "ROLE_MISMATCH",
            )

        # SUCCESS - Reset failed attempts and update login info
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.now(timezone.utc)
        user.last_login_ip = ip_address

        # Create tokens with password_changed_at for invalidation
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "pwd_changed_at": user.password_changed_at.isoformat(),
        }

        # Access token always short-lived (15 minutes)
        access_token = create_access_token(token_data)

        # Refresh token expiration based on remember_me
        if remember_me:
            refresh_token_str = create_refresh_token(
                token_data, expires_delta=timedelta(days=30)
            )
            expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        else:
            refresh_token_str = create_refresh_token(token_data)
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        # SECURITY: Store refresh token in database for rotation tracking
        refresh_token_record = RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token_str),
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(refresh_token_record)

        await self.db.commit()
        await self.db.refresh(user)

        # Log successful login
        await self.audit_service.log_authentication(
            event_type="login_success",
            user_id=user.id,
            status="success",
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return LoginResponse(
            user=UserResponse.model_validate(user),
            tokens=TokenResponse(
                access_token=access_token, refresh_token=refresh_token_str
            ),
        )

    async def refresh_access_token(
        self,
        refresh_token_str: str,
        ip_address: str = "unknown",
        user_agent: str | None = None,
    ) -> dict:
        """
        Generate new access token AND rotate refresh token for security.

        Token rotation prevents token replay attacks. If a token is reused,
        all user tokens are revoked.

        Args:
            refresh_token_str: JWT refresh token
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            Dict with new access_token and refresh_token

        Raises:
            SomniumException: If refresh token invalid, expired, or reused
        """
        try:
            payload = decode_token(refresh_token_str)

            # Verify it's a refresh token
            if payload.get("type") != "refresh":
                raise SomniumException("Invalid token type", 401, "INVALID_TOKEN_TYPE")

            # SECURITY: Check if token exists and is not revoked
            token_hash = hash_token(refresh_token_str)
            stmt = select(RefreshToken).where(
                RefreshToken.token_hash == token_hash, RefreshToken.revoked == False
            )
            result = await self.db.execute(stmt)
            stored_token = result.scalar_one_or_none()

            if not stored_token:
                # TOKEN REUSE DETECTED - Possible theft, revoke ALL user tokens
                user_id = UUID(payload.get("sub"))
                stmt = select(RefreshToken).where(
                    RefreshToken.user_id == user_id, RefreshToken.revoked == False
                )
                result = await self.db.execute(stmt)
                user_tokens = result.scalars().all()

                for token in user_tokens:
                    token.revoked = True
                    token.revoked_at = datetime.now(timezone.utc)

                await self.db.commit()

                await self.audit_service.log_security_event(
                    event_type="token_reuse_detected",
                    user_id=user_id,
                    ip_address=ip_address,
                    details={"action": "all_tokens_revoked"},
                )

                raise SomniumException(
                    401,
                    "Token reuse detected - all sessions invalidated",
                    "TOKEN_REUSE",
                )

            # Check expiration
            if stored_token.expires_at < datetime.now(timezone.utc):
                raise SomniumException("Refresh token expired", 401, "TOKEN_EXPIRED")

            # Get user
            user_id = UUID(payload.get("sub"))
            user = await self.get_user_by_id(user_id)

            if not user or not user.is_active:
                raise SomniumException(
                    401, "User not found or inactive", "USER_NOT_FOUND"
                )

            # SECURITY: Check if password changed after token issued
            token_pwd_changed = datetime.fromisoformat(payload.get("pwd_changed_at"))
            if user.password_changed_at > token_pwd_changed:
                # Password changed - invalidate this token
                stored_token.revoked = True
                stored_token.revoked_at = datetime.now(timezone.utc)
                await self.db.commit()

                raise SomniumException(
                    401, "Token invalid - password changed", "PASSWORD_CHANGED"
                )

            # ROTATE: Revoke old token
            stored_token.revoked = True
            stored_token.revoked_at = datetime.now(timezone.utc)

            # Create NEW tokens
            token_data = {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value,
                "pwd_changed_at": user.password_changed_at.isoformat(),
            }

            new_access_token = create_access_token(token_data)
            new_refresh_token_str = create_refresh_token(token_data)
            new_expires_at = datetime.now(timezone.utc) + timedelta(days=7)

            # Store new refresh token
            new_refresh_token = RefreshToken(
                user_id=user.id,
                token_hash=hash_token(new_refresh_token_str),
                expires_at=new_expires_at,
                ip_address=ip_address,
                user_agent=user_agent,
            )

            # Link old token to new one for audit trail
            stored_token.replaced_by_id = new_refresh_token.id

            self.db.add(new_refresh_token)
            await self.db.commit()

            await self.audit_service.log_authentication(
                event_type="token_refreshed",
                user_id=user.id,
                status="success",
                ip_address=ip_address,
                user_agent=user_agent,
            )

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token_str,
            }

        except Exception as e:
            if isinstance(e, SomniumException):
                raise
            import logging

            logger = logging.getLogger(__name__)
            logger.warning(
                "Refresh token validation failed",
                extra={"error_type": type(e).__name__},
            )
            raise SomniumException(
                401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN"
            )

    async def revoke_refresh_token(
        self,
        refresh_token_str: str,
        ip_address: str = "unknown",
        user_agent: str | None = None,
    ) -> None:
        """
        Revoke a refresh token (logout).

        Args:
            refresh_token_str: JWT refresh token to revoke
            ip_address: Client IP address
            user_agent: Client user agent
        """
        token_hash = hash_token(refresh_token_str)
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.db.execute(stmt)
        token = result.scalar_one_or_none()

        if token and not token.revoked:
            token.revoked = True
            token.revoked_at = datetime.now(timezone.utc)
            await self.db.commit()

            await self.audit_service.log_authentication(
                event_type="logout",
                user_id=token.user_id,
                status="success",
                ip_address=ip_address,
                user_agent=user_agent,
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
        ip_address: str = "unknown",
        user_agent: str | None = None,
    ) -> User:
        """
        Create a new user.

        Args:
            email: User email
            password: Plain text password
            full_name: User's full name
            role: User role
            department: Optional department
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            Created user

        Raises:
            SomniumException: If email already exists
        """
        # Check if email exists
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            await self.audit_service.log_event(
                event_type="registration_failed",
                action="create",
                status="failure",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"reason": "email_exists", "email": email},
            )
            raise SomniumException("Email already registered", 400, "EMAIL_EXISTS")

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

        # Log successful registration
        await self.audit_service.log_event(
            event_type="registration_success",
            action="create",
            status="success",
            ip_address=ip_address,
            user_id=user.id,
            user_agent=user_agent,
            details={"role": role.value},
        )

        return user
