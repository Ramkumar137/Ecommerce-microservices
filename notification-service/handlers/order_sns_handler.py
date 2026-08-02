import json
import logging

from notification.services import NotificationService

logger = logging.getLogger(__name__)


def handle_order_created(event):

    try:

        for record in event["Records"]:

            message = json.loads(
                record["Sns"]["Message"]
            )

            event_type = message.get("event")
            data = message.get("data", {})

            if event_type == "ORDER_CREATED":

                NotificationService.create_notification(
                    {
                        "user_id": data["user_id"],
                        "type": "ORDER_CREATED",
                        "title": "Order Placed",
                        "message": (
                            f"Your order {data['order_id']} "
                            f"has been placed successfully."
                        ),
                        "channel": "IN_APP"
                    }
                )

            elif event_type == "ORDER_CONFIRMED":

                NotificationService.create_notification(
                    {
                        "user_id": data["user_id"],
                        "type": "ORDER_CONFIRMED",
                        "title": "Order Confirmed",
                        "message": (
                            f"Your order {data['order_id']} "
                            f"has been confirmed."
                        ),
                        "channel": "IN_APP"
                    }
                )

            elif event_type == "ORDER_CANCELLED":

                NotificationService.create_notification(
                    {
                        "user_id": data["user_id"],
                        "type": "ORDER_CANCELLED",
                        "title": "Order Cancelled",
                        "message": (
                            f"Your order {data['order_id']} "
                            f"has been cancelled because the payment failed."
                        ),
                        "channel": "IN_APP"
                    }
                )

            logger.info(
                f"Notification processed for {event_type}"
            )

    except Exception as e:
        logger.exception(e)
        raise