"""
Authentication API endpoints.
"""

from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.dependencies import get_auth_service, get_current_user
from app.domain.auth.service import AuthService
from app.domain.auth.models import User
from app.domain.auth.schemas import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterRequest,
    UserResponse,
)


router = APIRouter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user with email, password, and role verification",
)
async def login(
    request: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> LoginResponse:
    """
    Login endpoint with role verification.

    Args:
        request: Login request with email, password, role, and remember_me
        auth_service: Authentication service

    Returns:
        LoginResponse with user info and tokens
    """
    return await auth_service.login(
        request.email, request.password, request.role, request.remember_me
    )


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
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User registration",
    description="Register a new user and return user info with JWT tokens",
)
async def register(
    request: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> LoginResponse:
    """
    Register a new user.

    Args:
        request: Registration request with user details
        auth_service: Authentication service

    Returns:
        LoginResponse with user info and tokens
    """
    # Create the user
    user = await auth_service.create_user(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
        department=request.department,
    )

    # Login the newly created user
    return await auth_service.login(request.email, request.password, request.role)


@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Generate new access token using refresh token",
)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> RefreshTokenResponse:
    """
    Refresh access token.

    Args:
        request: Refresh token request
        auth_service: Authentication service

    Returns:
        New access token
    """
    access_token = await auth_service.refresh_access_token(request.refresh_token)
    return RefreshTokenResponse(access_token=access_token)
