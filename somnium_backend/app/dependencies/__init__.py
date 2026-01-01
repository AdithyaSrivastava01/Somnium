"""
FastAPI dependencies for database, authentication, and authorization.
"""

from typing import Annotated, List
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.domain.auth.models import User, UserRole
from app.domain.auth.service import AuthService


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_auth_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuthService:
    """
    Get auth service dependency.

    Args:
        db: Database session

    Returns:
        AuthService instance
    """
    return AuthService(db)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Authorization credentials
        auth_service: Auth service

    Returns:
        Current user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        token = credentials.credentials
        payload = decode_token(token)

        user_id = UUID(payload.get("sub"))
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
            )

        return user

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        # Log the actual error for debugging
        print(f"Authentication error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency factory to require specific user roles.

    Args:
        allowed_roles: List of allowed user roles

    Returns:
        Dependency function that validates user role
    """

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)]
    ) -> User:
        """
        Check if user has required role.

        Args:
            current_user: Current authenticated user

        Returns:
            User if role is allowed

        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# Common role-based dependencies
RequireNurse = Depends(require_roles([UserRole.NURSE]))
RequirePhysician = Depends(
    require_roles([UserRole.PHYSICIAN, UserRole.ECMO_SPECIALIST])
)
RequireECMOSpecialist = Depends(require_roles([UserRole.ECMO_SPECIALIST]))
RequireAdmin = Depends(require_roles([UserRole.ADMIN]))
RequireAnyAuthenticated = Depends(get_current_user)
