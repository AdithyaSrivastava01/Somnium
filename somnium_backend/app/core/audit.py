"""
Audit logging service for HIPAA compliance.

All PHI access and security events must be logged for compliance.
"""

import hashlib
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request

from app.domain.auth.models import AuditLog


class AuditService:
    """Service for logging security events and PHI access for HIPAA compliance."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_event(
        self,
        event_type: str,
        action: str,
        status: str,
        ip_address: str,
        user_id: UUID | None = None,
        resource_type: str | None = None,
        resource_id: UUID | None = None,
        user_agent: str | None = None,
        details: dict | None = None,
    ) -> AuditLog:
        """
        Log an audit event to the database.

        Args:
            event_type: Type of event (login, logout, access_patient, etc.)
            action: Action performed (create, read, update, delete, authenticate)
            status: Event status (success, failure)
            ip_address: Client IP address
            user_id: User ID (if authenticated)
            resource_type: Type of resource accessed (patient, lab, vital, etc.)
            resource_id: ID of resource accessed
            user_agent: Client user agent string
            details: Additional event details (JSON serializable)

        Returns:
            Created AuditLog entry
        """
        log = AuditLog(
            event_type=event_type,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action=action,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )

        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)

        return log

    async def log_authentication(
        self,
        event_type: str,  # login, logout, refresh_token, etc.
        user_id: UUID | None,
        status: str,  # success, failure
        ip_address: str,
        user_agent: str | None = None,
        details: dict | None = None,
    ) -> AuditLog:
        """
        Log authentication events.

        Args:
            event_type: Authentication event type
            user_id: User ID attempting authentication
            status: success or failure
            ip_address: Client IP
            user_agent: Client user agent
            details: Additional details (e.g., failure reason)

        Returns:
            Created AuditLog entry
        """
        return await self.log_event(
            event_type=event_type,
            action="authenticate",
            status=status,
            ip_address=ip_address,
            user_id=user_id,
            user_agent=user_agent,
            details=details,
        )

    async def log_phi_access(
        self,
        user_id: UUID,
        resource_type: str,  # patient, lab, vital, etc.
        resource_id: UUID,
        action: str,  # read, create, update, delete
        ip_address: str,
        user_agent: str | None = None,
        details: dict | None = None,
    ) -> AuditLog:
        """
        Log PHI (Protected Health Information) access.

        HIPAA requires logging all PHI access including:
        - Who accessed the data (user_id)
        - What data was accessed (resource_type, resource_id)
        - When it was accessed (timestamp)
        - What action was performed (action)
        - Where the access came from (ip_address)

        Args:
            user_id: User accessing PHI
            resource_type: Type of PHI resource
            resource_id: ID of PHI resource
            action: Action performed
            ip_address: Client IP
            user_agent: Client user agent
            details: Additional details

        Returns:
            Created AuditLog entry
        """
        return await self.log_event(
            event_type=f"phi_access_{resource_type}",
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action=action,
            status="success",
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )

    async def log_security_event(
        self,
        event_type: str,  # account_locked, suspicious_activity, etc.
        user_id: UUID | None,
        ip_address: str,
        details: dict | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        """
        Log security events (account lockouts, suspicious activity, etc.).

        Args:
            event_type: Security event type
            user_id: Affected user ID
            ip_address: Client IP
            details: Event details
            user_agent: Client user agent

        Returns:
            Created AuditLog entry
        """
        return await self.log_event(
            event_type=event_type,
            action="security_event",
            status="alert",
            ip_address=ip_address,
            user_id=user_id,
            user_agent=user_agent,
            details=details,
        )

    @staticmethod
    def get_client_ip(request: Request) -> str:
        """
        Extract client IP address from request, handling proxies.

        Args:
            request: FastAPI request object

        Returns:
            Client IP address
        """
        # Check for forwarded IP (behind proxy/load balancer)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # X-Forwarded-For can contain multiple IPs, first is client
            return forwarded.split(",")[0].strip()

        # Check real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct client
        return request.client.host if request.client else "unknown"

    @staticmethod
    def get_user_agent(request: Request) -> str | None:
        """
        Extract user agent from request.

        Args:
            request: FastAPI request object

        Returns:
            User agent string or None
        """
        return request.headers.get("User-Agent")


def hash_token(token: str) -> str:
    """
    Create SHA-256 hash of token for secure storage.

    Args:
        token: JWT token string

    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(token.encode()).hexdigest()
