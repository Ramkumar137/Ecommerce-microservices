import os
import boto3
from dotenv import load_dotenv

load_dotenv()

region = os.getenv("AWS_REGION", "ap-southeast-1")
profile = os.getenv("AWS_PROFILE")

if profile:
    session = boto3.Session(profile_name=profile)
    dynamodb = session.resource("dynamodb", region_name=region)
else:
    dynamodb = boto3.resource("dynamodb", region_name=region)


def get_table(table_name):
    return dynamodb.Table(table_name)
