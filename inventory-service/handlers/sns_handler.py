import json
import logging

from inventory.services import InventoryService

logger = logging.getLogger(__name__)


def handle_product_created(event):

    for record in event.get("Records", []):
        message_id = record.get("Sns", {}).get("MessageId", "unknown")
        try:
            message = json.loads(record["Sns"]["Message"])
            event_type = message.get("event")
            data = message.get("data", {})
            product_id = data.get("product_id")

            logger.info(
                "[SNS] message_id=%s event_type=%s product_id=%s",
                message_id, event_type, product_id,
            )

            if event_type == "PRODUCT_CREATED":
                existing = InventoryService.get_inventory(product_id)
                if existing:
                    logger.info(
                        "[PRODUCT_CREATED] Skipping duplicate: inventory already exists "
                        "for product_id=%s", product_id,
                    )
                    continue

                try:
                    # Always initialize inventory at zero.
                    # The product catalogue stock field is not inventory stock.
                    InventoryService.create_inventory(
                        {"product_id": product_id, "stock": 0}
                    )
                    logger.info(
                        "[PRODUCT_CREATED] Inventory initialized at 0 for product_id=%s",
                        product_id,
                    )
                except ValueError as e:
                    # Race condition: another Lambda execution created it first.
                    logger.info(
                        "[PRODUCT_CREATED] Skipping: %s product_id=%s", str(e), product_id,
                    )

            elif event_type == "PRODUCT_UPDATED":
                # Never overwrite live inventory stock on a product metadata update.
                # Only create the inventory record if it is missing.
                existing = InventoryService.get_inventory(product_id)
                if not existing:
                    try:
                        InventoryService.create_inventory(
                            {"product_id": product_id, "stock": 0}
                        )
                        logger.info(
                            "[PRODUCT_UPDATED] Inventory created (was missing) for product_id=%s",
                            product_id,
                        )
                    except ValueError:
                        pass
                else:
                    logger.info(
                        "[PRODUCT_UPDATED] Inventory unchanged for product_id=%s", product_id,
                    )

            elif event_type == "PRODUCT_DELETED":
                InventoryService.delete_inventory(product_id)
                logger.info(
                    "[PRODUCT_DELETED] Inventory deleted for product_id=%s", product_id,
                )

            else:
                logger.warning(
                    "[SNS] Unhandled event_type=%s message_id=%s",
                    event_type, message_id,
                )

        except Exception as e:
            logger.exception(
                "[SNS] Failed to process message_id=%s: %s", message_id, e,
            )
            raise
