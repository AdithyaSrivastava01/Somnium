"""add_hospital_model_and_link_to_users

Revision ID: ea152404eb83
Revises: 22fe8fb63c97
Create Date: 2026-01-05 23:55:33.159009

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ea152404eb83"
down_revision: Union[str, Sequence[str], None] = "22fe8fb63c97"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create hospitals table
    op.create_table(
        "hospitals",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # Add hospital_id column to users table
    op.add_column("users", sa.Column("hospital_id", sa.Uuid(), nullable=True))
    op.create_index(
        op.f("ix_users_hospital_id"), "users", ["hospital_id"], unique=False
    )
    op.create_foreign_key(
        "fk_users_hospital_id", "users", "hospitals", ["hospital_id"], ["id"]
    )

    # Seed hospitals data
    from app.domain.auth.hospitals_data import USA_HOSPITALS
    from sqlalchemy import table, column
    from uuid import uuid4

    hospitals_table = table(
        "hospitals",
        column("id", sa.Uuid),
        column("name", sa.String),
        column("city", sa.String),
        column("state", sa.String),
    )

    hospitals_data = [
        {
            "id": uuid4(),
            "name": hospital["name"],
            "city": hospital["city"],
            "state": hospital["state"],
        }
        for hospital in USA_HOSPITALS
    ]

    op.bulk_insert(hospitals_table, hospitals_data)

    # Update existing users to assign them to the first hospital (as default)
    if hospitals_data:
        default_hospital_id = hospitals_data[0]["id"]
        op.execute(
            sa.text(
                f"UPDATE users SET hospital_id = '{default_hospital_id}' WHERE hospital_id IS NULL"
            )
        )

    # Now make hospital_id NOT NULL
    op.alter_column("users", "hospital_id", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop foreign key and column from users
    op.drop_constraint("fk_users_hospital_id", "users", type_="foreignkey")
    op.drop_index(op.f("ix_users_hospital_id"), table_name="users")
    op.drop_column("users", "hospital_id")

    # Drop hospitals table
    op.drop_table("hospitals")
