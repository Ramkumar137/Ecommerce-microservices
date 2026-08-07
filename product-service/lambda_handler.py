import os
import json
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from mangum import Mangum
from config.asgi import application

logger = logging.getLogger(__name__)
_mangum_handler = Mangum(application, lifespan="off")


def lambda_handler(event, context=None):
    """
    AWS Lambda entry point for Product Service.
    Handles HTTP requests (API Gateway / Function URL) via Mangum,
    and direct invocation payloads.
    """
    if isinstance(event, dict) and any(k in event for k in ("httpMethod", "requestContext", "rawPath", "path")):
        return _mangum_handler(event, context)

    try:
        action = event.get("action") if isinstance(event, dict) else None
        if action == "health":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"status": "UP", "service": "product"}),
            }
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": True, "event": event}),
        }
    except Exception as e:
        logger.error(f"Error executing Lambda direct invocation: {e}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "error": str(e)}),
        }
