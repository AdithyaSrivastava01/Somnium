"""Patient and Vitals API Router."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import get_current_user, RequireNurse, RequirePhysician
from app.domain.auth.models import User
from app.domain.patients.schemas import (
    PatientCreate,
    PatientResponse,
    PatientUpdate,
    PatientWithLatestVitals,
    VitalsCreate,
    VitalsResponse,
    VitalsEntryCheckResponse,
    VitalsTrendsResponse,
)
from app.domain.patients.service import PatientService, VitalsService

router = APIRouter(prefix="/api/v1/patients", tags=["patients"])


# ============================================================================
# Patient Endpoints
# ============================================================================


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[RequireNurse],
)
async def create_patient(
    patient_data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PatientResponse:
    """
    Create a new patient.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    patient = await PatientService.create_patient(db, patient_data)
    return PatientResponse.model_validate(patient)


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    dependencies=[RequireNurse],
)
async def get_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PatientResponse:
    """
    Get a patient by ID.
    Requires nurse, physician, ecmo_specialist, or admin role.
    Hospital verification: User can only access patients from their own hospital.
    """
    patient = await PatientService.get_patient(db, patient_id, current_user.hospital_id)
    if not patient:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or does not belong to your hospital",
        )
    return PatientResponse.model_validate(patient)


@router.get(
    "/hospital/{hospital_id}",
    response_model=list[PatientResponse],
    dependencies=[RequireNurse],
)
async def get_patients_by_hospital(
    hospital_id: UUID,
    is_active: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PatientResponse]:
    """
    Get all patients for a hospital with optional filtering.
    Hospital verification: User can only access patients from their own hospital.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    # Verify the user is requesting their own hospital's patients
    if hospital_id != current_user.hospital_id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view patients from your own hospital",
        )

    patients = await PatientService.get_patients_by_hospital(
        db, hospital_id, is_active, limit, offset
    )
    return [PatientResponse.model_validate(p) for p in patients]


@router.get(
    "/hospital/{hospital_id}/active",
    response_model=list[PatientResponse],
    dependencies=[RequireNurse],
)
async def get_active_patients_by_hospital(
    hospital_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PatientResponse]:
    """
    Get all active patients for a hospital.
    Used in nurse station for patient selection.
    Hospital verification: User can only access patients from their own hospital.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    # Verify the user is requesting their own hospital's patients
    if hospital_id != current_user.hospital_id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view patients from your own hospital",
        )

    patients = await PatientService.get_active_patients_by_hospital(db, hospital_id)
    return [PatientResponse.model_validate(p) for p in patients]


@router.get(
    "/hospital/{hospital_id}/with-vitals",
    response_model=list[PatientWithLatestVitals],
    dependencies=[RequireNurse],
)
async def get_patients_with_latest_vitals(
    hospital_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PatientWithLatestVitals]:
    """
    Get all active patients with their latest vitals.
    Used for dashboard display.
    Hospital verification: User can only access patients from their own hospital.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    # Verify the user is requesting their own hospital's patients
    if hospital_id != current_user.hospital_id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only view patients from your own hospital",
        )

    patients_data = await VitalsService.get_patients_with_latest_vitals(db, hospital_id)

    result = []
    for item in patients_data:
        patient_dict = PatientResponse.model_validate(item["patient"]).model_dump()
        patient_dict["latest_vitals"] = (
            VitalsResponse.model_validate(item["latest_vitals"]).model_dump()
            if item["latest_vitals"]
            else None
        )
        patient_dict["vitals_count"] = item["vitals_count"]
        result.append(PatientWithLatestVitals(**patient_dict))

    return result


@router.patch(
    "/{patient_id}",
    response_model=PatientResponse,
    dependencies=[RequirePhysician],
)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PatientResponse:
    """
    Update patient information.
    Requires physician, ecmo_specialist, or admin role.
    """
    patient = await PatientService.update_patient(db, patient_id, patient_data)
    return PatientResponse.model_validate(patient)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[RequirePhysician],
)
async def delete_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Soft delete a patient (sets is_active to False).
    Requires physician, ecmo_specialist, or admin role.
    """
    await PatientService.delete_patient(db, patient_id)


# ============================================================================
# Vitals Endpoints
# ============================================================================


@router.get(
    "/{patient_id}/vitals/check",
    response_model=VitalsEntryCheckResponse,
    dependencies=[RequireNurse],
)
async def check_can_enter_vitals(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VitalsEntryCheckResponse:
    """
    Check if vitals can be entered for a patient.
    Validates the 12-hour constraint.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    return await VitalsService.check_can_enter_vitals(db, patient_id)


@router.post(
    "/vitals",
    response_model=VitalsResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[RequireNurse],
)
async def create_vitals(
    vitals_data: VitalsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VitalsResponse:
    """
    Create a new vitals entry.
    Enforces 12-hour minimum interval between entries.
    Hospital verification: User can only enter vitals for patients in their hospital.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    vitals = await VitalsService.create_vitals(
        db, vitals_data, current_user.id, current_user.hospital_id
    )
    return VitalsResponse.model_validate(vitals)


@router.get(
    "/{patient_id}/vitals/latest",
    response_model=VitalsResponse,
    dependencies=[RequireNurse],
)
async def get_latest_vitals(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VitalsResponse:
    """
    Get the most recent vitals for a patient.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    vitals = await VitalsService.get_latest_vitals(db, patient_id)
    if not vitals:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No vitals found for this patient",
        )
    return VitalsResponse.model_validate(vitals)


@router.get(
    "/{patient_id}/vitals/history",
    response_model=list[VitalsResponse],
    dependencies=[RequireNurse],
)
async def get_vitals_history(
    patient_id: UUID,
    hours: Optional[int] = Query(None, ge=1, description="Filter last N hours"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[VitalsResponse]:
    """
    Get vitals history for a patient with optional time filter.
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    vitals_list = await VitalsService.get_vitals_history(
        db, patient_id, hours, limit, offset
    )
    return [VitalsResponse.model_validate(v) for v in vitals_list]


@router.get(
    "/{patient_id}/vitals/trends",
    response_model=VitalsTrendsResponse,
    dependencies=[RequireNurse],
)
async def get_vitals_trends(
    patient_id: UUID,
    hours: Optional[int] = Query(
        None, ge=1, description="Filter last N hours (24, 48, 72, or all-time)"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VitalsTrendsResponse:
    """
    Get vitals trends for graphing (PaO2, PaCO2, Lactate, pH, HCO3).
    Supports time filters: 24h, 48h, 72h, or all-time (no hours parameter).
    Requires nurse, physician, ecmo_specialist, or admin role.
    """
    trends = await VitalsService.get_vitals_trends(db, patient_id, hours)
    return VitalsTrendsResponse(**trends)
