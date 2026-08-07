# utils/dynamodb.py

import os
import logging
import boto3
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_dynamodb_resource = None


def get_dynamodb_resource():
    global _dynamodb_resource
    if _dynamodb_resource is not None:
        return _dynamodb_resource

    region = os.getenv("AWS_REGION", "us-east-1")
    profile = os.getenv("AWS_PROFILE")

    if profile:
        session = boto3.Session(profile_name=profile)
        _dynamodb_resource = session.resource("dynamodb", region_name=region)
    else:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=region)

    return _dynamodb_resource


def get_table(table_name=None):
    if not table_name:
        table_name = os.getenv("ANALYTICS_TABLE", "analytics-table")
    return get_dynamodb_resource().Table(table_name)


class _DynamoDBProxy:
    def Table(self, table_name):
        return get_table(table_name)


dynamodb = _DynamoDBProxy()
