import json
import os

import boto3


class SNSClient:

    def __init__(self):
        self.client = boto3.client(
            "sns",
            region_name=os.getenv("AWS_REGION")
        )

        self.topic_arn = os.getenv(
            "PAYMENT_SNS_TOPIC_ARN"
        )

    def publish_payment_success(self, payment):

        message = {
            "event": "PAYMENT_SUCCESS",
            "data": payment
        }

        self.client.publish(
            TopicArn=self.topic_arn,
            Subject="PAYMENT_SUCCESS",
            Message=json.dumps(message)
        )

    def publish_payment_failed(self, payment):

        message = {
            "event": "PAYMENT_FAILED",
            "data": payment
        }

        self.client.publish(
            TopicArn=self.topic_arn,
            Subject="PAYMENT_FAILED",
            Message=json.dumps(message)
        )