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

            data = message["data"]

            if event_type == "PAYMENT_SUCCESS":

                NotificationService.create_notification(
                    {
                        "user_id": data["user_id"],
                        "type": "PAYMENT",
                        "title": "Payment Successful",
                        "message": (
                            f"Payment received for "
                            f"Order {data['order_id']}."
                        ),
                        "channel": "IN_APP"
                    }
                )

            elif event_type == "PAYMENT_FAILED":

                NotificationService.create_notification(
                    {
                        "user_id": data["user_id"],
                        "type": "PAYMENT",
                        "title": "Payment Failed",
                        "message": (
                            f"Payment failed for "
                            f"Order {data['order_id']}."
                        ),
                        "channel": "IN_APP"
                    }
                )

    except Exception as e:
        logger.exception(e)
        raise