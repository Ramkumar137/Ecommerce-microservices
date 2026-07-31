import os
import boto3


class SESClient:

    _client = None

    @classmethod
    def get_client(cls):

        if cls._client is None:

            cls._client = boto3.client(
                "ses",
                region_name=os.getenv("AWS_REGION")
            )

        return cls._client