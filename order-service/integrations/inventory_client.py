import os
import requests
from dotenv import load_dotenv
load_dotenv()

class InventoryClient:

    BASE_URL = os.getenv("INVENTORY_SERVICE_URL")

    @classmethod
    def get_inventory(cls, product_id):

        response = requests.get(
            f"{cls.BASE_URL}/{product_id}/"
        )

        if response.status_code == 200:
            return response.json()

        return None

    # @classmethod
    # def reserve_stock(cls, product_id, quantity):

    #     response = requests.patch(
    #         f"{cls.BASE_URL}/{product_id}/reserve/",
    #         json={
    #             "quantity": quantity
    #         }
    #     )

    #     if response.status_code == 200:
    #         return response.json()

    #     raise ValueError(response.json().get("error", "Unable to reserve stock"))
    
    @classmethod
    def reserve_stock(cls, product_id, quantity, token):

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.patch(
            f"{cls.BASE_URL}/{product_id}/reserve/",
            json={
                "quantity": quantity
            },
            headers=headers
        )

        if response.status_code == 200:
            return response.json()

        raise ValueError(response.json().get("error", "Unable to reserve stock"))
        
    @classmethod
    def release_stock(cls, product_id, quantity, token):

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.patch(
            f"{cls.BASE_URL}/{product_id}/release/",
            json={
                "quantity": quantity
            },
            headers=headers
        )

        if response.status_code == 200:
            return response.json()

        raise ValueError(response.json().get("error", "Unable to release stock"))