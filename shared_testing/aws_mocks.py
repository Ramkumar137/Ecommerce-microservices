# shared_testing/aws_mocks.py

from unittest.mock import MagicMock


class MockDynamoDBTable:
    def __init__(self, name="mock-table", items=None):
        self.name = name
        self.items = items if items is not None else {}

    def get_item(self, Key=None, **kwargs):
        key_val = next(iter(Key.values())) if Key else None
        item = self.items.get(key_val)
        if item:
            return {"Item": item}
        return {}

    def put_item(self, Item=None, **kwargs):
        if Item:
            key = Item.get("user_id") or Item.get("product_id") or Item.get("cart_id") or Item.get("order_id") or Item.get("payment_id") or Item.get("notification_id") or Item.get("metric_id") or "id"
            self.items[key] = Item
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def update_item(self, Key=None, **kwargs):
        return {"ResponseMetadata": {"HTTPStatusCode": 200}, "Attributes": {}}

    def delete_item(self, Key=None, **kwargs):
        key_val = next(iter(Key.values())) if Key else None
        if key_val in self.items:
            del self.items[key_val]
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def query(self, **kwargs):
        return {"Items": list(self.items.values()), "Count": len(self.items)}

    def scan(self, **kwargs):
        return {"Items": list(self.items.values()), "Count": len(self.items)}

    def batch_writer(self):
        batch = MagicMock()
        batch.__enter__.return_value = batch
        batch.__exit__.return_value = None
        return batch


class MockBoto3Resource:
    def __init__(self):
        self.tables = {}

    def Table(self, name):
        if name not in self.tables:
            self.tables[name] = MockDynamoDBTable(name)
        return self.tables[name]


def get_mock_sns_client():
    client = MagicMock()
    client.publish.return_value = {"MessageId": "mock-message-id-12345"}
    return client


def get_mock_sqs_client():
    client = MagicMock()
    client.send_message.return_value = {"MessageId": "mock-sqs-message-id-12345"}
    return client


def get_mock_ses_client():
    client = MagicMock()
    client.send_email.return_value = {"MessageId": "mock-ses-message-id-12345"}
    return client


def get_mock_s3_client():
    client = MagicMock()
    client.upload_fileobj.return_value = None
    return client
