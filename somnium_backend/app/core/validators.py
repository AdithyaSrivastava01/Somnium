"""
Security validators for input validation and password strength.
"""

import re


# Removed custom exception - use ValueError directly for Pydantic compatibility


def validate_password_strength(password: str) -> str:
    """
    Validate password meets HIPAA and SOC2 security requirements.

    Requirements:
    - Minimum 8 characters, maximum 128 characters
    - At least one uppercase letter (A-Z)
    - At least one lowercase letter (a-z)
    - At least one digit (0-9)
    - At least one special character (!@#$%^&*(),.?":{}|<>)
    - Not a common password

    Args:
        password: Password string to validate

    Returns:
        The validated password string

    Raises:
        ValueError: If password doesn't meet requirements
    """
    errors = []

    # Length checks
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if len(password) > 128:
        errors.append("Password must be less than 128 characters long")

    # Complexity checks
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]', password):
        errors.append("Password must contain at least one special character")

    # Common password check (top 100 most common passwords)
    common_passwords = {
        "password",
        "12345678",
        "password123",
        "admin123",
        "letmein",
        "welcome",
        "monkey",
        "1234567890",
        "Password1",
        "Password123",
        "qwerty123",
        "abc123",
        "password1",
        "Password1!",
        "welcome123",
        "admin",
        "root",
        "toor",
        "pass",
        "test",
        "guest",
        "info",
        "adm",
        "mysql",
        "user",
        "administrator",
        "oracle",
        "ftp",
        "pi",
        "puppet",
        "ansible",
        "ec2-user",
        "vagrant",
        "azureuser",
    }

    if password.lower() in common_passwords:
        errors.append("Password is too common and easily guessable")

    # Check for sequential characters
    if re.search(
        r"(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)",
        password.lower(),
    ):
        errors.append("Password contains sequential characters")

    # Check for repeating characters
    if re.search(r"(.)\1{2,}", password):
        errors.append("Password contains too many repeating characters")

    if errors:
        raise ValueError("; ".join(errors))

    return password


def sanitize_string_input(
    value: str, max_length: int = 255, field_name: str = "input"
) -> str:
    """
    Sanitize string input to prevent XSS and injection attacks.

    Args:
        value: Input string to sanitize
        max_length: Maximum allowed length
        field_name: Field name for error messages

    Returns:
        Sanitized string

    Raises:
        ValueError: If input contains dangerous patterns
    """
    if not value:
        return value

    # Check length
    if len(value) > max_length:
        raise ValueError(f"{field_name} exceeds maximum length of {max_length}")

    # Check for HTML/script tags
    dangerous_patterns = [
        r"<script[^>]*>.*?</script>",
        r"<iframe[^>]*>.*?</iframe>",
        r"javascript:",
        r"on\w+\s*=",  # Event handlers like onclick=
        r"<embed",
        r"<object",
    ]

    for pattern in dangerous_patterns:
        if re.search(pattern, value, re.IGNORECASE | re.DOTALL):
            raise ValueError(f"{field_name} contains potentially dangerous content")

    return value.strip()


def validate_email_domain(email: str, allowed_domains: list[str] | None = None) -> str:
    """
    Validate email domain against allowlist (optional).

    Args:
        email: Email address to validate
        allowed_domains: Optional list of allowed domains

    Returns:
        Validated email

    Raises:
        ValueError: If domain not in allowlist
    """
    if not allowed_domains:
        return email

    domain = email.split("@")[-1].lower()
    if domain not in allowed_domains:
        raise ValueError(f"Email domain '{domain}' is not allowed")

    return email
