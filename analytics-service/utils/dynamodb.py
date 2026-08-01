import os
import boto3
from dotenv import load_dotenv

load_dotenv()

region = os.getenv("AWS_REGION", "ap-southeast-1")
profile = os.getenv("AWS_PROFILE")

_dynamodb_resource = None

def get_dynamodb_resource():
    global _dynamodb_resource
    if _dynamodb_resource is not None:
        return _dynamodb_resource

    # Check if running inside AWS Lambda
    is_lambda = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("AWS_EXECUTION_ENV"))

    if not is_lambda and profile:
        try:
            session = boto3.Session(profile_name=profile)
            _dynamodb_resource = session.resource("dynamodb", region_name=region)
            return _dynamodb_resource
        except Exception:
            # If specified profile is not found on local machine, remove AWS_PROFILE env var
            os.environ.pop("AWS_PROFILE", None)

    try:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=region)
        return _dynamodb_resource
    except Exception:
        _dynamodb_resource = boto3.resource(
            "dynamodb",
            region_name=region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "dummy_key"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "dummy_secret"),
        )
        return _dynamodb_resource


def get_table(table_name):
    return get_dynamodb_resource().Table(table_name)

