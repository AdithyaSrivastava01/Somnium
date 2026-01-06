"""
Seed patients and vitals data for testing.

Usage:
    uv run python scripts/seed_patients_vitals.py
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
from uuid import UUID
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.domain.auth.models import Hospital, User

# Import models directly to avoid router initialization issues
import sys

sys.path.insert(0, str(Path(__file__).parent.parent / "app" / "domain" / "patients"))
from models import Patient, PatientVitals, ECMOMode, PatientStatus, Gender


async def seed_patients_and_vitals():
    """Seed sample patients with realistic vitals data."""
    async with AsyncSessionLocal() as db:
        print("🌱 Starting patient and vitals seeding...")

        # Get first hospital
        hospital_result = await db.execute(select(Hospital).limit(1))
        hospital = hospital_result.scalar_one_or_none()

        if not hospital:
            print("❌ No hospital found. Please run reset_and_seed_users.py first.")
            return

        print(f"✅ Using hospital: {hospital.name} (ID: {hospital.id})")

        # Get a nurse user for recording vitals
        nurse_result = await db.execute(
            select(User)
            .where(User.hospital_id == hospital.id, User.role == "nurse")
            .limit(1)
        )
        nurse = nurse_result.scalar_one_or_none()

        if not nurse:
            print("❌ No nurse found. Please run reset_and_seed_users.py first.")
            return

        print(f"✅ Using nurse: {nurse.full_name} for recording vitals")

        # Sample patient data
        patients_data = [
            {
                "mrn": "MRN-2024-001",
                "first_name": "John",
                "last_name": "Doe",
                "date_of_birth": datetime(1965, 3, 15),
                "gender": Gender.MALE,
                "diagnosis": "Acute Respiratory Distress Syndrome (ARDS) secondary to COVID-19 pneumonia",
                "admission_date": datetime.utcnow() - timedelta(days=5),
                "ecmo_start_date": datetime.utcnow() - timedelta(days=4),
                "ecmo_mode": ECMOMode.VV,
                "flow_rate": 4.2,
                "sweep_gas": 3.5,
                "fio2": 0.60,
                "status": PatientStatus.STABLE,
            },
            {
                "mrn": "MRN-2024-002",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "date_of_birth": datetime(1978, 7, 22),
                "gender": Gender.FEMALE,
                "diagnosis": "Cardiogenic shock post acute myocardial infarction",
                "admission_date": datetime.utcnow() - timedelta(days=3),
                "ecmo_start_date": datetime.utcnow() - timedelta(days=2),
                "ecmo_mode": ECMOMode.VA,
                "flow_rate": 3.8,
                "sweep_gas": 3.0,
                "fio2": 0.50,
                "status": PatientStatus.CRITICAL,
            },
            {
                "mrn": "MRN-2024-003",
                "first_name": "Michael",
                "last_name": "Chen",
                "date_of_birth": datetime(1982, 11, 8),
                "gender": Gender.MALE,
                "diagnosis": "Severe pneumonia with respiratory failure, H1N1 positive",
                "admission_date": datetime.utcnow() - timedelta(days=7),
                "ecmo_start_date": datetime.utcnow() - timedelta(days=6),
                "ecmo_mode": ECMOMode.VV,
                "flow_rate": 4.5,
                "sweep_gas": 4.0,
                "fio2": 0.70,
                "status": PatientStatus.ACTIVE,
            },
            {
                "mrn": "MRN-2024-004",
                "first_name": "Emily",
                "last_name": "Rodriguez",
                "date_of_birth": datetime(1990, 5, 30),
                "gender": Gender.FEMALE,
                "diagnosis": "Post-cardiac arrest, anoxic brain injury",
                "admission_date": datetime.utcnow() - timedelta(days=2),
                "ecmo_start_date": datetime.utcnow() - timedelta(days=1),
                "ecmo_mode": ECMOMode.VA,
                "flow_rate": 4.0,
                "sweep_gas": 3.2,
                "fio2": 0.55,
                "status": PatientStatus.CRITICAL,
            },
            {
                "mrn": "MRN-2024-005",
                "first_name": "David",
                "last_name": "Kim",
                "date_of_birth": datetime(1955, 9, 12),
                "gender": Gender.MALE,
                "diagnosis": "COPD exacerbation with acute hypoxemic respiratory failure",
                "admission_date": datetime.utcnow() - timedelta(days=10),
                "ecmo_start_date": datetime.utcnow() - timedelta(days=9),
                "ecmo_mode": ECMOMode.VV,
                "flow_rate": 3.9,
                "sweep_gas": 3.3,
                "fio2": 0.65,
                "status": PatientStatus.STABLE,
            },
        ]

        created_patients = []

        # Create patients
        for patient_data in patients_data:
            # Check if patient already exists
            existing = await db.execute(
                select(Patient).where(
                    Patient.mrn == patient_data["mrn"],
                    Patient.hospital_id == hospital.id,
                )
            )
            if existing.scalar_one_or_none():
                print(f"⏭️  Patient {patient_data['mrn']} already exists, skipping...")
                continue

            patient = Patient(hospital_id=hospital.id, **patient_data)
            db.add(patient)
            await db.flush()  # Get the patient ID
            created_patients.append(patient)
            print(
                f"✅ Created patient: {patient.first_name} {patient.last_name} (MRN: {patient.mrn})"
            )

        if not created_patients:
            print(
                "ℹ️  No new patients created. Loading existing patients for vitals seeding..."
            )
            result = await db.execute(
                select(Patient).where(Patient.hospital_id == hospital.id).limit(5)
            )
            created_patients = list(result.scalars().all())

        # Commit patients
        await db.commit()

        # Create vitals for each patient (multiple entries over time)
        print("\n📊 Creating vitals entries...")

        for patient in created_patients:
            # Calculate days since ECMO start
            days_on_ecmo = (
                (datetime.utcnow() - patient.ecmo_start_date).days
                if patient.ecmo_start_date
                else 0
            )
            num_entries = min(days_on_ecmo * 2, 10)  # 2 entries per day, max 10

            print(
                f"  Creating {num_entries} vitals entries for {patient.first_name} {patient.last_name}..."
            )

            for i in range(num_entries):
                # Entries every 12 hours, going backwards from now
                hours_ago = i * 12
                recorded_at = datetime.utcnow() - timedelta(hours=hours_ago)

                # Generate realistic vitals with some variation
                # Trend: improve over time (lower lactate, better pH, better oxygenation)
                trend_factor = 1 - (i / num_entries * 0.3)  # 0.7 to 1.0

                vitals = PatientVitals(
                    patient_id=patient.id,
                    recorded_by=nurse.id,
                    recorded_at=recorded_at,
                    # Basic vitals
                    heart_rate=random.randint(75, 110),
                    blood_pressure_systolic=random.randint(110, 140),
                    blood_pressure_diastolic=random.randint(65, 85),
                    respiratory_rate=random.randint(16, 24),
                    temperature=round(random.uniform(36.5, 37.8), 1),
                    spo2=random.randint(92, 98),
                    # ECMO-specific vitals
                    cvp=round(random.uniform(8, 14), 1),
                    pao2=round(random.uniform(80, 120) * trend_factor, 1),
                    paco2=round(random.uniform(35, 50) / trend_factor, 1),
                    ph=round(7.30 + (random.uniform(0, 0.15) * trend_factor), 2),
                    lactate=round(random.uniform(1.5, 4.0) / trend_factor, 1),
                    hco3=round(random.uniform(22, 28), 1),
                    notes=(
                        f"Routine ECMO monitoring - Day {i // 2 + 1}"
                        if i % 2 == 0
                        else None
                    ),
                )
                db.add(vitals)

        await db.commit()

        print(
            f"\n✅ Successfully seeded {len(created_patients)} patients with vitals data!"
        )
        print(f"🏥 Hospital: {hospital.name}")
        print(f"👨‍⚕️ Vitals recorded by: {nurse.full_name}")
        print("\n📋 Summary:")
        for patient in created_patients:
            vitals_count_result = await db.execute(
                select(PatientVitals).where(PatientVitals.patient_id == patient.id)
            )
            vitals_count = len(list(vitals_count_result.scalars().all()))
            print(
                f"  • {patient.first_name} {patient.last_name}: {vitals_count} vitals entries"
            )


if __name__ == "__main__":
    print("=" * 60)
    print("🌱 PATIENT & VITALS SEEDING SCRIPT")
    print("=" * 60)
    asyncio.run(seed_patients_and_vitals())
    print("\n" + "=" * 60)
    print("✅ SEEDING COMPLETE!")
    print("=" * 60)
