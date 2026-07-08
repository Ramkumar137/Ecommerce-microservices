from django.shortcuts import render

# Create your views here.
# payment/views.py
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    CreatePaymentSerializer,
    UpdatePaymentStatusSerializer,
)

from .services import PaymentService


class PaymentListCreateView(APIView):
    """
    GET  /api/v1/payments/
    POST /api/v1/payments/
    """

    def get(self, request):
        payments = PaymentService.get_all_payments()
        return Response(payments, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment = PaymentService.create_payment(
                order_id=serializer.validated_data["order_id"],
                user_id=serializer.validated_data["user_id"],
                amount=serializer.validated_data["amount"],
                currency=serializer.validated_data["currency"],
                payment_method=serializer.validated_data["payment_method"],
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
    """
    GET /api/v1/payments/<payment_id>/
    DELETE /api/v1/payments/<payment_id>/
    """

    def get(self, request, payment_id):

        payment = PaymentService.get_payment(payment_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(payment)

    def delete(self, request, payment_id):

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


class PaymentStatusView(APIView):
    """
    PUT /api/v1/payments/<payment_id>/status/
    """

    def put(self, request, payment_id):

        serializer = UpdatePaymentStatusSerializer(
            data=request.data
        )

        if not serializer.is_valid(raise_exception=True):
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
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
    """
    GET /api/v1/payments/order/<order_id>/
    """

    def get(self, request, order_id):

        payment = PaymentService.get_payment_by_order(order_id)

        if not payment:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            payment,
            status=status.HTTP_200_OK,
        )


class HealthView(APIView):
    """
    GET /api/v1/payments/health/
    """

    def get(self, request):

        return Response(
            PaymentService.health(),
            status=status.HTTP_200_OK,
        )