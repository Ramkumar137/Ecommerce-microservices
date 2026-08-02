import os
from typing import Any, Dict

import boto3


class EmailService:
    def __init__(self) -> None:
        self.client = boto3.client("ses", region_name=os.getenv("AWS_REGION", "ap-southeast-1"))

    def send_email(self, to_address: str, subject: str, message: str, body: str) -> Dict[str, Any]:
        sender = os.getenv("EMAIL_FROM")
        if not sender:
            raise ValueError("EMAIL_FROM environment variable is not set")

        response = self.client.send_email(
            Source=sender,
            Destination={"ToAddresses": [to_address]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": message, "Charset": "UTF-8"},
                    "Html": {"Data": f"<p>{body}</p>", "Charset": "UTF-8"},
                },
            },
        )
        return response
