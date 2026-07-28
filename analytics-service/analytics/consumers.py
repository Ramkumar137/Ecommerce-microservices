import logging
import time

from integrations.sqs_client import SQSClient
from .constants import EventType
from .event_handlers import (
    handle_product_created,
    handle_product_updated,
    handle_order_created,
    handle_order_status_updated,
    handle_payment_success,
    handle_payment_failed,
)

logger = logging.getLogger(__name__)

EVENT_HANDLER_MAP = {
    EventType.PRODUCT_CREATED: handle_product_created,
    EventType.PRODUCT_UPDATED: handle_product_updated,
    EventType.ORDER_CREATED: handle_order_created,
    EventType.ORDER_STATUS_UPDATED: handle_order_status_updated,
    EventType.PAYMENT_SUCCESS: handle_payment_success,
    EventType.PAYMENT_FAILED: handle_payment_failed,
}

# Module-level client — reused across warm Lambda invocations.
_sqs = SQSClient()


class AnalyticsConsumer:

    def __init__(self):
        self.sqs = _sqs

    def process_message(self, sqs_message):
        """
        Deserialize one SQS/SNS message, detect event_type,
        dispatch to the correct handler.
        Returns True on success, False on any failure.
        Unknown event types return False so the message is not deleted
        and will be routed to the DLQ after max receive count is exceeded.
        """
        message_id = sqs_message.get("MessageId", "unknown")

        try:
            event = self.sqs.parse_sns_message(sqs_message)

            event_type = event.get("event")
            data = event.get("data", {})

            logger.info(
                f"Event received: event_type={event_type} "
                f"message_id={message_id}"
            )

            handler = EVENT_HANDLER_MAP.get(event_type)

            if not handler:
                logger.error(
                    f"Unknown event type: {event_type} "
                    f"message_id={message_id} — leaving in queue for DLQ"
                )
                return False

            start = time.monotonic()

            handler(data)

            duration_ms = round((time.monotonic() - start) * 1000, 2)

            logger.info(
                f"Event processed: event_type={event_type} "
                f"message_id={message_id} duration_ms={duration_ms}"
            )

            return True

        except Exception as e:
            logger.exception(
                f"Failed to process message: message_id={message_id} "
                f"error={str(e)}"
            )
            return False

    def process_batch(self, messages):
        """
        Process a batch of SQS messages.
        Each message is deleted individually only after successful processing.
        Failed messages are left in the queue for SQS retry / DLQ routing.
        Processing continues for all remaining messages if one fails.
        """
        processed = 0
        failed = 0

        for message in messages:
            success = self.process_message(message)

            if success:
                try:
                    self.sqs.delete_message(message["ReceiptHandle"])
                    processed += 1
                except Exception as e:
                    logger.exception(
                        f"Failed to delete message "
                        f"message_id={message.get('MessageId')} "
                        f"error={str(e)}"
                    )
                    failed += 1
            else:
                failed += 1

        logger.info(
            f"Batch complete: processed={processed} failed={failed} "
            f"total={len(messages)}"
        )

        return {"processed": processed, "failed": failed}

    def poll(self, max_messages=10, wait_seconds=20):
        """
        Single poll cycle: receive a batch from SQS and process it.
        Used for local/container execution. Lambda uses process_batch directly.
        """
        messages = self.sqs.receive_messages(
            max_messages=max_messages,
            wait_seconds=wait_seconds,
        )

        if not messages:
            logger.info("No messages received.")
            return {"processed": 0, "failed": 0}

        logger.info(f"Received {len(messages)} message(s) from SQS.")

        return self.process_batch(messages)

    def run(self, max_messages=10, wait_seconds=20):
        """
        Continuous polling loop for local/container execution.
        Not used in Lambda — Lambda invokes process_batch directly via
        analytics_consumer_lambda.lambda_handler.
        """
        logger.info("AnalyticsConsumer started.")

        while True:
            try:
                self.poll(
                    max_messages=max_messages,
                    wait_seconds=wait_seconds,
                )
            except KeyboardInterrupt:
                logger.info("AnalyticsConsumer stopped.")
                break
            except Exception as e:
                logger.exception(
                    f"Unexpected error in polling loop: {str(e)}"
                )
                time.sleep(5)
