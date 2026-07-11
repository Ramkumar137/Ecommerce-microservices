import os
import requests
from dotenv import load_dotenv

load_dotenv()

class OrderClient:

    BASE_URL = os.getenv("ORDER_SERVICE_URL")

    @classmethod
    def get_order(cls, order_id, token=None):

        headers = {}

        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.get(
            f"{cls.BASE_URL}/{order_id}/",
            headers=headers,
            timeout=5,
        )

        if response.status_code == 404:
            return None

        response.raise_for_status()

        return response.json()