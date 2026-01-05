"""
Reset users and create test users with proper hospital email domains.
"""

import asyncio
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.domain.auth.models import User, Hospital, UserRole, AuditLog, RefreshToken
from app.core.security import get_password_hash


async def reset_and_seed_users():
    """Delete all users and create new test users with hospital emails."""
    async with AsyncSessionLocal() as session:
        # Delete dependent tables first (foreign key constraints)
        await session.execute(delete(AuditLog))
        await session.commit()
        print("✓ Deleted all audit logs")

        await session.execute(delete(RefreshToken))
        await session.commit()
        print("✓ Deleted all refresh tokens")

        # Delete all existing users
        await session.execute(delete(User))
        await session.commit()
        print("✓ Deleted all existing users")

        # Get some hospitals for test users
        stmt = select(Hospital).limit(10)
        result = await session.execute(stmt)
        hospitals = list(result.scalars().all())

        if not hospitals:
            print("❌ No hospitals found! Run migrations first.")
            return

        print(f"✓ Found {len(hospitals)} hospitals")

        # Test users with proper hospital email domains
        # Password for all: TestPassword123!
        test_users = [
            # UCLA Medical Center
            {
                "email": f"admin@{hospitals[0].email_domain}",
                "password": "TestPassword123!",
                "full_name": "Dr. Sarah Admin",
                "role": UserRole.ADMIN,
                "hospital_id": hospitals[0].id,
                "department": "Administration",
            },
            {
                "email": f"ecmo.specialist@{hospitals[0].email_domain}",
                "password": "TestPassword123!",
                "full_name": "Dr. Michael Chen",
                "role": UserRole.ECMO_SPECIALIST,
                "hospital_id": hospitals[0].id,
                "department": "Critical Care",
            },
            {
                "email": f"physician@{hospitals[0].email_domain}",
                "password": "TestPassword123!",
                "full_name": "Dr. Emily Rodriguez",
                "role": UserRole.PHYSICIAN,
                "hospital_id": hospitals[0].id,
                "department": "Cardiology",
            },
            {
                "email": f"nurse@{hospitals[0].email_domain}",
                "password": "TestPassword123!",
                "full_name": "Jessica Thompson RN",
                "role": UserRole.NURSE,
                "hospital_id": hospitals[0].id,
                "department": "ICU",
            },
        ]

        # Add users from other hospitals if available
        if len(hospitals) > 1:
            # Mayo Clinic
            test_users.extend(
                [
                    {
                        "email": f"admin@{hospitals[1].email_domain}",
                        "password": "TestPassword123!",
                        "full_name": "Dr. Robert Johnson",
                        "role": UserRole.ADMIN,
                        "hospital_id": hospitals[1].id,
                        "department": "Administration",
                    },
                    {
                        "email": f"physician@{hospitals[1].email_domain}",
                        "password": "TestPassword123!",
                        "full_name": "Dr. Amanda Williams",
                        "role": UserRole.PHYSICIAN,
                        "hospital_id": hospitals[1].id,
                        "department": "Pulmonology",
                    },
                ]
            )

        if len(hospitals) > 2:
            # Johns Hopkins
            test_users.extend(
                [
                    {
                        "email": f"admin@{hospitals[2].email_domain}",
                        "password": "TestPassword123!",
                        "full_name": "Dr. David Lee",
                        "role": UserRole.ADMIN,
                        "hospital_id": hospitals[2].id,
                        "department": "Administration",
                    },
                    {
                        "email": f"ecmo@{hospitals[2].email_domain}",
                        "password": "TestPassword123!",
                        "full_name": "Dr. Lisa Martinez",
                        "role": UserRole.ECMO_SPECIALIST,
                        "hospital_id": hospitals[2].id,
                        "department": "Critical Care",
                    },
                ]
            )

        # Create users
        for user_data in test_users:
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
                hospital_id=user_data["hospital_id"],
                department=user_data["department"],
            )
            session.add(user)

        await session.commit()
        print(f"\n✓ Created {len(test_users)} test users")

        # Display created users grouped by hospital
        print("\n" + "=" * 80)
        print("TEST USERS CREATED")
        print("=" * 80)
        print("\nPassword for all users: TestPassword123!\n")

        stmt = select(Hospital).order_by(Hospital.name)
        result = await session.execute(stmt)
        all_hospitals = list(result.scalars().all())

        for hospital in all_hospitals:
            stmt = (
                select(User).where(User.hospital_id == hospital.id).order_by(User.role)
            )
            result = await session.execute(stmt)
            hospital_users = list(result.scalars().all())

            if hospital_users:
                print(f"\n{hospital.name} (@{hospital.email_domain})")
                print("-" * 80)
                for user in hospital_users:
                    print(
                        f"  {user.role.value.upper():20} | {user.email:40} | {user.full_name}"
                    )


if __name__ == "__main__":
    asyncio.run(reset_and_seed_users())
