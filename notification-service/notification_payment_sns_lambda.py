import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

import django
django.setup()

from handlers.payment_sns_handler import (
    handle_payment_event
)


def lambda_handler(event, context):

    handle_payment_event(event)

    return {
        "statusCode": 200
    }