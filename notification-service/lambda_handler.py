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
    AWS Lambda entry point for Notification Service.
    Handles HTTP requests (API Gateway REST API, HTTP API v2, Function URL) via Mangum,
    normalizes event paths/stages, and handles direct invocation payloads.
    """
    if isinstance(event, dict) and any(k in event for k in ("httpMethod", "requestContext", "rawPath", "path")):
        try:
            http_method = (event.get("httpMethod") or (event.get("requestContext", {}).get("http", {}).get("method")) or "").upper()
            if http_method == "OPTIONS":
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                        "Access-Control-Allow-Credentials": "true",
                    },
                    "body": "",
                }

            normalized_event = dict(event)
            req_ctx = normalized_event.get("requestContext")
            if isinstance(req_ctx, dict):
                stage = req_ctx.get("stage")
                if stage and isinstance(stage, str) and stage != "$default":
                    stage_prefix = f"/{stage}"
                    path = normalized_event.get("path", "")
                    if path.startswith(stage_prefix):
                        normalized_event["path"] = path[len(stage_prefix):] or "/"
                    raw_path = normalized_event.get("rawPath", "")
                    if raw_path.startswith(stage_prefix):
                        normalized_event["rawPath"] = raw_path[len(stage_prefix):] or "/"

            if "resource" not in normalized_event and "version" not in normalized_event:
                normalized_event["resource"] = "/{proxy+}"

            response = _mangum_handler(normalized_event, context)
            if isinstance(response, dict):
                if "headers" not in response or not response["headers"]:
                    response["headers"] = {}
                response["headers"]["Access-Control-Allow-Origin"] = "*"
                response["headers"]["Access-Control-Allow-Headers"] = "*"
                response["headers"]["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                response["headers"]["Access-Control-Allow-Credentials"] = "true"
            return response
        except Exception as e:
            logger.error(f"Error handling HTTP request via Mangum: {e}", exc_info=True)
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                },
                "body": json.dumps({"error": "Internal Server Error", "message": str(e)}),
            }

    try:
        action = event.get("action") if isinstance(event, dict) else None
        if action == "health":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"status": "UP", "service": "notification"}),
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
