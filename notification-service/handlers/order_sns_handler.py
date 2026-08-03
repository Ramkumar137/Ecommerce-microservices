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
                        "user_id": data.get("user_id"),
                        "email": data.get("email"),
                        "type": "ORDER_CREATED",
                        "title": "Order Placed",
                        "message": (
                            f"Your order {data.get('order_id')} "
                            f"has been placed successfully."
                        ),
                        "channels": ["IN_APP", "EMAIL"],
                        "data": {"orderId": data.get("order_id")},
                    }
                )

                # Admin IN_APP notification for every new order
                NotificationService.create_notification(
                    {
                        "user_id": "admin",
                        "role": "ADMIN",
                        "type": "ORDER_CREATED",
                        "title": "New Order Received",
                        "message": (
                            f"A new order {data.get('order_id')} has been placed."
                        ),
                        "channels": ["IN_APP"],
                        "data": {"orderId": data.get("order_id")},
                    }
                )

            elif event_type == "ORDER_CONFIRMED":

                NotificationService.create_notification(
                    {
                        "user_id": data.get("user_id"),
                        "email": data.get("email"),
                        "type": "ORDER_CONFIRMED",
                        "title": "Order Confirmed",
                        "message": (
                            f"Your order {data.get('order_id')} "
                            f"has been confirmed."
                        ),
                        "channels": ["IN_APP", "EMAIL"],
                        "data": {"orderId": data.get("order_id")},
                    }
                )

            elif event_type == "ORDER_CANCELLED":

                NotificationService.create_notification(
                    {
                        "user_id": data.get("user_id"),
                        "email": data.get("email"),
                        "type": "ORDER_CANCELLED",
                        "title": "Order Cancelled",
                        "message": (
                            f"Your order {data.get('order_id')} "
                            f"has been cancelled because the payment failed."
                        ),
                        "channels": ["IN_APP", "EMAIL"],
                        "data": {"orderId": data.get("order_id")},
                    }
                )

            logger.info(
                f"Notification processed for {event_type}"
            )

    except Exception as e:
        logger.exception(e)
        raise