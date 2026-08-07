# shared-testing/dynamodb_fixtures.py

from .aws_mocks import MockDynamoDBTable, MockBoto3Resource


def create_mock_table_with_items(table_name, items):
    table = MockDynamoDBTable(table_name)
    for item in items:
        table.put_item(Item=item)
    return table
