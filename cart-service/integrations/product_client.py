import os
import requests
from dotenv import load_dotenv
load_dotenv()

class ProductClient:

    BASE_URL = os.getenv("PRODUCT_SERVICE_URL")

    @classmethod
    def get_product(cls, product_id, token=None):

        headers = {}

        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = requests.get(
            f"{cls.BASE_URL}/{product_id}/",
            headers=headers,
            timeout=5,
        )

        if response.status_code == 404:
            return None

        response.raise_for_status()

        return response.json()