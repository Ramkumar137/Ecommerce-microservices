import os
import json
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from mangum import Mangum
from config.asgi import application
from analytics.services import AnalyticsService

logger = logging.getLogger(__name__)

_mangum_handler = Mangum(application, lifespan="off")


def lambda_handler(event, context):
    """
    AWS Lambda entry point for Analytics Service.
    Handles HTTP requests (API Gateway / Function URL) via Mangum,
    and direct invocation payloads via AnalyticsService.
    """
    # Check if event is an HTTP request payload
    if isinstance(event, dict) and any(k in event for k in ("httpMethod", "requestContext", "rawPath", "path")):
        return _mangum_handler(event, context)

    # Direct Lambda payload processing
    action = event.get("action") if isinstance(event, dict) else None

    try:
        if action == "get_orders":
            data = AnalyticsService.get_order_metrics()
        elif action == "get_payments":
            data = AnalyticsService.get_payment_metrics()
        elif action == "get_products":
            data = AnalyticsService.get_product_metrics()
        elif action == "get_inventory":
            data = AnalyticsService.get_inventory_metrics()
        elif action == "get_customers":
            data = AnalyticsService.get_customer_metrics()
        elif action == "get_sales":
            data = AnalyticsService.get_sales_metrics()
        elif action == "get_admin_analytics":
            data = AnalyticsService.get_admin_analytics()
        elif action == "get_revenue":
            data = AnalyticsService.get_revenue_metrics()
        else:
            data = AnalyticsService.get_dashboard_metrics()

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": True, "data": data}),
        }
    except Exception as e:
        logger.error(f"Error executing Lambda direct invocation: {e}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "error": str(e)}),
        }

