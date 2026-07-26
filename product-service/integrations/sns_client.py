import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

class SNSClient:

    def __init__(self):
        self.client = boto3.client(
            "sns",
            region_name=os.getenv("AWS_REGION", "ap-southeast-1")
        )
        self.topic_arn = os.getenv("PRODUCT_EVENTS_TOPIC_ARN")

    def publish(self, event_type, data):
        """
        Publish an event to SNS.
        """

        if not self.topic_arn:
            raise ValueError(
                "PRODUCT_EVENTS_TOPIC_ARN is not configured."
            )

        message = {
            "event": event_type,
            "data": data
        }

        response = self.client.publish(
            TopicArn=self.topic_arn,
            Subject=event_type,
            Message=json.dumps(message)
        )

        return response