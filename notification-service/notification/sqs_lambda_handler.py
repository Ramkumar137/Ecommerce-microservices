import json
import logging

from notification.services import NotificationService

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    for record in event.get("Records", []):
        try:
            body = record.get("body", {})
            if isinstance(body, str):
                payload = json.loads(body)
            else:
                payload = body

            NotificationService.handle_payload(payload)
        except Exception as exc:
            logger.exception("[SQSConsumer] Failed to process record: %s", exc)
            raise

    return {"statusCode": 200}
