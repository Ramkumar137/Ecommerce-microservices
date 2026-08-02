import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from notification.services import NotificationService


def lambda_handler(event, context):
    payload = event.get("payload") if isinstance(event, dict) else None
    if payload is None and isinstance(event, dict):
        payload = event

    if not isinstance(payload, dict):
        raise ValueError("Valid notification payload is required")

    result = NotificationService.handle_payload(payload)
    return {"statusCode": 200, "body": result}
