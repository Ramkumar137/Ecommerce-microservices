import os
import boto3
from dotenv import load_dotenv

load_dotenv()

region = os.getenv("AWS_REGION", "ap-southeast-1")
profile = os.getenv("AWS_PROFILE")

try:
    if profile:
        session = boto3.Session(profile_name=profile)
        dynamodb = session.resource("dynamodb", region_name=region)
    else:
        dynamodb = boto3.resource("dynamodb", region_name=region)
except Exception:
    # Handle ProfileNotFound or unconfigured AWS credentials in dev/test environment
    old_profile = os.environ.pop("AWS_PROFILE", None)
    try:
        dynamodb = boto3.resource(
            "dynamodb",
            region_name=region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "dummy_key"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "dummy_secret"),
        )
    finally:
        if old_profile:
            os.environ["AWS_PROFILE"] = old_profile


def get_table(table_name):
    return dynamodb.Table(table_name)
