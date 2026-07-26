import json
import logging

from inventory.services import InventoryService

logger = logging.getLogger(__name__)


def handle_order_created(event):

    try:

        for record in event["Records"]:

            message = json.loads(record["Sns"]["Message"])

            event_type = message.get("event")
            data = message.get("data")

            items = data.get("items", [])

            # Reserve stock
            if event_type == "ORDER_CREATED":

                for item in items:

                    InventoryService.reserve_stock(
                        item["product_id"],
                        item["quantity"]
                    )

                    logger.info(
                        f"Reserved {item['quantity']} of {item['product_id']}"
                    )

            # Release stock
            elif event_type == "ORDER_CANCELLED":

                for item in items:

                    InventoryService.release_stock(
                        item["product_id"],
                        item["quantity"]
                    )

                    logger.info(
                        f"Released {item['quantity']} of {item['product_id']}"
                    )

    except Exception as e:
        logger.exception(e)
        raise