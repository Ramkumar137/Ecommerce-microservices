from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from shared.authentications import JWTAuthentication
from shared.permissions import IsAuthenticatedUser, IsAdmin
import traceback
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    UpdateProfileSerializer,
)
from shared.jwt_utils import JWTService
from .services import AuthService

class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            user = AuthService.register_user(
                first_name=serializer.validated_data["first_name"],
                last_name=serializer.validated_data["last_name"],
                username=serializer.validated_data["username"],
                email=serializer.validated_data["email"],
                phone=serializer.validated_data["phone"],
                password=serializer.validated_data["password"],
                role=serializer.validated_data["role"],
            )

            return Response(
                user,
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # except Exception:

        #     return Response(
        #         {"error": "Internal server error"},
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
        #     )

        except Exception as e:
            traceback.print_exc()

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            tokens = AuthService.login_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )

            return Response(
                tokens,
                status=status.HTTP_200_OK
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):

        return Response(
            {
                "message": "Logged out successfully. Please remove the access and refresh tokens from the client."
            },
            status=status.HTTP_200_OK
        )

class RefreshTokenView(APIView):

    def post(self, request):

        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            access_token = JWTService.refresh_access_token(
                serializer.validated_data["refresh_token"]
            )

            return Response(
                {
                    "access_token": access_token
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):

        try:
            user_id = request.user["user_id"]
            user = AuthService.get_user(user_id)

            return Response(
                user,
                status=status.HTTP_200_OK
            )

        except ValueError:
            # Fallback to user claims in token if record not found in DynamoDB
            req_user = request.user if isinstance(request.user, dict) else {}
            fallback_user = {
                "user_id": req_user.get("user_id", "usr-unknown"),
                "email": req_user.get("email", ""),
                "first_name": req_user.get("first_name", "User"),
                "last_name": req_user.get("last_name", ""),
                "username": req_user.get("username", req_user.get("email", "")),
                "role": req_user.get("role", "CUSTOMER"),
                "is_active": True,
            }
            return Response(fallback_user, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def put(self, request):

        serializer = UpdateProfileSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            user_id = request.user["user_id"]
            user = AuthService.update_profile(
                user_id,
                serializer.validated_data
            )

            return Response(
                user,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def delete(self, request):

        try:
            user_id = request.user["user_id"]
            AuthService.delete_user(user_id)

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthView(APIView):

    def get(self, request):

        return Response(
            AuthService.health(),
            status=status.HTTP_200_OK
        )


class UserListView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):

        try:
            users = AuthService.get_all_users()
            return Response(
                users,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserDetailView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request, user_id):

        try:
            user = AuthService.get_user(user_id)
            return Response(
                user,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )