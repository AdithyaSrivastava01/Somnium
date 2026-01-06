"""
Application configuration using pydantic-settings.
"""

from typing import List
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    # Database
    DATABASE_URL: PostgresDsn

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour for better UX during development
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Max 30 days with remember_me

    # Application
    APP_NAME: str = "Somnium ECMO Platform"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # CSRF Protection
    CSRF_SECRET_KEY: str | None = None  # Defaults to SECRET_KEY if not set
    CSRF_COOKIE_NAME: str = "csrf_token"
    CSRF_HEADER_NAME: str = "X-CSRF-Token"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.strip("[]").split(",")]
        return v

    # Vector Store
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_NAME: str = "ecmo_knowledge"

    # LLM Configuration
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.3

    # ML Model
    ECMO_PAL_MODEL_PATH: str = "./models/ecmo_pal.pt"

    # Alert Thresholds - Heart Rate
    ALERT_HEART_RATE_LOW_WARNING: int = 50
    ALERT_HEART_RATE_HIGH_WARNING: int = 110
    ALERT_HEART_RATE_LOW_CRITICAL: int = 40
    ALERT_HEART_RATE_HIGH_CRITICAL: int = 130

    # Alert Thresholds - MAP
    ALERT_MAP_LOW_WARNING: int = 65
    ALERT_MAP_LOW_CRITICAL: int = 55

    # Alert Thresholds - SpO2
    ALERT_SPO2_LOW_WARNING: int = 92
    ALERT_SPO2_LOW_CRITICAL: int = 88

    # Alert Thresholds - Lactate
    ALERT_LACTATE_HIGH_WARNING: float = 2.0
    ALERT_LACTATE_HIGH_CRITICAL: float = 4.0

    # Alert Thresholds - pH
    ALERT_PH_LOW_WARNING: float = 7.30
    ALERT_PH_HIGH_WARNING: float = 7.50
    ALERT_PH_LOW_CRITICAL: float = 7.20
    ALERT_PH_HIGH_CRITICAL: float = 7.55

    # Dashboard
    DASHBOARD_POLL_INTERVAL_SECONDS: int = 30


settings = Settings()
