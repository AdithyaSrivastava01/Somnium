"""Patient and Vitals Service Layer."""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.auth.models import Hospital, User
from app.domain.patients.models import Patient, PatientVitals
from app.domain.patients.schemas import (
    PatientCreate,
    PatientUpdate,
    VitalsCreate,
    VitalsEntryCheckResponse,
)


class PatientService:
    """Service for patient operations."""

    @staticmethod
    async def create_patient(
        db: AsyncSession,
        patient_data: PatientCreate,
    ) -> Patient:
        """Create a new patient."""
        # Check if hospital exists
        hospital_result = await db.execute(
            select(Hospital).where(Hospital.id == patient_data.hospital_id)
        )
        hospital = hospital_result.scalar_one_or_none()
        if not hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hospital not found",
            )

        # Check for duplicate MRN in the same hospital
        existing_patient = await db.execute(
            select(Patient).where(
                and_(
                    Patient.mrn == patient_data.mrn,
                    Patient.hospital_id == patient_data.hospital_id,
                )
            )
        )
        if existing_patient.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Patient with MRN {patient_data.mrn} already exists in this hospital",
            )

        # Create patient
        patient = Patient(**patient_data.model_dump())
        db.add(patient)
        await db.commit()
        await db.refresh(patient)
        return patient

    @staticmethod
    async def get_patient(
        db: AsyncSession,
        patient_id: UUID,
        user_hospital_id: Optional[UUID] = None,
    ) -> Optional[Patient]:
        """
        Get patient by ID.
        If user_hospital_id is provided, verifies the patient belongs to that hospital.
        """
        query = (
            select(Patient)
            .options(selectinload(Patient.hospital))
            .where(Patient.id == patient_id)
        )

        # Hospital verification: only return patient if it belongs to user's hospital
        if user_hospital_id:
            query = query.where(Patient.hospital_id == user_hospital_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_patients_by_hospital(
        db: AsyncSession,
        hospital_id: UUID,
        is_active: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Patient]:
        """Get all patients for a hospital."""
        query = select(Patient).where(Patient.hospital_id == hospital_id)

        if is_active is not None:
            query = query.where(Patient.is_active == is_active)

        query = query.order_by(desc(Patient.created_at)).limit(limit).offset(offset)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_active_patients_by_hospital(
        db: AsyncSession,
        hospital_id: UUID,
    ) -> list[Patient]:
        """Get all active patients for a hospital."""
        result = await db.execute(
            select(Patient)
            .where(
                and_(
                    Patient.hospital_id == hospital_id,
                    Patient.is_active == True,  # noqa: E712
                )
            )
            .order_by(Patient.last_name, Patient.first_name)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_patient(
        db: AsyncSession,
        patient_id: UUID,
        patient_data: PatientUpdate,
    ) -> Patient:
        """Update patient information."""
        patient = await PatientService.get_patient(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        # Update only provided fields
        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)

        patient.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(patient)
        return patient

    @staticmethod
    async def delete_patient(
        db: AsyncSession,
        patient_id: UUID,
    ) -> None:
        """Soft delete a patient (set is_active to False)."""
        patient = await PatientService.get_patient(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        patient.is_active = False
        patient.updated_at = datetime.utcnow()
        await db.commit()


class VitalsService:
    """Service for patient vitals operations."""

    VITALS_INTERVAL_HOURS = 12

    @staticmethod
    async def check_can_enter_vitals(
        db: AsyncSession,
        patient_id: UUID,
    ) -> VitalsEntryCheckResponse:
        """
        Check if vitals can be entered for a patient.
        Vitals can only be entered once every 12 hours.
        """
        # Get the most recent vitals entry for this patient
        result = await db.execute(
            select(PatientVitals)
            .where(PatientVitals.patient_id == patient_id)
            .order_by(desc(PatientVitals.recorded_at))
            .limit(1)
        )
        last_vitals = result.scalar_one_or_none()

        if not last_vitals:
            return VitalsEntryCheckResponse(
                can_enter=True,
                message="No previous vitals found. You can enter vitals now.",
            )

        # Calculate time since last entry
        now = datetime.utcnow()
        time_since_last = now - last_vitals.recorded_at
        hours_since_last = time_since_last.total_seconds() / 3600

        if hours_since_last >= VitalsService.VITALS_INTERVAL_HOURS:
            return VitalsEntryCheckResponse(
                can_enter=True,
                last_entry_time=last_vitals.recorded_at,
                hours_since_last_entry=hours_since_last,
                message=f"Last entry was {hours_since_last:.1f} hours ago. You can enter vitals now.",
            )
        else:
            next_allowed = last_vitals.recorded_at + timedelta(
                hours=VitalsService.VITALS_INTERVAL_HOURS
            )
            hours_remaining = VitalsService.VITALS_INTERVAL_HOURS - hours_since_last

            return VitalsEntryCheckResponse(
                can_enter=False,
                last_entry_time=last_vitals.recorded_at,
                hours_since_last_entry=hours_since_last,
                next_allowed_time=next_allowed,
                message=f"Vitals were entered {hours_since_last:.1f} hours ago. "
                f"Please wait {hours_remaining:.1f} more hours. "
                f"Next entry allowed at {next_allowed.strftime('%Y-%m-%d %H:%M UTC')}.",
            )

    @staticmethod
    async def create_vitals(
        db: AsyncSession,
        vitals_data: VitalsCreate,
        recorded_by_user_id: UUID,
        user_hospital_id: UUID,
    ) -> PatientVitals:
        """
        Create a new vitals entry with 12-hour validation.
        Verifies the patient belongs to the user's hospital.
        """
        # Check if patient exists AND belongs to user's hospital
        patient = await PatientService.get_patient(
            db, vitals_data.patient_id, user_hospital_id
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found or does not belong to your hospital",
            )

        # Check 12-hour constraint
        can_enter = await VitalsService.check_can_enter_vitals(
            db, vitals_data.patient_id
        )
        if not can_enter.can_enter:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=can_enter.message,
            )

        # Create vitals entry
        vitals = PatientVitals(
            **vitals_data.model_dump(),
            recorded_by=recorded_by_user_id,
        )
        db.add(vitals)
        await db.commit()
        await db.refresh(vitals)
        return vitals

    @staticmethod
    async def get_latest_vitals(
        db: AsyncSession,
        patient_id: UUID,
    ) -> Optional[PatientVitals]:
        """Get the most recent vitals for a patient."""
        result = await db.execute(
            select(PatientVitals)
            .where(PatientVitals.patient_id == patient_id)
            .order_by(desc(PatientVitals.recorded_at))
            .limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_vitals_history(
        db: AsyncSession,
        patient_id: UUID,
        hours: Optional[int] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[PatientVitals]:
        """Get vitals history for a patient with optional time filter."""
        query = select(PatientVitals).where(PatientVitals.patient_id == patient_id)

        if hours:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            query = query.where(PatientVitals.recorded_at >= cutoff_time)

        query = (
            query.order_by(desc(PatientVitals.recorded_at)).limit(limit).offset(offset)
        )

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_vitals_trends(
        db: AsyncSession,
        patient_id: UUID,
        hours: Optional[int] = None,
    ) -> dict:
        """
        Get vitals trends for graphing.
        Returns time-series data for PaO2, PaCO2, Lactate, pH, HCO3.
        """
        query = select(PatientVitals).where(PatientVitals.patient_id == patient_id)

        if hours:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            query = query.where(PatientVitals.recorded_at >= cutoff_time)

        query = query.order_by(PatientVitals.recorded_at)

        result = await db.execute(query)
        vitals_list = result.scalars().all()

        # Build trend data
        trends = {
            "patient_id": patient_id,
            "time_range_hours": hours,
            "pao2": [],
            "paco2": [],
            "lactate": [],
            "ph": [],
            "hco3": [],
        }

        for vital in vitals_list:
            if vital.pao2 is not None:
                trends["pao2"].append(
                    {"timestamp": vital.recorded_at, "value": vital.pao2}
                )
            if vital.paco2 is not None:
                trends["paco2"].append(
                    {"timestamp": vital.recorded_at, "value": vital.paco2}
                )
            if vital.lactate is not None:
                trends["lactate"].append(
                    {"timestamp": vital.recorded_at, "value": vital.lactate}
                )
            if vital.ph is not None:
                trends["ph"].append({"timestamp": vital.recorded_at, "value": vital.ph})
            if vital.hco3 is not None:
                trends["hco3"].append(
                    {"timestamp": vital.recorded_at, "value": vital.hco3}
                )

        return trends

    @staticmethod
    async def get_patients_with_latest_vitals(
        db: AsyncSession,
        hospital_id: UUID,
    ) -> list[dict]:
        """
        Get all active patients for a hospital with their latest vitals.
        Used for dashboard display.
        """
        patients = await PatientService.get_active_patients_by_hospital(db, hospital_id)

        result = []
        for patient in patients:
            latest_vitals = await VitalsService.get_latest_vitals(db, patient.id)

            # Count total vitals entries
            vitals_count_result = await db.execute(
                select(func.count(PatientVitals.id)).where(
                    PatientVitals.patient_id == patient.id
                )
            )
            vitals_count = vitals_count_result.scalar_one()

            result.append(
                {
                    "patient": patient,
                    "latest_vitals": latest_vitals,
                    "vitals_count": vitals_count,
                }
            )

        return result
