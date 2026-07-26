import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from handlers.sns_handler import handle_product_created


def lambda_handler(event, context):

    handle_product_created(event)

    return {
        "statusCode": 200,
        "body": "Inventory processed successfully"
    }