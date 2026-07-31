from django.conf import settings
from django.template.loader import render_to_string
from datetime import datetime

from .ses_client import SESClient


class EmailService:

    @staticmethod
    def send_template_email(
        to_email,
        subject,
        template_name,
        context,
    ):

        context["year"] = datetime.now().year

        html = render_to_string(
            template_name,
            context
        )

        client = SESClient.get_client()

        return client.send_email(
            Source=settings.SES_FROM_EMAIL,
            Destination={
                "ToAddresses": [to_email]
            },
            Message={
                "Subject": {
                    "Charset": "UTF-8",
                    "Data": subject
                },
                "Body": {
                    "Html": {
                        "Charset": "UTF-8",
                        "Data": html
                    }
                }
            }
        )