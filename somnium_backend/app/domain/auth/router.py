"""
Authentication API endpoints with rate limiting for security.
"""

from typing import Annotated
from fastapi import APIRouter, Depends, Request, Response, Cookie, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi_csrf_protect import CsrfProtect

from app.dependencies import get_auth_service, get_current_user
from app.domain.auth.service import AuthService
from app.domain.auth.models import User
from app.domain.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
    HospitalResponse,
)
from app.core.audit import AuditService
from app.core.config import settings


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user with email, password, and role verification. Sets httpOnly cookies for tokens.",
)
@limiter.limit("5/minute")  # Maximum 5 login attempts per minute per IP
async def login(
    request: Request,  # slowapi requires this to be named "request"
    response: Response,
    login_data: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    csrf_protect: CsrfProtect = Depends(),
) -> UserResponse:
    """
    Login endpoint with role verification.
    Sets httpOnly cookies for access_token and refresh_token.

    Args:
        request: FastAPI request object
        response: FastAPI response object
        login_data: Login request with email, password, role, and remember_me
        auth_service: Authentication service
        csrf_protect: CSRF protection

    Returns:
        UserResponse with user info only (tokens in httpOnly cookies)
    """
    # Validate CSRF token
    await csrf_protect.validate_csrf(request)

    result = await auth_service.login(
        login_data.email,
        login_data.password,
        login_data.role,
        login_data.remember_me,
        ip_address=AuditService.get_client_ip(request),
        user_agent=AuditService.get_user_agent(request),
    )

    # Set httpOnly cookies for tokens
    # If remember_me is True: persistent cookies (30 days)
    # If remember_me is False: session cookies (deleted when browser closes)
    if login_data.remember_me:
        # Persistent cookies with max_age
        response.set_cookie(
            key="access_token",
            value=result.tokens.access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=result.tokens.refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="lax",
            max_age=30 * 24 * 60 * 60,  # 30 days
            path="/",
        )
    else:
        # Session cookies without max_age (deleted when browser closes)
        response.set_cookie(
            key="access_token",
            value=result.tokens.access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="lax",
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=result.tokens.refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="lax",
            path="/",
        )

    # Return only user info (no tokens)
    return UserResponse.model_validate(result.user)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get currently authenticated user information",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """
    Get current authenticated user.

    Args:
        current_user: Current user from JWT token

    Returns:
        User information
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User registration",
    description="Register a new user and return user info. Sets httpOnly cookies for tokens.",
)
@limiter.limit("3/hour")  # Maximum 3 registrations per hour per IP
async def register(
    request: Request,  # slowapi requires this to be named "request"
    response: Response,
    register_data: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    csrf_protect: CsrfProtect = Depends(),
) -> UserResponse:
    """
    Register a new user.
    Sets httpOnly cookies for access_token and refresh_token.

    Args:
        request: FastAPI request object
        response: FastAPI response object
        register_data: Registration request with user details
        auth_service: Authentication service
        csrf_protect: CSRF protection

    Returns:
        UserResponse with user info only (tokens in httpOnly cookies)
    """
    # Validate CSRF token
    await csrf_protect.validate_csrf(request)

    # Create the user
    await auth_service.create_user(
        email=register_data.email,
        password=register_data.password,
        full_name=register_data.full_name,
        role=register_data.role,
        hospital_id=register_data.hospital_id,
        department=register_data.department,
        ip_address=AuditService.get_client_ip(request),
        user_agent=AuditService.get_user_agent(request),
    )

    # Login the newly created user
    result = await auth_service.login(
        register_data.email,
        register_data.password,
        register_data.role,
        ip_address=AuditService.get_client_ip(request),
        user_agent=AuditService.get_user_agent(request),
    )

    # Set httpOnly session cookies for tokens (no remember_me for registration)
    # Session cookies are deleted when the browser closes
    response.set_cookie(
        key="access_token",
        value=result.tokens.access_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=result.tokens.refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        path="/",
    )

    # Return only user info
    return UserResponse.model_validate(result.user)


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Generate new access token using refresh token from httpOnly cookie",
)
@limiter.limit("10/minute")  # Maximum 10 token refreshes per minute per IP
async def refresh_token(
    request: Request,  # slowapi requires this to be named "request"
    response: Response,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> dict:
    """
    Refresh access token and rotate refresh token.
    Reads refresh_token from httpOnly cookie and sets new tokens in cookies.

    Args:
        request: FastAPI request object
        response: FastAPI response object
        auth_service: Authentication service
        refresh_token: Refresh token from httpOnly cookie

    Returns:
        Success message (tokens in httpOnly cookies)
    """
    if not refresh_token:
        from app.core.exceptions import AuthenticationError

        raise AuthenticationError("Refresh token not found")

    result = await auth_service.refresh_access_token(
        refresh_token,
        ip_address=AuditService.get_client_ip(request),
        user_agent=AuditService.get_user_agent(request),
    )

    # Set new tokens in httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/",
    )

    return {"message": "Token refreshed successfully"}


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User logout",
    description="Revoke refresh token and clear httpOnly cookies",
)
async def logout(
    request: Request,
    response: Response,
    current_user: Annotated[User, Depends(get_current_user)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    csrf_protect: CsrfProtect = Depends(),
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    """
    Logout user by revoking refresh token and clearing cookies.

    Args:
        request: FastAPI request object
        response: FastAPI response object
        current_user: Current authenticated user
        auth_service: Authentication service
        csrf_protect: CSRF protection
        refresh_token: Refresh token from httpOnly cookie

    Returns:
        Success message
    """
    # Validate CSRF token
    await csrf_protect.validate_csrf(request)

    # Revoke refresh token if present
    if refresh_token:
        await auth_service.revoke_refresh_token(
            refresh_token,
            ip_address=AuditService.get_client_ip(request),
            user_agent=AuditService.get_user_agent(request),
        )

    # Clear httpOnly cookies - must match the attributes used when setting them
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax",
        secure=not settings.DEBUG,
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        samesite="lax",
        secure=not settings.DEBUG,
    )

    return {"message": "Logged out successfully", "user_id": str(current_user.id)}


@router.get(
    "/hospitals",
    response_model=list[HospitalResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all hospitals",
    description="Fetch list of all available hospitals for registration",
)
async def get_hospitals(
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> list[HospitalResponse]:
    """
    Get all hospitals for dropdown selection.

    Args:
        auth_service: Authentication service

    Returns:
        List of hospitals
    """
    hospitals = await auth_service.get_all_hospitals()
    return [HospitalResponse.model_validate(hospital) for hospital in hospitals]
