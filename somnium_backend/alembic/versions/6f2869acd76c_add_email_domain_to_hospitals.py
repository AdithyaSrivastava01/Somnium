"""add_email_domain_to_hospitals

Revision ID: 6f2869acd76c
Revises: ea152404eb83
Create Date: 2026-01-06 00:24:59.642198

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6f2869acd76c"
down_revision: Union[str, Sequence[str], None] = "ea152404eb83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add email_domain column (nullable first)
    op.add_column(
        "hospitals", sa.Column("email_domain", sa.String(length=100), nullable=True)
    )

    # Update existing hospitals with email domains
    from app.domain.auth.hospitals_data import USA_HOSPITALS

    for hospital_data in USA_HOSPITALS:
        op.execute(
            sa.text(
                f"UPDATE hospitals SET email_domain = :email_domain WHERE name = :name"
            ).bindparams(
                email_domain=hospital_data["email_domain"], name=hospital_data["name"]
            )
        )

    # Make column NOT NULL
    op.alter_column("hospitals", "email_domain", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("hospitals", "email_domain")
