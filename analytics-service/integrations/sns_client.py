import os
import json
import boto3


class SNSClient:

    def __init__(self):
        self.client = boto3.client(
            "sns",
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
        )
        self.topic_arn = os.getenv("SNS_TOPIC_ARN")

    def publish(self, event_type, data):

        if not self.topic_arn:
            raise ValueError("SNS_TOPIC_ARN is not configured.")

        message = {
            "event": event_type,
            "data": data,
        }

        response = self.client.publish(
            TopicArn=self.topic_arn,
            Subject=event_type,
            Message=json.dumps(message),
        )

        return response
