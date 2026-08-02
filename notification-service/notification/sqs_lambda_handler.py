import json
import logging
import os

from notification.email.email_service import EmailService
from notification.dynamo_service import DynamoService

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    for record in event.get("Records", []):
        try:
            body = record.get("body", {})
            if isinstance(body, str):
                payload = json.loads(body)
            else:
                payload = body

            notification_type = payload.get("type")
            channels = payload.get("channels", [])
            user_id = payload.get("userId")
            email = payload.get("email")
            data = payload.get("data", {})

            if "EMAIL" in channels:
                EmailService.send_notification_email(
                    to_email=email,
                    subject=f"{notification_type} notification",
                    message=data.get("message", "You have a new notification"),
                )

            if "IN_APP" in channels:
                DynamoService.store_notification(
                    {
                        "userId": user_id,
                        "type": notification_type,
                        "message": data.get("message", "You have a new notification"),
                        "role": "CUSTOMER",
                    }
                )

            logger.info("Notification processed: %s", notification_type)
        except Exception as exc:
            logger.exception("Failed to process notification: %s", exc)
            raise

    return {"statusCode": 200}
