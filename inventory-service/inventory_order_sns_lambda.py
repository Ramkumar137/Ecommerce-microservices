import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

import django
django.setup()

from handlers.order_sns_handler import handle_order_created


def lambda_handler(event, context):
    return handle_order_created(event)