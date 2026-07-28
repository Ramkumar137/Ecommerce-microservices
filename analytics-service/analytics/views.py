from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class HealthView(APIView):
    def get(self, request):
        return Response(
            {"status": "healthy", "service": "analytics-service"},
            status=status.HTTP_200_OK,
        )


class DashboardView(APIView):
    def get(self, request):
        return Response(
            {"message": "Not implemented"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class SalesView(APIView):
    def get(self, request):
        return Response(
            {"message": "Not implemented"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class OrdersAnalyticsView(APIView):
    def get(self, request):
        return Response(
            {"message": "Not implemented"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class ProductsAnalyticsView(APIView):
    def get(self, request):
        return Response(
            {"message": "Not implemented"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class RevenueView(APIView):
    def get(self, request):
        return Response(
            {"message": "Not implemented"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
