# utils/dynamodb.py

import os
import logging
import boto3
from botocore.exceptions import ProfileNotFound
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_dynamodb_resource = None


def get_dynamodb_resource():
    global _dynamodb_resource
    if _dynamodb_resource is not None:
        return _dynamodb_resource

    region = os.getenv("AWS_REGION", "ap-southeast-1")
    profile = os.getenv("AWS_PROFILE")
    is_lambda = bool(
        os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("AWS_EXECUTION_ENV")
    )

    # 1. AWS Lambda Environment (uses IAM role credentials automatically)
    if is_lambda:
        logger.info(f"[DynamoDB] Initializing inside Lambda environment (region: {region}).")
        _dynamodb_resource = boto3.resource("dynamodb", region_name=region)
        return _dynamodb_resource

    # 2. Local Environment with AWS_PROFILE specified
    if profile:
        try:
            session = boto3.Session(profile_name=profile)
            if session.get_credentials() is not None:
                _dynamodb_resource = session.resource("dynamodb", region_name=region)
                logger.info(f"[DynamoDB] Initialized using profile '{profile}' (region: {region}).")
                return _dynamodb_resource
        except (ProfileNotFound, Exception) as e:
            logger.warning(
                f"[DynamoDB] AWS_PROFILE '{profile}' not found or invalid: {e}. "
                "Clearing profile and attempting standard credential resolution."
            )
            os.environ.pop("AWS_PROFILE", None)

    # 3. Standard Local Credential Chain Check
    try:
        session = boto3.Session()
        creds = session.get_credentials()
        if creds is not None:
            _dynamodb_resource = session.resource("dynamodb", region_name=region)
            logger.info(f"[DynamoDB] Initialized using environment/shared credentials (region: {region}).")
            return _dynamodb_resource
    except Exception as e:
        logger.warning(f"[DynamoDB] Standard credential resolution check failed: {e}")

    # 4. Fallback for systems without AWS credentials (e.g. offline dev / local tests)
    logger.info("[DynamoDB] No AWS credentials located. Using dummy credentials fallback for local execution.")
    endpoint_url = os.getenv("DYNAMODB_ENDPOINT_URL")
    kwargs = {
        "region_name": region,
        "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID", "dummy_key"),
        "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY", "dummy_secret"),
    }
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url

    _dynamodb_resource = boto3.resource("dynamodb", **kwargs)
    return _dynamodb_resource


def get_table(table_name):
    return get_dynamodb_resource().Table(table_name)
