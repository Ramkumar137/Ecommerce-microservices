import os
import json
import logging
import boto3

logger = logging.getLogger(__name__)


class SQSClient:

    def __init__(self):
        self.client = boto3.client(
            "sqs",
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
        )
        self.queue_url = os.getenv("SQS_QUEUE_URL")

    def receive_messages(self, max_messages=10, wait_seconds=20):
        """
        Long-poll the SQS queue and return a batch of raw messages.
        max_messages: 1–10 (SQS hard limit per receive call).
        wait_seconds: 0–20 seconds of long polling.
        """
        if not self.queue_url:
            raise ValueError("SQS_QUEUE_URL is not configured.")

        response = self.client.receive_message(
            QueueUrl=self.queue_url,
            MaxNumberOfMessages=max_messages,
            WaitTimeSeconds=wait_seconds,
            AttributeNames=["All"],
            MessageAttributeNames=["All"],
        )

        return response.get("Messages", [])

    def delete_message(self, receipt_handle):
        """
        Delete a single message from the queue after successful processing.
        """
        if not self.queue_url:
            raise ValueError("SQS_QUEUE_URL is not configured.")

        self.client.delete_message(
            QueueUrl=self.queue_url,
            ReceiptHandle=receipt_handle,
        )

    def delete_messages_batch(self, messages):
        """
        Delete a batch of messages in a single API call.
        messages: list of raw SQS message dicts (must contain MessageId and ReceiptHandle).
        """
        if not self.queue_url:
            raise ValueError("SQS_QUEUE_URL is not configured.")

        if not messages:
            return

        entries = [
            {
                "Id": msg["MessageId"],
                "ReceiptHandle": msg["ReceiptHandle"],
            }
            for msg in messages
        ]

        response = self.client.delete_message_batch(
            QueueUrl=self.queue_url,
            Entries=entries,
        )

        failed = response.get("Failed", [])
        if failed:
            logger.warning(f"Batch delete partially failed: {failed}")

        return response

    def parse_sns_message(self, sqs_message):
        """
        Unwrap the SNS envelope from an SQS message body.
        SNS → SQS wraps the SNS notification as a JSON string in the Body field.
        Returns the inner analytics event dict: {"event": ..., "data": ...}
        """
        body = json.loads(sqs_message["Body"])

        # SNS wraps the message payload in a "Message" field as a JSON string
        message = json.loads(body["Message"])

        return message
