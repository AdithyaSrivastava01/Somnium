"""Patient and Vitals Pydantic Schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.domain.patients.models import ECMOMode, Gender, PatientStatus


# ============================================================================
# Patient Schemas
# ============================================================================


class PatientBase(BaseModel):
    """Base patient schema."""

    mrn: str = Field(
        ..., min_length=1, max_length=50, description="Medical Record Number"
    )
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: datetime
    gender: Gender
    diagnosis: Optional[str] = None
    admission_date: datetime
    ecmo_start_date: Optional[datetime] = None
    ecmo_mode: Optional[ECMOMode] = None
    flow_rate: Optional[float] = Field(
        None, ge=0, description="ECMO flow rate in L/min"
    )
    sweep_gas: Optional[float] = Field(
        None, ge=0, description="Sweep gas flow in L/min"
    )
    fio2: Optional[float] = Field(
        None, ge=0, le=1, description="Fraction of inspired oxygen"
    )
    status: PatientStatus = PatientStatus.ACTIVE


class InitialVitals(BaseModel):
    """Schema for initial vitals during patient registration."""

    heart_rate: Optional[int] = Field(None, ge=0, le=300)
    blood_pressure_systolic: Optional[int] = Field(None, ge=0, le=300)
    blood_pressure_diastolic: Optional[int] = Field(None, ge=0, le=300)
    respiratory_rate: Optional[int] = Field(None, ge=0, le=100)
    temperature: Optional[float] = Field(None, ge=20, le=45)
    spo2: Optional[int] = Field(None, ge=0, le=100)
    cvp: Optional[float] = None
    pao2: Optional[float] = None
    paco2: Optional[float] = None
    ph: Optional[float] = Field(None, ge=6.0, le=8.0)
    lactate: Optional[float] = Field(None, ge=0)
    hco3: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    """Schema for creating a new patient."""

    hospital_id: UUID
    initial_vitals: Optional[InitialVitals] = None

    @field_validator(
        "date_of_birth", "admission_date", "ecmo_start_date", mode="before"
    )
    @classmethod
    def validate_dates_not_future(
        cls, v: str | datetime | None
    ) -> str | datetime | None:
        """Ensure dates are not in the future and preserve local timezone."""
        from datetime import timezone

        if v is None:
            return v

        # If it's a string (ISO 8601 from frontend), parse it
        if isinstance(v, str):
            dt = datetime.fromisoformat(v.replace("Z", "+00:00"))

            # Get current time in UTC for comparison
            now_utc = datetime.now(timezone.utc)

            # Check if it's in the future
            if dt > now_utc:
                raise ValueError("Date cannot be in the future")

            # Extract local time components to preserve user's timezone
            if dt.tzinfo is not None:
                return datetime(
                    dt.year,
                    dt.month,
                    dt.day,
                    dt.hour,
                    dt.minute,
                    dt.second,
                    dt.microsecond,
                )
            else:
                return dt

        # If it's already a datetime object
        if isinstance(v, datetime):
            now_utc = datetime.now(timezone.utc)

            if v.tzinfo is not None:
                if v > now_utc:
                    raise ValueError("Date cannot be in the future")
                # Extract local time components
                return datetime(
                    v.year, v.month, v.day, v.hour, v.minute, v.second, v.microsecond
                )
            else:
                now_naive = datetime.now()
                if v > now_naive:
                    raise ValueError("Date cannot be in the future")
                return v

        return v

    @field_validator("admission_date")
    @classmethod
    def validate_admission_after_birth(cls, v: datetime, info) -> datetime:
        """Ensure admission date is after date of birth."""
        if "date_of_birth" in info.data:
            dob = info.data["date_of_birth"]
            if v < dob:
                raise ValueError("Admission date cannot be before date of birth")
        return v

    @field_validator("ecmo_start_date")
    @classmethod
    def validate_ecmo_after_admission(cls, v: datetime | None, info) -> datetime | None:
        """Ensure ECMO start date is after admission date."""
        if v is not None and "admission_date" in info.data:
            admission = info.data["admission_date"]
            if v < admission:
                raise ValueError("ECMO start date cannot be before admission date")
        return v


class PatientUpdate(BaseModel):
    """Schema for updating a patient."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    diagnosis: Optional[str] = None
    admission_date: Optional[datetime] = None
    discharge_date: Optional[datetime] = None
    ecmo_start_date: Optional[datetime] = None
    ecmo_mode: Optional[ECMOMode] = None
    flow_rate: Optional[float] = Field(None, ge=0)
    sweep_gas: Optional[float] = Field(None, ge=0)
    fio2: Optional[float] = Field(None, ge=0, le=1)
    status: Optional[PatientStatus] = None
    is_active: Optional[bool] = None

    @field_validator(
        "date_of_birth", "admission_date", "ecmo_start_date", mode="before"
    )
    @classmethod
    def validate_dates_not_future(
        cls, v: str | datetime | None
    ) -> str | datetime | None:
        """Ensure dates are not in the future and preserve local timezone."""
        from datetime import timezone

        if v is None:
            return v

        # If it's a string (ISO 8601 from frontend), parse it
        if isinstance(v, str):
            dt = datetime.fromisoformat(v.replace("Z", "+00:00"))

            # Get current time in UTC for comparison
            now_utc = datetime.now(timezone.utc)

            # Check if it's in the future
            if dt > now_utc:
                raise ValueError("Date cannot be in the future")

            # Extract local time components to preserve user's timezone
            if dt.tzinfo is not None:
                return datetime(
                    dt.year,
                    dt.month,
                    dt.day,
                    dt.hour,
                    dt.minute,
                    dt.second,
                    dt.microsecond,
                )
            else:
                return dt

        # If it's already a datetime object
        if isinstance(v, datetime):
            now_utc = datetime.now(timezone.utc)

            if v.tzinfo is not None:
                if v > now_utc:
                    raise ValueError("Date cannot be in the future")
                # Extract local time components
                return datetime(
                    v.year, v.month, v.day, v.hour, v.minute, v.second, v.microsecond
                )
            else:
                now_naive = datetime.now()
                if v > now_naive:
                    raise ValueError("Date cannot be in the future")
                return v

        return v


class PatientResponse(PatientBase):
    """Schema for patient response."""

    id: UUID
    hospital_id: UUID
    discharge_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientWithLatestVitals(PatientResponse):
    """Schema for patient with their latest vitals."""

    latest_vitals: Optional["VitalsResponse"] = None
    vitals_count: int = 0

    class Config:
        from_attributes = True


# ============================================================================
# Patient Vitals Schemas
# ============================================================================


class VitalsBase(BaseModel):
    """Base vitals schema."""

    recorded_at: datetime = Field(..., description="When the vitals were measured")

    # Basic vitals
    heart_rate: Optional[int] = Field(
        None, ge=0, le=300, description="Heart rate in bpm"
    )
    blood_pressure_systolic: Optional[int] = Field(
        None, ge=0, le=300, description="Systolic BP in mmHg"
    )
    blood_pressure_diastolic: Optional[int] = Field(
        None, ge=0, le=300, description="Diastolic BP in mmHg"
    )
    respiratory_rate: Optional[int] = Field(
        None, ge=0, le=100, description="Respiratory rate per minute"
    )
    temperature: Optional[float] = Field(
        None, ge=20, le=45, description="Temperature in Celsius"
    )
    spo2: Optional[int] = Field(
        None, ge=0, le=100, description="Oxygen saturation percentage"
    )

    # Advanced ECMO-specific vitals
    cvp: Optional[float] = Field(None, description="Central venous pressure in mmHg")
    pao2: Optional[float] = Field(
        None, description="Arterial oxygen partial pressure in mmHg"
    )
    paco2: Optional[float] = Field(
        None, description="Arterial CO2 partial pressure in mmHg"
    )
    ph: Optional[float] = Field(None, ge=6.0, le=8.0, description="Blood pH level")
    lactate: Optional[float] = Field(None, ge=0, description="Blood lactate in mmol/L")
    hco3: Optional[float] = Field(None, ge=0, description="Bicarbonate in mmol/L")

    # Notes
    notes: Optional[str] = None


class VitalsCreate(VitalsBase):
    """Schema for creating new vitals entry."""

    patient_id: UUID

    @field_validator("recorded_at", mode="before")
    @classmethod
    def validate_recorded_at(cls, v) -> datetime:
        """Ensure recorded_at is not in the future and preserve local timezone."""
        from datetime import timezone

        # If it's a string (ISO 8601 from frontend), parse it ourselves
        if isinstance(v, str):
            # Parse the datetime string with the user's timezone
            dt = datetime.fromisoformat(v.replace("Z", "+00:00"))

            # Get current time in UTC for comparison
            now_utc = datetime.now(timezone.utc)

            # Check if it's in the future
            if dt > now_utc:
                raise ValueError("recorded_at cannot be in the future")

            # Extract the local time components from the user's timezone
            # This preserves the exact time the user sees (e.g., 00:17 stays as 00:17)
            if dt.tzinfo is not None:
                # Create a naive datetime with the same local time values
                return datetime(
                    dt.year,
                    dt.month,
                    dt.day,
                    dt.hour,
                    dt.minute,
                    dt.second,
                    dt.microsecond,
                )
            else:
                return dt

        # If it's already a datetime object (shouldn't happen with mode="before")
        if isinstance(v, datetime):
            now_utc = datetime.now(timezone.utc)

            if v.tzinfo is not None:
                if v > now_utc:
                    raise ValueError("recorded_at cannot be in the future")
                # Extract local time components
                return datetime(
                    v.year, v.month, v.day, v.hour, v.minute, v.second, v.microsecond
                )
            else:
                now_naive = datetime.now()
                if v > now_naive:
                    raise ValueError("recorded_at cannot be in the future")
                return v

        return v


class VitalsResponse(VitalsBase):
    """Schema for vitals response."""

    id: UUID
    patient_id: UUID
    recorded_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VitalsWithRecorder(VitalsResponse):
    """Schema for vitals with recorder information."""

    recorded_by_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# Vitals Trends Schemas
# ============================================================================


class VitalTrend(BaseModel):
    """Schema for vital trend data point."""

    timestamp: datetime
    value: float


class VitalsTrendsResponse(BaseModel):
    """Schema for multiple vitals trends."""

    patient_id: UUID
    time_range_hours: Optional[int] = None
    pao2: list[VitalTrend] = []
    paco2: list[VitalTrend] = []
    lactate: list[VitalTrend] = []
    ph: list[VitalTrend] = []
    hco3: list[VitalTrend] = []

    class Config:
        from_attributes = True


# ============================================================================
# Query Schemas
# ============================================================================


class VitalsQueryParams(BaseModel):
    """Query parameters for vitals filtering."""

    patient_id: Optional[UUID] = None
    hours: Optional[int] = Field(
        None, ge=1, description="Filter vitals from last N hours"
    )
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of records")
    offset: int = Field(0, ge=0, description="Number of records to skip")


class PatientQueryParams(BaseModel):
    """Query parameters for patient filtering."""

    hospital_id: Optional[UUID] = None
    status: Optional[PatientStatus] = None
    is_active: Optional[bool] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)


# ============================================================================
# Twelve Hour Check Response
# ============================================================================


class VitalsEntryCheckResponse(BaseModel):
    """Response for checking if vitals can be entered."""

    can_enter: bool
    last_entry_time: Optional[datetime] = None
    hours_since_last_entry: Optional[float] = None
    next_allowed_time: Optional[datetime] = None
    message: str
