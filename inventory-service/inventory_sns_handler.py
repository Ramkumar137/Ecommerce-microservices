import os
import logging
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from handlers.sns_handler import handle_product_created

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    handle_product_created(event)
    logger.info("[Lambda] inventory_sns_handler completed")
    return {"statusCode": 200, "body": "Inventory processed successfully"}