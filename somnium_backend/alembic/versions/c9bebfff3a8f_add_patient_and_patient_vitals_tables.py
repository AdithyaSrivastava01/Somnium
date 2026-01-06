"""Add patient and patient vitals tables

Revision ID: c9bebfff3a8f
Revises: 6f2869acd76c
Create Date: 2026-01-06 23:12:36.023359

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c9bebfff3a8f"
down_revision: Union[str, Sequence[str], None] = "6f2869acd76c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create patients table
    op.create_table(
        "patients",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("mrn", sa.String(length=50), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.DateTime(), nullable=False),
        sa.Column(
            "gender",
            sa.Enum("male", "female", "other", "prefer_not_to_say", name="gender"),
            nullable=False,
        ),
        sa.Column("hospital_id", sa.UUID(), nullable=False),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("admission_date", sa.DateTime(), nullable=False),
        sa.Column("discharge_date", sa.DateTime(), nullable=True),
        sa.Column("ecmo_start_date", sa.DateTime(), nullable=True),
        sa.Column(
            "ecmo_mode", sa.Enum("VV", "VA", "VAV", name="ecmomode"), nullable=True
        ),
        sa.Column("flow_rate", sa.Float(), nullable=True),
        sa.Column("sweep_gas", sa.Float(), nullable=True),
        sa.Column("fio2", sa.Float(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "active",
                "stable",
                "critical",
                "recovered",
                "deceased",
                name="patientstatus",
            ),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "fio2 IS NULL OR (fio2 >= 0 AND fio2 <= 1)", name="ck_patient_fio2_range"
        ),
        sa.CheckConstraint(
            "flow_rate IS NULL OR flow_rate >= 0", name="ck_patient_flow_rate_positive"
        ),
        sa.CheckConstraint(
            "sweep_gas IS NULL OR sweep_gas >= 0", name="ck_patient_sweep_gas_positive"
        ),
        sa.ForeignKeyConstraint(["hospital_id"], ["hospitals.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("mrn", "hospital_id", name="uq_patient_mrn_hospital"),
    )
    op.create_index(
        "ix_patients_hospital_active", "patients", ["hospital_id", "is_active"]
    )
    op.create_index(
        "ix_patients_hospital_status", "patients", ["hospital_id", "status"]
    )
    op.create_index(
        op.f("ix_patients_hospital_id"), "patients", ["hospital_id"], unique=False
    )
    op.create_index(op.f("ix_patients_mrn"), "patients", ["mrn"], unique=False)
    op.create_index(op.f("ix_patients_status"), "patients", ["status"], unique=False)
    op.create_index(
        op.f("ix_patients_is_active"), "patients", ["is_active"], unique=False
    )

    # Create patient_vitals table
    op.create_table(
        "patient_vitals",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("recorded_by", sa.UUID(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(), nullable=False),
        sa.Column("heart_rate", sa.Integer(), nullable=True),
        sa.Column("blood_pressure_systolic", sa.Integer(), nullable=True),
        sa.Column("blood_pressure_diastolic", sa.Integer(), nullable=True),
        sa.Column("respiratory_rate", sa.Integer(), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("spo2", sa.Integer(), nullable=True),
        sa.Column("cvp", sa.Float(), nullable=True),
        sa.Column("pao2", sa.Float(), nullable=True),
        sa.Column("paco2", sa.Float(), nullable=True),
        sa.Column("ph", sa.Float(), nullable=True),
        sa.Column("lactate", sa.Float(), nullable=True),
        sa.Column("hco3", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "heart_rate IS NULL OR (heart_rate >= 0 AND heart_rate <= 300)",
            name="ck_vitals_heart_rate_range",
        ),
        sa.CheckConstraint(
            "blood_pressure_systolic IS NULL OR (blood_pressure_systolic >= 0 AND blood_pressure_systolic <= 300)",
            name="ck_vitals_bp_systolic_range",
        ),
        sa.CheckConstraint(
            "blood_pressure_diastolic IS NULL OR (blood_pressure_diastolic >= 0 AND blood_pressure_diastolic <= 300)",
            name="ck_vitals_bp_diastolic_range",
        ),
        sa.CheckConstraint(
            "respiratory_rate IS NULL OR (respiratory_rate >= 0 AND respiratory_rate <= 100)",
            name="ck_vitals_respiratory_rate_range",
        ),
        sa.CheckConstraint(
            "temperature IS NULL OR (temperature >= 20 AND temperature <= 45)",
            name="ck_vitals_temperature_range",
        ),
        sa.CheckConstraint(
            "spo2 IS NULL OR (spo2 >= 0 AND spo2 <= 100)", name="ck_vitals_spo2_range"
        ),
        sa.CheckConstraint(
            "ph IS NULL OR (ph >= 6.0 AND ph <= 8.0)", name="ck_vitals_ph_range"
        ),
        sa.CheckConstraint(
            "lactate IS NULL OR lactate >= 0", name="ck_vitals_lactate_positive"
        ),
        sa.CheckConstraint("hco3 IS NULL OR hco3 >= 0", name="ck_vitals_hco3_positive"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recorded_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_patient_vitals_patient_recorded",
        "patient_vitals",
        ["patient_id", "recorded_at"],
    )
    op.create_index(
        op.f("ix_patient_vitals_patient_id"),
        "patient_vitals",
        ["patient_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_patient_vitals_recorded_at"),
        "patient_vitals",
        ["recorded_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_patient_vitals_recorded_at"), table_name="patient_vitals")
    op.drop_index(op.f("ix_patient_vitals_patient_id"), table_name="patient_vitals")
    op.drop_index("ix_patient_vitals_patient_recorded", table_name="patient_vitals")
    op.drop_table("patient_vitals")

    op.drop_index(op.f("ix_patients_is_active"), table_name="patients")
    op.drop_index(op.f("ix_patients_status"), table_name="patients")
    op.drop_index(op.f("ix_patients_mrn"), table_name="patients")
    op.drop_index(op.f("ix_patients_hospital_id"), table_name="patients")
    op.drop_index("ix_patients_hospital_status", table_name="patients")
    op.drop_index("ix_patients_hospital_active", table_name="patients")
    op.drop_table("patients")

    op.execute("DROP TYPE IF EXISTS gender")
    op.execute("DROP TYPE IF EXISTS ecmomode")
    op.execute("DROP TYPE IF EXISTS patientstatus")
