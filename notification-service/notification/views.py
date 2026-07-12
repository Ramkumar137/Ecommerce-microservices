from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from shared.authentication import JWTAuthentication
from shared.permissions import (
    IsCustomer,
    IsAdmin,
)

from .serializers import (
    CreateNotificationSerializer,
)

from .services import NotificationService


class NotificationListCreateView(APIView):

    authentication_classes = [JWTAuthentication]

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdmin()]

        return [IsCustomer()]

    def get(self, request):

        try:

            notifications = NotificationService.get_notifications_by_user(
                request.user["user_id"]
            )

            return Response(
                notifications,
                status=status.HTTP_200_OK
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        serializer = CreateNotificationSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            notification = NotificationService.create_notification(
                serializer.validated_data
            )

            return Response(
                notification,
                status=status.HTTP_201_CREATED
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


class NotificationDetailView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request, notification_id):

        notification = NotificationService.get_notification(
            notification_id
        )

        if not notification:

            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if notification["user_id"] != request.user["user_id"]:

            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            notification,
            status=status.HTTP_200_OK
        )


class NotificationReadView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def patch(self, request, notification_id):

        notification = NotificationService.get_notification(
            notification_id
        )

        if not notification:

            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if notification["user_id"] != request.user["user_id"]:

            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            notification = NotificationService.mark_as_read(
                notification_id
            )

            return Response(
                notification,
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


class NotificationReadAllView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def patch(self, request):

        try:

            result = NotificationService.mark_all_as_read(
                request.user["user_id"]
            )

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationDeleteView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, notification_id):

        try:

            NotificationService.delete_notification(
                notification_id
            )

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthView(APIView):

    def get(self, request):

        return Response(
            NotificationService.health(),
            status=status.HTTP_200_OK
        )