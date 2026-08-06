#!/usr/bin/env bash
set -euo pipefail

service_dir="${1:?Usage: $0 <service-directory>}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "${service_dir}" != /* ]]; then
  service_dir="${repo_root}/${service_dir}"
fi

service_name="$(basename "${service_dir}")"
output_path="${repo_root}/${service_name}.zip"

if [ ! -d "${service_dir}" ]; then
  echo "Service directory not found: ${service_dir}" >&2
  exit 1
fi

cd "${service_dir}"
rm -f "${output_path}"
zip -r "${output_path}" . -x "*/__pycache__/*" "*.pyc" ".venv/*" ".pytest_cache/*" "*.sqlite3" >/dev/null

echo "Created ${output_path}"

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "artifact_path=${output_path}" >> "${GITHUB_OUTPUT}"
fi
