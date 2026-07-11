# auth/validators.py

import re
from rest_framework import serializers

VALID_ROLES = ["CUSTOMER","ADMIN",]


def validate_first_name(first_name):
    """
    Validate first name.
    """

    if not first_name or not str(first_name).strip():
        raise serializers.ValidationError(
            "First name is required."
        )

    if len(first_name.strip()) < 2:
        raise serializers.ValidationError(
            "First name must contain at least 2 characters."
        )

    return first_name.strip()


def validate_last_name(last_name):
    """
    Validate last name.
    """

    if not last_name or not str(last_name).strip():
        raise serializers.ValidationError(
            "Last name is required."
        )

    if len(last_name.strip()) < 2:
        raise serializers.ValidationError(
            "Last name must contain at least 2 characters."
        )

    return last_name.strip()


def validate_username(username):
    """
    Validate username.
    """

    if not username or not str(username).strip():
        raise serializers.ValidationError(
            "Username is required."
        )

    username = username.strip()

    if len(username) < 4:
        raise serializers.ValidationError(
            "Username must contain at least 4 characters."
        )

    return username


def validate_email(email):
    """
    Validate email.
    """

    if not email or not str(email).strip():
        raise serializers.ValidationError(
            "Email is required."
        )

    email = email.strip().lower()

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(pattern, email):
        raise serializers.ValidationError(
            "Enter a valid email address."
        )

    return email


def validate_phone(phone):
    """
    Validate phone number.
    """

    if not phone or not str(phone).strip():
        raise serializers.ValidationError(
            "Phone number is required."
        )

    phone = phone.strip()

    if not phone.isdigit():
        raise serializers.ValidationError(
            "Phone number must contain only digits."
        )

    if len(phone) != 10:
        raise serializers.ValidationError(
            "Phone number must contain exactly 10 digits."
        )

    return phone


def validate_password(password):
    """
    Validate password strength.
    """

    if not password:
        raise serializers.ValidationError(
            "Password is required."
        )

    if len(password) < 8:
        raise serializers.ValidationError(
            "Password must contain at least 8 characters."
        )

    if not re.search(r"[A-Z]", password):
        raise serializers.ValidationError(
            "Password must contain at least one uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise serializers.ValidationError(
            "Password must contain at least one lowercase letter."
        )

    if not re.search(r"\d", password):
        raise serializers.ValidationError(
            "Password must contain at least one number."
        )

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise serializers.ValidationError(
            "Password must contain at least one special character."
        )

    return password


def validate_role(role):
    """
    Validate user role.
    """

    role = role.upper()

    if role not in VALID_ROLES:
        raise serializers.ValidationError(
            f"Allowed roles: {', '.join(VALID_ROLES)}"
        )

    return role