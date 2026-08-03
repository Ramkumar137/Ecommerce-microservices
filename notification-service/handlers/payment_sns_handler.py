import json
import logging

from notification.services import NotificationService

logger = logging.getLogger(__name__)


def handle_payment_event(event):

    try:

        for record in event["Records"]:

            message = json.loads(
                record["Sns"]["Message"]
            )

            event_type = message.get("event")

            data = message.get("data", {})

            if event_type == "PAYMENT_SUCCESS":

                NotificationService.create_notification(
                    {
                        "user_id": data.get("user_id"),
                        "email": data.get("email"),
                        "type": "PAYMENT_SUCCESS",
                        "title": "Payment Successful",
                        "message": (
                            f"Payment received for "
                            f"Order {data.get('order_id')}."
                        ),
                        "channels": ["IN_APP", "EMAIL"],
                        "data": {
                            "orderId": data.get("order_id"),
                            "amount": str(data.get("amount", "")),
                        },
                    }
                )

            elif event_type == "PAYMENT_FAILED":

                NotificationService.create_notification(
                    {
                        "user_id": data.get("user_id"),
                        "email": data.get("email"),
                        "type": "PAYMENT_FAILED",
                        "title": "Payment Failed",
                        "message": (
                            f"Payment failed for "
                            f"Order {data.get('order_id')}."
                        ),
                        "channels": ["IN_APP", "EMAIL"],
                        "data": {
                            "orderId": data.get("order_id"),
                        },
                    }
                )

    except Exception as e:
        logger.exception(e)
        raise