# order/services.py

import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from utils.dynamodb import get_table
from integrations.product_client import ProductClient
from integrations.inventory_client import InventoryClient

class OrderService:

    @staticmethod
    def get_table():
        table_name = os.getenv("ORDER_TABLE")
        if not table_name:
            raise ValueError("ORDER_TABLE environment variable not set")
        return get_table(table_name)

    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _generate_order_id():
        return f"ord-{uuid.uuid4().hex[:8]}"

    @staticmethod
    def _serialize_order(order):
        """Convert Decimal fields to float for JSON serialization."""
        result = dict(order)
        result["total_amount"] = float(result["total_amount"])
        result["items"] = [
            {
                **item,
                "unit_price": float(item["unit_price"]),
                "subtotal": float(item["subtotal"]),
            }
            for item in result["items"]
        ]
        return result

    @classmethod
    def create_order(cls, user_id, items, token):

        table = cls.get_table()

        order_items = []

        total_amount = Decimal("0.00")

        now = cls._timestamp()

        for item in items:

            quantity = item["quantity"]

            product = ProductClient.get_product(item["product_id"],token)

            if not product:
                raise ValueError(
                    f"Product {item['product_id']} not found."
                )

            inventory = InventoryClient.get_inventory(item["product_id"])

            if not inventory:
                raise ValueError(
                    f"Inventory for product {item['product_id']} not found."
                )

            if inventory["available_stock"] < quantity:
                raise ValueError(
                    f"Insufficient stock for product {item['product_id']}."
                )

            # Reserve stock
            InventoryClient.reserve_stock(
                item["product_id"],
                quantity,
                token
            )

            unit_price = Decimal(str(product["price"]))

            subtotal = unit_price * quantity

            order_items.append({
                "product_id": product["product_id"],
                "product_name": product["name"],
                "unit_price": unit_price,
                "quantity": quantity,
                "subtotal": subtotal,
            })

            total_amount += subtotal

        order = {
            "order_id": cls._generate_order_id(),
            "user_id": user_id,
            "status": "PENDING",
            "items": order_items,
            "total_amount": total_amount,
            "created_at": now,
            "updated_at": now,
        }

        table.put_item(Item=order)

        return cls._serialize_order(order)

    @classmethod
    def get_order(cls, order_id):
        table = cls.get_table()
        response = table.get_item(Key={"order_id": order_id})
        return cls._serialize_order(response["Item"]) if "Item" in response else None

    @classmethod
    def get_all_orders(cls):
        table = cls.get_table()
        items = []
        last_key = None
        while True:
            kwargs = {}
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key
            response = table.scan(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break
        return [cls._serialize_order(o) for o in items]

    @classmethod
    def get_orders_by_user(cls, user_id):
        table = cls.get_table()
        items = []
        last_key = None
        while True:
            kwargs = {}
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key
            response = table.scan(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break
        return [cls._serialize_order(o) for o in items if o["user_id"] == user_id]

    @classmethod
    def update_status(cls, order_id, status):
        table = cls.get_table()

        order = cls.get_order(order_id)

        if not order:
            raise ValueError("Order not found.")

        VALID_TRANSITIONS = {
            "PENDING": ["CONFIRMED", "CANCELLED"],
            "CONFIRMED": ["PROCESSING", "CANCELLED"],
            "PROCESSING": ["SHIPPED"],
            "SHIPPED": ["DELIVERED"],
            "DELIVERED": [],
            "CANCELLED": [],
        }

        current_status = order["status"]

        if status not in VALID_TRANSITIONS[current_status]:
            raise ValueError(
                f"Cannot change status from {current_status} to {status}"
            )

        now = cls._timestamp()

        table.update_item(
            Key={"order_id": order_id},
            UpdateExpression="SET #status=:status, updated_at=:updated",
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": status,
                ":updated": now,
            },
        )

        order["status"] = status
        order["updated_at"] = now

        return order

    @classmethod
    def delete_order(cls, order_id):
        table = cls.get_table()
        order = cls.get_order(order_id)
        if not order:
            raise ValueError("Order not found.")
        table.delete_item(Key={"order_id": order_id})
        return True

    @staticmethod
    def health():
        return {"status": "UP", "service": "order"}
