#!/usr/bin/env bash
set -euo pipefail

resource_type="${1:-}"
resource_name="${2:-}"
resource_name_two="${3:-}"

if [ -z "$resource_type" ]; then
  echo "Usage: $0 <lambda|frontend> [function-name|bucket-name] [distribution-id]" >&2
  exit 1
fi

case "$resource_type" in
  lambda)
    function_name="$resource_name"
    if [ -z "$function_name" ]; then
      echo "Lambda function name is required" >&2
      exit 1
    fi

    echo "Verifying Lambda deployment for $function_name"
    function_details="$(aws lambda get-function --function-name "$function_name" --output json)"
    last_modified="$(python - <<'PY' "$function_details"
import json
import sys
payload = json.loads(sys.argv[1])
print(payload['Configuration']['LastModified'])
PY
)"
    echo "Lambda last modified: $last_modified"
    ;;
  frontend)
    bucket_name="$resource_name"
    distribution_id="$resource_name_two"

    if [ -z "$bucket_name" ] || [ -z "$distribution_id" ]; then
      echo "S3 bucket name and CloudFront distribution ID are required" >&2
      exit 1
    fi

    echo "Verifying frontend deployment for bucket $bucket_name"
    aws s3 ls "s3://$bucket_name" > /dev/null
    invalidation_id="$(aws cloudfront get-invalidation --distribution-id "$distribution_id" --id "$(aws cloudfront list-invalidations --distribution-id "$distribution_id" --query 'InvalidationList.Items[0].Id' --output text)" --query 'Invalidation.Id' --output text 2>/dev/null || true)"
    if [ -n "$invalidation_id" ]; then
      echo "CloudFront invalidation created: $invalidation_id"
    else
      echo "CloudFront invalidation status could not be confirmed; please review the distribution manually."
    fi
    ;;
  *)
    echo "Unsupported resource type: $resource_type" >&2
    exit 1
    ;;
esac

echo "Deployment verification completed."
