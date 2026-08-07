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

rm -f "${output_path}"

build_dir="$(mktemp -d 2>/dev/null || mktemp -d -t 'lambda_build')"
trap 'rm -rf "${build_dir}"' EXIT

echo "Packaging ${service_name} using staging directory ${build_dir}..."

# Install production dependencies directly into staging build directory
if [ -f "${service_dir}/requirements.txt" ]; then
  echo "Installing production dependencies from ${service_dir}/requirements.txt..."
  python -m pip install --no-cache-dir -r "${service_dir}/requirements.txt" -t "${build_dir}" --quiet
fi

# Copy service contents (not parent folder) into staging build directory
echo "Copying service contents into staging directory..."
cp -R "${service_dir}/." "${build_dir}/"

# Clean up excluded directories and development files inside build_dir before zipping
python - <<'PY' "$build_dir"
import os
import sys
import shutil
import re
from pathlib import Path

raw_dir = sys.argv[1]
if os.name == 'nt' and re.match(r'^/([a-zA-Z])/(.*)', raw_dir):
    raw_dir = re.sub(r'^/([a-zA-Z])/(.*)', r'\1:/\2', raw_dir)

build_dir = Path(raw_dir).resolve()
targets_to_remove = [
    ".git",
    "package",
    ".pytest_cache",
    "__pycache__",
    ".venv",
    "venv",
    "node_modules",
    "tests",
    "htmlcov",
    ".coverage",
]

for name in targets_to_remove:
    for target in build_dir.rglob(name):
        if target.is_dir():
            shutil.rmtree(target, ignore_errors=True)
        elif target.is_file():
            target.unlink(missing_ok=True)

for pattern in ["test_*.py", "*_test.py", "*.pyc", "*.pyo", "*.sqlite3", "*.zip", ".env", ".env.*"]:
    for file_path in build_dir.rglob(pattern):
        if file_path.is_file():
            file_path.unlink(missing_ok=True)
PY

echo "Creating Lambda deployment ZIP archive ${output_path}..."
python - <<'PY' "$build_dir" "$output_path"
import os
import sys
import zipfile
import re
from pathlib import Path

raw_build = sys.argv[1]
raw_out = sys.argv[2]

if os.name == 'nt' and re.match(r'^/([a-zA-Z])/(.*)', raw_build):
    raw_build = re.sub(r'^/([a-zA-Z])/(.*)', r'\1:/\2', raw_build)

if os.name == 'nt' and re.match(r'^/([a-zA-Z])/(.*)', raw_out):
    raw_out = re.sub(r'^/([a-zA-Z])/(.*)', r'\1:/\2', raw_out)

build_dir = Path(raw_build).resolve()
output_path = Path(raw_out).resolve()

with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            full_path = Path(root) / file
            rel_path = full_path.relative_to(build_dir)
            zipf.write(full_path, arcname=str(rel_path))
PY

echo "Created ${output_path}"

# Validate the generated ZIP archive structure
echo "Validating ZIP root structure for ${output_path}..."
python - <<'PY' "$output_path" "$service_name"
import os
import sys
import zipfile
import re
from pathlib import Path

raw_out = sys.argv[1]
service_name = sys.argv[2]

if os.name == 'nt' and re.match(r'^/([a-zA-Z])/(.*)', raw_out):
    raw_out = re.sub(r'^/([a-zA-Z])/(.*)', r'\1:/\2', raw_out)

output_path = Path(raw_out).resolve()

if not output_path.is_file():
    print(f"ERROR: Package ZIP not found at {output_path}", file=sys.stderr)
    sys.exit(1)

with zipfile.ZipFile(output_path, 'r') as zipf:
    namelist = zipf.namelist()
    
    # 1. Verify lambda_handler.py exists at ZIP root
    if "lambda_handler.py" not in namelist:
        print(f"ERROR: 'lambda_handler.py' NOT found at ZIP root for {service_name}!", file=sys.stderr)
        sys.exit(1)
        
    # 2. Verify no nested service wrapper directories exist
    if any(name.startswith(f"{service_name}/") or name.startswith("backend/") for name in namelist):
        print(f"ERROR: ZIP contains nested service parent folder for {service_name}!", file=sys.stderr)
        sys.exit(1)
        
    print(f"SUCCESS: Package ZIP structure validated for {service_name}. 'lambda_handler.py' present at ZIP root.")
PY

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "artifact_path=${output_path}" >> "${GITHUB_OUTPUT}"
fi
