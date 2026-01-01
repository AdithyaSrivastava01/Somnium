"""
Seed test users into the database.
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.domain.auth.models import UserRole
from app.domain.auth.service import AuthService


async def seed_test_users():
    """Create test users for each role."""

    # Create async engine
    engine = create_async_engine(str(settings.DATABASE_URL), echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        auth_service = AuthService(session)

        test_users = [
            {
                "email": "nurse@hospital.com",
                "password": "Nurse@2025!Secure",
                "full_name": "Jane Nurse",
                "role": UserRole.NURSE,
                "department": "ICU",
            },
            {
                "email": "physician@hospital.com",
                "password": "Physician@2025!Secure",
                "full_name": "Dr. John Physician",
                "role": UserRole.PHYSICIAN,
                "department": "Cardiology",
            },
            {
                "email": "ecmo@hospital.com",
                "password": "ECMO@2025!Secure",
                "full_name": "Dr. Emily ECMO",
                "role": UserRole.ECMO_SPECIALIST,
                "department": "ECMO Unit",
            },
            {
                "email": "admin@hospital.com",
                "password": "Admin@2025!Secure",
                "full_name": "Admin User",
                "role": UserRole.ADMIN,
                "department": "Administration",
            },
        ]

        print("🌱 Seeding test users...")

        for user_data in test_users:
            try:
                user = await auth_service.create_user(**user_data)
                print(f"✅ Created user: {user.email} ({user.role.value})")
            except Exception as e:
                print(f"⚠️  User {user_data['email']} already exists or error: {e}")

        print("\n✨ Seeding complete!")
        print("\nTest Users:")
        print("-" * 60)
        for user_data in test_users:
            print(
                f"Role: {user_data['role'].value:20} | Email: {user_data['email']:30} | Password: {user_data['password']}"
            )
        print("-" * 60)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_test_users())
