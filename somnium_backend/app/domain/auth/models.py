"""
User authentication database models.
"""

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import (
    Boolean,
    String,
    DateTime,
    Enum as SQLEnum,
    Integer,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class Hospital(Base):
    """Hospital model for multi-hospital support."""

    __tablename__ = "hospitals"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(2), nullable=False)
    email_domain: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    users: Mapped[list["User"]] = relationship(
        "User", back_populates="hospital", cascade="all, delete-orphan"
    )
    patients: Mapped[list["Patient"]] = relationship(
        "Patient", back_populates="hospital", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Hospital(id={self.id}, name={self.name}, city={self.city}, state={self.state}, email_domain={self.email_domain})>"


class UserRole(str, enum.Enum):
    """User roles for RBAC."""

    NURSE = "nurse"
    PHYSICIAN = "physician"
    ADMIN = "admin"
    ECMO_SPECIALIST = "ecmo_specialist"
    PATIENT = "patient"


class User(Base):
    """User model for authentication and authorization."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role"), nullable=False
    )
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hospital_id: Mapped[UUID] = mapped_column(
        ForeignKey("hospitals.id"), nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Security fields for account lockout and tracking
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    password_changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="users")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class RefreshToken(Base):
    """Refresh token model for token rotation and revocation tracking."""

    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    replaced_by_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("refresh_tokens.id"), nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")
    replaced_by: Mapped["RefreshToken | None"] = relationship(
        "RefreshToken", remote_side=[id], uselist=False
    )

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, revoked={self.revoked})>"


class AuditLog(Base):
    """Audit log model for HIPAA compliance - tracks all PHI access and security events."""

    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # login, logout, access_patient, etc.
    resource_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # patient, lab, vital, etc.
    resource_id: Mapped[UUID | None] = mapped_column(nullable=True)
    action: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # create, read, update, delete
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # success, failure
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, event_type={self.event_type}, user_id={self.user_id})>"
