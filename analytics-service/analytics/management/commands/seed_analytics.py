from django.core.management.base import BaseCommand
from analytics.services import AnalyticsService


class Command(BaseCommand):
    help = "Seeds sample analytics data into DynamoDB for testing and demonstration."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding sample analytics data into DynamoDB..."))
        try:
            AnalyticsService.seed_sample_data()
            self.stdout.write(self.style.SUCCESS("Successfully seeded sample analytics metrics!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to seed analytics data: {e}"))
