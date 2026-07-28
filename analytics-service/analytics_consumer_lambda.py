import os
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from analytics.consumers import AnalyticsConsumer

logger = logging.getLogger(__name__)

_consumer = AnalyticsConsumer()


def lambda_handler(event, context):
    """
    Entry point for Lambda triggered by SQS event source mapping.
    AWS delivers the SQS batch directly in event["Records"].
    """
    records = event.get("Records", [])

    if not records:
        logger.info("No records in event.")
        return {"statusCode": 200, "body": {"processed": 0, "failed": 0}}

    logger.info(f"Received {len(records)} record(s) from SQS trigger.")

    result = _consumer.process_batch(records)

    return {"statusCode": 200, "body": result}
