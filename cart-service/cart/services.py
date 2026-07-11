import logging
import os
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from integrations.product_client import ProductClient
from integrations.inventory_client import InventoryClient
from utils.dynamodb import get_table

logger = logging.getLogger(__name__)

class CartService:

    @staticmethod
    def get_table():
        table_name = os.getenv("CART_TABLE")

        if not table_name:
            raise ValueError("CART_TABLE environment variable not set")

        return get_table(table_name)

    @staticmethod
    def timestamp():
        return datetime.now(timezone.utc).isoformat()

    @classmethod
    def list_all_carts(cls):
        """
        Admin endpoint.
        Returns every cart item.
        """

        table = cls.get_table()

        items = []
        last_key = None

        while True:

            scan_kwargs = {}

            if last_key:
                scan_kwargs["ExclusiveStartKey"] = last_key

            response = table.scan(**scan_kwargs)

            items.extend(response.get("Items", []))

            last_key = response.get("LastEvaluatedKey")

            if not last_key:
                break

        return items

    @classmethod
    def get_cart(cls, user_id):
        """
        Returns all products inside one user's cart.
        """

        table = cls.get_table()

        response = table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )

        return response.get("Items", [])

    @classmethod
    def add_item(cls, user_id, product_id, quantity):

        table = cls.get_table()

        existing = table.get_item(
            Key={
                "user_id": user_id,
                "product_id": product_id,
            }
        ).get("Item")

        final_quantity = quantity

        if existing:
            final_quantity += existing["quantity"]

        # Validate product exists
        product = ProductClient.get_product(product_id)

        if not product:
            raise ValueError("Product does not exist.")

        # Validate inventory exists
        inventory = InventoryClient.get_inventory(product_id)

        if not inventory:
            raise ValueError("Inventory not found.")

        # Validate stock
        if final_quantity > inventory["available_stock"]:
            raise ValueError("Insufficient stock.")

        now = cls.timestamp()

        item = {
            "user_id": user_id,
            "product_id": product_id,
            "quantity": final_quantity,
            "created_at": existing["created_at"] if existing else now,
            "updated_at": now,
        }

        table.put_item(Item=item)

        logger.info(
            f"Added product {product_id} to cart {user_id}"
        )

        return item
    @classmethod
    def update_quantity(cls, user_id, product_id, quantity):

        table = cls.get_table()

        existing = table.get_item(
            Key={
                "user_id": user_id,
                "product_id": product_id,
            }
        ).get("Item")

        if not existing:
            raise ValueError("Product not found in cart.")

        existing["quantity"] = quantity
        existing["updated_at"] = cls.timestamp()

        table.put_item(Item=existing)

        logger.info(
            f"Updated quantity for {product_id}"
        )

        return existing

    @classmethod
    def remove_item(cls, user_id, product_id):

        table = cls.get_table()

        existing = table.get_item(
            Key={
                "user_id": user_id,
                "product_id": product_id,
            }
        ).get("Item")

        if not existing:
            raise ValueError("Product not found in cart.")

        table.delete_item(
            Key={
                "user_id": user_id,
                "product_id": product_id,
            }
        )

        logger.info(
            f"Removed {product_id} from cart"
        )

        return True

    @classmethod
    def clear_cart(cls, user_id):

        table = cls.get_table()

        items = cls.get_cart(user_id)

        for item in items:

            table.delete_item(
                Key={
                    "user_id": item["user_id"],
                    "product_id": item["product_id"],
                }
            )

        logger.info(
            f"Cleared cart for {user_id}"
        )

        return True

    @staticmethod
    def health():

        return {
            "status": "UP",
            "service": "cart"
        }