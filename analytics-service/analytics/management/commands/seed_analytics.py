from django.core.management.base import BaseCommand
from analytics.services import AnalyticsService


class Command(BaseCommand):
    help = "Deprecated: Sample data seeding is disabled in REAL-DATA-ONLY mode."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                "Sample data seeding is disabled in REAL-DATA-ONLY mode.\n"
                "Use 'python manage.py reset_analytics' to reset metrics to clean zero-state for real event processing."
            )
        )
