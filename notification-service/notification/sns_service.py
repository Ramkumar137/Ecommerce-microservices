import json
import logging
import os

import boto3

logger = logging.getLogger(__name__)


class SNSService:
    @staticmethod
    def get_client():
        return boto3.client("sns", region_name=os.getenv("AWS_REGION", "ap-southeast-1"))

    @staticmethod
    def build_payload(notification_type, user_id, email, channels, data=None):
        return {
            "type": (notification_type or "").upper(),
            "userId": user_id,
            "email": email,
            "channels": channels or [],
            "data": data or {},
        }

    @staticmethod
    def publish(payload, topic_arn=None):
        topic_arn = topic_arn or os.getenv("SNS_TOPIC_ARN")
        if not topic_arn:
            raise ValueError("SNS_TOPIC_ARN environment variable is not set")

        message = payload if isinstance(payload, str) else json.dumps(payload)
        logger.info("Publishing notification to SNS")
        return SNSService.get_client().publish(
            TopicArn=topic_arn,
            Message=message,
            Subject="Notification Event",
        )
