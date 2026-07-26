import json

from inventory.services import InventoryService


def handle(event):

    for record in event["Records"]:

        body = json.loads(record["Sns"]["Message"])

        if body["event"] != "PAYMENT_FAILED":
            continue

        payment = body["data"]

        # We'll implement this next