"""Patient and Vitals Domain Models."""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    CheckConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ECMOMode(str, enum.Enum):
    """ECMO configuration modes."""

    VV = "VV"  # Veno-Venous
    VA = "VA"  # Veno-Arterial
    VAV = "VAV"  # Veno-Arterial-Venous


class PatientStatus(str, enum.Enum):
    """Patient status enumeration."""

    ACTIVE = "active"
    STABLE = "stable"
    CRITICAL = "critical"
    RECOVERED = "recovered"
    DECEASED = "deceased"


class Gender(str, enum.Enum):
    """Patient gender enumeration."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Patient(Base):
    """Patient model with hospital association."""

    __tablename__ = "patients"

    # Primary identifiers
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    mrn: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="Medical Record Number",
    )

    # Demographics
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    gender: Mapped[Gender] = mapped_column(
        Enum(Gender, native_enum=True, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )

    # Hospital association
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Clinical information
    diagnosis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    admission_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    discharge_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    # ECMO-specific fields
    ecmo_start_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )
    ecmo_mode: Mapped[Optional[ECMOMode]] = mapped_column(
        Enum(
            ECMOMode, native_enum=True, values_callable=lambda x: [e.value for e in x]
        ),
        nullable=True,
    )
    flow_rate: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="ECMO flow rate in L/min",
    )
    sweep_gas: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Sweep gas flow in L/min",
    )
    fio2: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Fraction of inspired oxygen (0-1)",
    )

    # Status
    status: Mapped[PatientStatus] = mapped_column(
        Enum(
            PatientStatus,
            native_enum=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=PatientStatus.ACTIVE,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    hospital: Mapped["Hospital"] = relationship(
        "Hospital",
        back_populates="patients",
    )
    vitals: Mapped[list["PatientVitals"]] = relationship(
        "PatientVitals",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="desc(PatientVitals.recorded_at)",
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint(
            "mrn",
            "hospital_id",
            name="uq_patient_mrn_hospital",
        ),
        CheckConstraint(
            "fio2 IS NULL OR (fio2 >= 0 AND fio2 <= 1)",
            name="ck_patient_fio2_range",
        ),
        CheckConstraint(
            "flow_rate IS NULL OR flow_rate >= 0",
            name="ck_patient_flow_rate_positive",
        ),
        CheckConstraint(
            "sweep_gas IS NULL OR sweep_gas >= 0",
            name="ck_patient_sweep_gas_positive",
        ),
        Index("ix_patients_hospital_status", "hospital_id", "status"),
        Index("ix_patients_hospital_active", "hospital_id", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<Patient(id={self.id}, mrn={self.mrn}, name={self.first_name} {self.last_name})>"


class PatientVitals(Base):
    """Patient vitals measurements with 12-hour entry constraint."""

    __tablename__ = "patient_vitals"

    # Primary key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Foreign keys
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Nurse who recorded the vitals",
    )

    # Timestamp - when the vitals were actually measured
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
        comment="When the vitals were measured",
    )

    # Basic vitals
    heart_rate: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Heart rate in bpm",
    )
    blood_pressure_systolic: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Systolic BP in mmHg",
    )
    blood_pressure_diastolic: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Diastolic BP in mmHg",
    )
    respiratory_rate: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Respiratory rate per minute",
    )
    temperature: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Temperature in Celsius",
    )
    spo2: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Oxygen saturation percentage",
    )

    # Advanced ECMO-specific vitals
    cvp: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Central venous pressure in mmHg",
    )
    pao2: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Arterial oxygen partial pressure in mmHg",
    )
    paco2: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Arterial CO2 partial pressure in mmHg",
    )
    ph: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Blood pH level",
    )
    lactate: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Blood lactate in mmol/L",
    )
    hco3: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Bicarbonate in mmol/L",
    )

    # Additional notes
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Clinical notes from the nurse",
    )

    # System timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="When the record was created in the system",
    )

    # Relationships
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="vitals",
    )
    recorded_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[recorded_by],
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "heart_rate IS NULL OR (heart_rate >= 0 AND heart_rate <= 300)",
            name="ck_vitals_heart_rate_range",
        ),
        CheckConstraint(
            "blood_pressure_systolic IS NULL OR (blood_pressure_systolic >= 0 AND blood_pressure_systolic <= 300)",
            name="ck_vitals_bp_systolic_range",
        ),
        CheckConstraint(
            "blood_pressure_diastolic IS NULL OR (blood_pressure_diastolic >= 0 AND blood_pressure_diastolic <= 300)",
            name="ck_vitals_bp_diastolic_range",
        ),
        CheckConstraint(
            "respiratory_rate IS NULL OR (respiratory_rate >= 0 AND respiratory_rate <= 100)",
            name="ck_vitals_respiratory_rate_range",
        ),
        CheckConstraint(
            "temperature IS NULL OR (temperature >= 20 AND temperature <= 45)",
            name="ck_vitals_temperature_range",
        ),
        CheckConstraint(
            "spo2 IS NULL OR (spo2 >= 0 AND spo2 <= 100)",
            name="ck_vitals_spo2_range",
        ),
        CheckConstraint(
            "ph IS NULL OR (ph >= 6.0 AND ph <= 8.0)",
            name="ck_vitals_ph_range",
        ),
        CheckConstraint(
            "lactate IS NULL OR lactate >= 0",
            name="ck_vitals_lactate_positive",
        ),
        CheckConstraint(
            "hco3 IS NULL OR hco3 >= 0",
            name="ck_vitals_hco3_positive",
        ),
        Index("ix_patient_vitals_patient_recorded", "patient_id", "recorded_at"),
        Index("ix_patient_vitals_recorded_at", "recorded_at"),
    )

    def __repr__(self) -> str:
        return f"<PatientVitals(id={self.id}, patient_id={self.patient_id}, recorded_at={self.recorded_at})>"
