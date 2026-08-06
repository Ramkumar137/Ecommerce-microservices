#!/usr/bin/env bash
set -euo pipefail

dist_dir="${1:?Usage: $0 <dist-directory> <bucket-name> <distribution-id>}"
bucket_name="${2:?Usage: $0 <dist-directory> <bucket-name> <distribution-id>}"
distribution_id="${3:?Usage: $0 <dist-directory> <bucket-name> <distribution-id>}"

if [ ! -d "$dist_dir" ]; then
  echo "Distribution directory not found: $dist_dir" >&2
  exit 1
fi

if [ -z "$bucket_name" ]; then
  echo "S3 bucket name is required" >&2
  exit 1
fi

if [ -z "$distribution_id" ]; then
  echo "CloudFront distribution ID is required" >&2
  exit 1
fi

echo "Syncing static assets from $dist_dir to s3://$bucket_name"
for attempt in 1 2 3; do
  if aws s3 sync "$dist_dir" "s3://$bucket_name" --delete --no-progress; then
    break
  fi

  if [ "$attempt" -eq 3 ]; then
    echo "Frontend deployment to S3 failed after 3 attempts." >&2
    exit 1
  fi

  echo "Retrying S3 sync in 10 seconds..."
  sleep 10
done

echo "Creating CloudFront invalidation for distribution $distribution_id"
for attempt in 1 2 3; do
  if aws cloudfront create-invalidation --distribution-id "$distribution_id" --paths '/*' > /tmp/cloudfront-invalidation.json 2> /tmp/cloudfront-invalidation.err; then
    break
  fi

  if [ "$attempt" -eq 3 ]; then
    echo "CloudFront invalidation failed after 3 attempts." >&2
    cat /tmp/cloudfront-invalidation.err >&2
    exit 1
  fi

  echo "Retrying invalidation in 10 seconds..."
  sleep 10
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$repo_root/scripts/verify_deployment.sh" frontend "$bucket_name" "$distribution_id"

echo "Frontend deployment completed successfully."
