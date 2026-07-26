import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

class SNSClient:

    def __init__(self):
        self.client = boto3.client(
            "sns",
            region_name=os.getenv("AWS_REGION")
        )

        self.topic_arn = os.getenv(
            "ORDER_SNS_TOPIC_ARN"
        )

    def publish(self, event_type, data):

        message = {
            "event": event_type,
            "data": data
        }

        self.client.publish(
            TopicArn=self.topic_arn,
            Subject=event_type,
            Message=json.dumps(message)
        )