import json
import logging

from inventory.services import InventoryService

logger = logging.getLogger(__name__)


def handle_product_created(event):

    try:

        for record in event["Records"]:

            message = json.loads(record["Sns"]["Message"])

            event_type = message.get("event")
            data = message.get("data")

            if event_type == "PRODUCT_CREATED":

                InventoryService.create_inventory(
                    {
                        "product_id": data["product_id"],
                        "stock": data["stock"],
                    }
                )

                logger.info(
                    f"Inventory created for {data['product_id']}"
                )

            elif event_type == "PRODUCT_UPDATED":

                InventoryService.update_inventory(
                    data["product_id"],
                    {
                        "stock": data["stock"]
                    }
                )

                logger.info(
                    f"Inventory updated for {data['product_id']}"
                )

            elif event_type == "PRODUCT_DELETED":

                InventoryService.delete_inventory(
                    data["product_id"]
                )

                logger.info(
                    f"Inventory deleted for {data['product_id']}"
                )

    except Exception as e:
        logger.exception(e)
        raise