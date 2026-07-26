import json
import logging

from order.services import OrderService
from integrations.sns_client import SNSClient

logger = logging.getLogger(__name__)


def handle_payment_event(event):

    try:

        for record in event["Records"]:

            message = json.loads(
                record["Sns"]["Message"]
            )

            event_type = message.get("event")
            data = message.get("data")

            if event_type == "PAYMENT_SUCCESS":

                order = OrderService.update_status(
                    data["order_id"],
                    "CONFIRMED"
                )

                SNSClient().publish(
                    "ORDER_CONFIRMED",
                    order
                )

                logger.info(
                    f"Order {data['order_id']} confirmed."
                )

            elif event_type == "PAYMENT_FAILED":

                order = OrderService.update_status(
                    data["order_id"],
                    "CANCELLED"
                )

                SNSClient().publish(
                    "ORDER_CANCELLED",
                    order
                )

                logger.info(
                    f"Order {data['order_id']} cancelled."
                )

    except Exception:
        logger.exception("Payment event failed")
        raise