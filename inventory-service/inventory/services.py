import os
from datetime import datetime, timezone

from utils.dynamodb import get_table

class InventoryService:

    @staticmethod
    def get_table():
        table_name = os.getenv("INVENTORY_TABLE")
        if not table_name:
            raise ValueError("INVENTORY_TABLE environment variable not set")
        return get_table(table_name)

    @staticmethod
    def list_inventory():
        """List all inventory items with pagination support."""
        table = InventoryService.get_table()
        items = []
        last_evaluated_key = None
        
        while True:
            scan_kwargs = {}
            if last_evaluated_key:
                scan_kwargs["ExclusiveStartKey"] = last_evaluated_key
            
            response = table.scan(**scan_kwargs)
            items.extend(response.get("Items", []))
            
            last_evaluated_key = response.get("LastEvaluatedKey")
            if not last_evaluated_key:
                break
        
        return items

    @staticmethod
    def get_inventory(product_id):
        """Get inventory for a specific product."""
        table = InventoryService.get_table()
        response = table.get_item(Key={"product_id": product_id})
        return response.get("Item")

    @staticmethod
    def create_inventory(data):
        """Create new inventory for a product."""
        existing = InventoryService.get_inventory(data["product_id"])
        if existing:
            raise ValueError("Inventory already exists.")

        table = InventoryService.get_table()
        now = datetime.now(timezone.utc).isoformat()

        item = {
            "product_id": data["product_id"],
            "stock": data["stock"],
            "reserved_stock": data.get("reserved_stock", 0),
            "available_stock": data["stock"] - data.get("reserved_stock", 0),
            "created_at": now,
            "updated_at": now,
        }

        table.put_item(Item=item)
        return item

    @staticmethod
    def update_inventory(product_id, data):
        """Update inventory stock and reserved stock."""
        table = InventoryService.get_table()
        existing = InventoryService.get_inventory(product_id)

        if not existing:
            return None

        stock = data["stock"]
        reserved = data.get(
            "reserved_stock",
            existing["reserved_stock"]
        )

        if reserved > stock:
            raise ValueError(
                "Reserved stock cannot exceed total stock."
            )

        item = {
            "product_id": product_id,
            "stock": stock,
            "reserved_stock": reserved,
            "available_stock": stock - reserved,
            "created_at": existing["created_at"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        table.put_item(Item=item)
        return item

    @staticmethod
    def delete_inventory(product_id):
        table = InventoryService.get_table()
        existing = InventoryService.get_inventory(product_id)
        if not existing:
            return False
        table.delete_item(Key={"product_id": product_id})
        return True

    @staticmethod
    def reserve_stock(product_id, quantity):
        """Reserve stock for a product."""
        item = InventoryService.get_inventory(product_id)

        if not item:
            return None

        if quantity > item["available_stock"]:
            raise ValueError("Insufficient stock.")

        item["reserved_stock"] += quantity
        item["available_stock"] -= quantity
        item["updated_at"] = datetime.now(timezone.utc).isoformat()

        InventoryService.get_table().put_item(Item=item)
        return item

    @staticmethod
    def release_stock(product_id, quantity):
        """Release reserved stock for a product."""
        item = InventoryService.get_inventory(product_id)

        if not item:
            return None

        if quantity > item["reserved_stock"]:
            raise ValueError("Invalid release quantity.")

        item["reserved_stock"] -= quantity
        item["available_stock"] += quantity
        item["updated_at"] = datetime.now(timezone.utc).isoformat()

        InventoryService.get_table().put_item(Item=item)
        return item