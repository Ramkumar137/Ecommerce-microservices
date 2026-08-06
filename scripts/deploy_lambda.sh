#!/usr/bin/env bash
set -euo pipefail

service_name="${1:?Usage: $0 <service-name> <zip-file> [function-name]}"
zip_file="${2:?Usage: $0 <service-name> <zip-file> [function-name]}"
function_name="${3:-}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config_file="${repo_root}/config/lambda-map.json"

if [ ! -f "$zip_file" ]; then
  echo "ZIP file not found: $zip_file" >&2
  exit 1
fi

if [ -z "$function_name" ]; then
  if [ ! -f "$config_file" ]; then
    echo "Lambda mapping configuration is missing: $config_file" >&2
    exit 1
  fi
  function_name="$(python - "$config_file" "$service_name" <<'PY'
import json
import sys
from pathlib import Path
config_path = Path(sys.argv[1])
service_name = sys.argv[2]
with config_path.open(encoding='utf-8') as fh:
    config = json.load(fh)
print(config.get(service_name, ''))
PY
)"
fi

if [ -z "$function_name" ] || [[ "$function_name" == YOUR_* ]]; then
  echo "No valid AWS Lambda function mapping found for service '$service_name'." >&2
  exit 1
fi

echo "Deploying $service_name to Lambda function $function_name"

attempt=1
while [ "$attempt" -le 3 ]; do
  echo "Update attempt $attempt/3"
  if aws lambda update-function-code \
    --function-name "$function_name" \
    --zip-file "fileb://$zip_file" > /tmp/lambda-update.json 2> /tmp/lambda-update.err; then
    break
  fi

  if [ "$attempt" -eq 3 ]; then
    echo "Lambda deployment failed after 3 attempts." >&2
    cat /tmp/lambda-update.err >&2
    exit 1
  fi

  echo "Retrying in 10 seconds..."
  sleep 10
  attempt=$((attempt + 1))
done

echo "Waiting for Lambda update to complete..."
aws lambda wait function-updated --function-name "$function_name" --cli-read-timeout 600 --cli-connect-timeout 60

"$repo_root/scripts/verify_deployment.sh" lambda "$function_name"

echo "Lambda deployment completed successfully."
