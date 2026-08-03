import logging
from datetime import datetime

from django.conf import settings
from django.template.loader import render_to_string

from .ses_client import SESClient

logger = logging.getLogger(__name__)


class EmailService:

    @staticmethod
    def send_notification_email(to_email, subject, message):
        return EmailService.send_template_email(
            to_email=to_email,
            subject=subject,
            template_name="email_notification.html",
            context={
                "subject": subject,
                "message": message,
            },
        )

    @staticmethod
    def send_template_email(to_email, subject, template_name, context):
        context["year"] = datetime.now().year

        html = render_to_string(template_name, context)

        client = SESClient.get_client()

        logger.info(
            "[EmailService] Sending email to=%s subject=%s template=%s",
            to_email,
            subject,
            template_name,
        )

        try:
            response = client.send_email(
                Source=settings.SES_FROM_EMAIL,
                Destination={"ToAddresses": [to_email]},
                Message={
                    "Subject": {"Charset": "UTF-8", "Data": subject},
                    "Body": {"Html": {"Charset": "UTF-8", "Data": html}},
                },
            )
            logger.info(
                "[EmailService] Email sent successfully to=%s MessageId=%s",
                to_email,
                response.get("MessageId"),
            )
            return response
        except Exception as exc:
            logger.exception(
                "[EmailService] SES send_email failed to=%s subject=%s error=%s",
                to_email,
                subject,
                exc,
            )
            raise