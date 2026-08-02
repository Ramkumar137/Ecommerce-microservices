import os

import boto3


class SESClient:
    @staticmethod
    def get_client():
        return boto3.client(
            "ses",
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
        )
