# auth/services.py

import os
import uuid
import bcrypt

from datetime import datetime, timezone

from utils.dynamodb import get_table
from shared.jwt_utils import JWTService

class AuthService:
    """
    Business logic for Auth Service.
    """

    @staticmethod
    def get_table():
        """
        Return DynamoDB users table.
        """

        table_name = os.getenv("USER_TABLE")

        if not table_name:
            raise ValueError(
                "USER_TABLE environment variable not set."
            )

        return get_table(table_name)

    @staticmethod
    def _timestamp():
        """
        Current UTC timestamp.
        """

        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _generate_user_id():
        """
        Generate unique user id.
        """

        return f"usr-{uuid.uuid4().hex[:8]}"

    @staticmethod
    def _serialize_user(user):
        """
        Remove password before sending response.
        """

        result = dict(user)
        result.pop("password", None)
        return result

    @classmethod
    def get_user(cls, user_id):
        """
        Get user by user_id.
        """

        table = cls.get_table()

        response = table.get_item(
            Key={
                "user_id": user_id
            }
        )

        item = response.get("Item")

        if not item:
            raise ValueError("User not found.")

        return cls._serialize_user(item)

    @classmethod
    def get_user_by_email(cls, email):
        """
        Find user using email.

        NOTE:
        Uses table scan for simplicity.
        Replace with GSI in production.
        """

        table = cls.get_table()

        response = table.scan()

        users = response.get("Items", [])

        for user in users:

            if user["email"].lower() == email.lower():
                return user

        return None

    @classmethod
    def get_user_by_username(cls, username):
        """
        Find user using username.

        NOTE:
        Uses table scan.
        Replace with username-index GSI
        in production.
        """

        table = cls.get_table()

        response = table.scan()

        users = response.get("Items", [])

        for user in users:

            if user["username"].lower() == username.lower():
                return user

        return None
    @classmethod
    def register_user(cls,first_name,last_name,username,email,phone,password,role,):
        """
        Register a new user.
        """

        table = cls.get_table()

        # Check duplicate email
        if cls.get_user_by_email(email):
            raise ValueError("Email already exists.")

        # Check duplicate username
        if cls.get_user_by_username(username):
            raise ValueError("Username already exists.")

        now = cls._timestamp()

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        user = {
            "user_id": cls._generate_user_id(),
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "email": email.lower(),
            "phone": phone,
            "password": hashed_password,
            "role": role.upper(),
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        table.put_item(Item=user)

        return cls._serialize_user(user)

    @classmethod
    def login_user(cls,email,password,):
        """
        Authenticate user.
        """
        user = cls.get_user_by_email(email)

        if not user:
            raise ValueError("Invalid email or password.")

        valid = bcrypt.checkpw(
            password.encode("utf-8"),
            user["password"].encode("utf-8"),
        )

        if not valid:
            raise ValueError("Invalid email or password.")

        access_token = JWTService.generate_access_token(user)

        refresh_token = JWTService.generate_refresh_token(user)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": cls._serialize_user(user),
        }

    @classmethod
    def update_profile(cls,user_id,data,):
        """
        Update user profile.
        """
        table = cls.get_table()
        response = table.get_item(
            Key={
                "user_id": user_id
            }
        )

        user = response.get("Item")

        if not user:
            raise ValueError("User not found.")

        update_expression = []
        expression_values = {}

        for field in [
            "first_name",
            "last_name",
            "phone",
        ]:

            if field in data:

                update_expression.append(
                    f"{field}=:{field}"
                )

                expression_values[f":{field}"] = data[field]

                user[field] = data[field]

        update_expression.append(
            "updated_at=:updated_at"
        )

        expression_values[":updated_at"] = cls._timestamp()

        user["updated_at"] = expression_values[":updated_at"]

        table.update_item(
            Key={
                "user_id": user_id
            },
            UpdateExpression="SET " + ", ".join(update_expression),
            ExpressionAttributeValues=expression_values,
        )

        return cls._serialize_user(user)

    @classmethod
    def delete_user(cls,user_id,):
        table = cls.get_table()
        response = table.get_item(
            Key={
                "user_id": user_id
            }
        )

        if "Item" not in response:
            raise ValueError("User not found.")

        table.delete_item(
            Key={
                "user_id": user_id
            }
        )

        return True

    @staticmethod
    def health():
        """
        Health endpoint.
        """

        return {
            "status": "UP",
            "service": "auth"
        }