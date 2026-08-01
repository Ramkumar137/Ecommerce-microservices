from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from shared.authentication import JWTAuthentication
from shared.permissions import IsAdmin

from .services import AnalyticsService


def to_camel_case(snake_str):
    if not isinstance(snake_str, str):
        return snake_str
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def camelize_keys(data):
    if isinstance(data, dict):
        new_dict = {}
        for key, val in data.items():
            new_key = to_camel_case(key) if '_' in key else key
            new_dict[new_key] = camelize_keys(val)
        return new_dict
    elif isinstance(data, list):
        return [camelize_keys(item) for item in data]
    return data


def success_response(data, status_code=status.HTTP_200_OK):
    camel_data = camelize_keys(data)
    print("Analytics Debug:", camel_data)
    return Response(
        {
            "success": True,
            "data": camel_data,
        },
        status=status_code,
    )


def error_response(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, errors=None):
    return Response(
        {
            "success": False,
            "message": str(message),
            "errors": errors if errors is not None else [],
        },
        status=status_code,
    )


class HealthView(APIView):
    def get(self, request):
        return Response(
            {"status": "healthy", "service": "analytics-service"},
            status=status.HTTP_200_OK,
        )


class DashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_dashboard_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class AdminAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_admin_analytics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class SalesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_sales_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class OrdersAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_order_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class PaymentsAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_payment_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class ProductsAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_product_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class RevenueView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_revenue_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class InventoryAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_inventory_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class CustomerAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            data = AnalyticsService.get_customer_metrics()
            return success_response(data)
        except Exception as e:
            return error_response(e)


class UsersAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            from .direct_aggregator import DirectDynamoDBAggregator
            raw_users = DirectDynamoDBAggregator.get_users()
            clean_users = []
            for u in raw_users:
                uc = dict(u)
                uc.pop("password", None)
                uc.pop("hashed_password", None)
                clean_users.append(uc)
            return success_response(clean_users)
        except Exception as e:
            return error_response(e)
