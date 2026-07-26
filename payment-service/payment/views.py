import traceback

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from integrations.sns_client import SNSClient
from shared.authentication import JWTAuthentication
from shared.permissions import IsCustomer

from .serializers import (
    CreatePaymentSerializer,
    UpdatePaymentStatusSerializer,
)
from .services import PaymentService

class PaymentListCreateView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request):
        try:

            payments = PaymentService.get_payments_by_user(
                request.user["user_id"]
            )

            return Response(
                payments,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def post(self, request):

        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            auth_header = request.headers.get("Authorization")
            token = auth_header.split()[1]
            payment = PaymentService.create_payment(
                order_id=serializer.validated_data["order_id"],
                user_id=request.user["user_id"],
                payment_method=serializer.validated_data["payment_method"],
                token = token
            )

            return Response(
                payment,
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentDetailView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request, payment_id):

        payment = PaymentService.get_payment(payment_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment["user_id"] != request.user["user_id"]:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(payment)

    def delete(self, request, payment_id):

        payment = PaymentService.get_payment(payment_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment["user_id"] != request.user["user_id"]:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            PaymentService.delete_payment(payment_id)

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentStatusView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def patch(self, request, payment_id):

        serializer = UpdatePaymentStatusSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        payment = PaymentService.get_payment(payment_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment["user_id"] != request.user["user_id"]:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            payment = PaymentService.update_status(
                payment_id=payment_id,
                status=serializer.validated_data["status"],
                transaction_id=serializer.validated_data.get(
                    "transaction_id",
                    "",
                ),
            )

            if payment["status"] == "SUCCESS":
                SNSClient().publish_payment_success(payment)

            elif payment["status"] == "FAILED":
                SNSClient().publish_payment_failed(payment)

            return Response(
                payment,
                status=status.HTTP_200_OK,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentByOrderView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request, order_id):

        payment = PaymentService.get_payment_by_order(order_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment["user_id"] != request.user["user_id"]:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            payment,
            status=status.HTTP_200_OK,
        )


class HealthView(APIView):
    def get(self, request):
        return Response(
            PaymentService.health(),
            status=status.HTTP_200_OK,
        )