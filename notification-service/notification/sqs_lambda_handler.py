import json
import logging
import os

from notification.dynamo_service import DynamoService
from notification.email.email_service import EmailService
from notification.message_builder import MessageBuilder

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
            role = (payload.get("role") or "CUSTOMER").upper()
            title = payload.get("title", "")

            logger.info(
                "[SQSConsumer] Received: type=%s channels=%s userId=%s",
                notification_type,
                channels,
                user_id,
            )

            content = MessageBuilder.build(payload)

            if "EMAIL" in channels:
                logger.info("[SQSConsumer] Sending email to=%s", email)
                try:
                    EmailService.send_notification_email(
                        to_email=email,
                        subject=content["subject"],
                        message=content["message"],
                    )
                    logger.info("[SQSConsumer] Email sent to=%s", email)
                except Exception as exc:
                    logger.exception("[SQSConsumer] Email failed to=%s error=%s", email, exc)

            if "IN_APP" in channels:
                DynamoService.store_notification(
                    {
                        "userId": user_id,
                        "type": notification_type,
                        "title": title,
                        "message": content["message"],
                        "role": role,
                    }
                )

            logger.info("[SQSConsumer] Processed: type=%s userId=%s", notification_type, user_id)
        except Exception as exc:
            logger.exception("[SQSConsumer] Failed to process record: %s", exc)
            raise

    return {"statusCode": 200}
