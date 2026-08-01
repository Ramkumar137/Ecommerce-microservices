from django.core.management.base import BaseCommand
from analytics.services import AnalyticsService


class Command(BaseCommand):
    help = "Resets analytics DynamoDB table to clean zero-state for REAL-DATA-ONLY operation."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Resetting Analytics DynamoDB table..."))
        try:
            table = AnalyticsService.get_table()

            # 1. Scan and delete all items
            scan = table.scan()
            items = scan.get("Items", [])
            deleted_count = 0
            with table.batch_writer() as batch:
                for item in items:
                    batch.delete_item(
                        Key={
                            "metric_type": item["metric_type"],
                            "metric_id": item["metric_id"],
                        }
                    )
                    deleted_count += 1

            self.stdout.write(
                self.style.NOTICE(f"Deleted {deleted_count} record(s) from table.")
            )

            # 2. Reinitialize summary records with zero values
            AnalyticsService.initialize_dashboard_metrics()

            self.stdout.write(
                self.style.SUCCESS(
                    "Analytics table successfully reset to clean zero-state! "
                    "Ready for real incoming event processing."
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Failed to reset analytics table: {str(e)}")
            )
