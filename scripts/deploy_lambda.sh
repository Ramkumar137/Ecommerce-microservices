#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="${1:?Usage: $0 <service-directory>}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert relative path to absolute path
if [[ "${SERVICE_DIR}" != /* ]]; then
    SERVICE_DIR="${REPO_ROOT}/${SERVICE_DIR}"
fi

SERVICE_DIR="$(cd "${SERVICE_DIR}" && pwd)"
SERVICE_NAME="$(basename "${SERVICE_DIR}")"

OUTPUT_ZIP="${REPO_ROOT}/${SERVICE_NAME}.zip"

echo "=============================================="
echo "Packaging Lambda"
echo "Service : ${SERVICE_NAME}"
echo "Source  : ${SERVICE_DIR}"
echo "Output  : ${OUTPUT_ZIP}"
echo "=============================================="

# --------------------------------------------------
# Validate required files
# --------------------------------------------------

if [[ ! -d "${SERVICE_DIR}" ]]; then
    echo "ERROR: Service directory does not exist"
    exit 1
fi

if [[ ! -f "${SERVICE_DIR}/requirements.txt" ]]; then
    echo "ERROR: requirements.txt not found"
    exit 1
fi

if [[ ! -f "${SERVICE_DIR}/lambda_handler.py" ]]; then
    echo "ERROR: lambda_handler.py not found at service root"
    exit 1
fi

# --------------------------------------------------
# Create clean temporary build directory
# --------------------------------------------------

BUILD_DIR="$(mktemp -d)"

trap 'rm -rf "${BUILD_DIR}"' EXIT

echo ""
echo "Build directory:"
echo "${BUILD_DIR}"

# --------------------------------------------------
# Install dependencies INTO Lambda package
# --------------------------------------------------

echo ""
echo "Installing dependencies..."

python -m pip install \
    --upgrade pip \
    --quiet

python -m pip install \
    -r "${SERVICE_DIR}/requirements.txt" \
    --target "${BUILD_DIR}" \
    --no-cache-dir

# --------------------------------------------------
# Copy application source files
# --------------------------------------------------

echo ""
echo "Copying application source..."

cp -R "${SERVICE_DIR}/." "${BUILD_DIR}/"

# --------------------------------------------------
# Remove files that must NOT be deployed
# --------------------------------------------------

echo ""
echo "Cleaning deployment package..."

rm -rf \
    "${BUILD_DIR}/package" \
    "${BUILD_DIR}/tests" \
    "${BUILD_DIR}/.pytest_cache" \
    "${BUILD_DIR}/.venv" \
    "${BUILD_DIR}/venv" \
    "${BUILD_DIR}/node_modules" \
    "${BUILD_DIR}/htmlcov"

find "${BUILD_DIR}" \
    -type d \
    -name "__pycache__" \
    -prune \
    -exec rm -rf {} +

find "${BUILD_DIR}" \
    -type f \
    \( \
        -name "*.pyc" \
        -o -name "*.pyo" \
        -o -name "*.sqlite3" \
        -o -name "*.zip" \
        -o -name ".env" \
        -o -name ".coverage*" \
    \) \
    -delete

# --------------------------------------------------
# Make sure package directory was not copied
# --------------------------------------------------

if [[ -d "${BUILD_DIR}/package" ]]; then
    echo "ERROR: package directory still exists in build"
    exit 1
fi

# --------------------------------------------------
# Verify handler before ZIP
# --------------------------------------------------

if [[ ! -f "${BUILD_DIR}/lambda_handler.py" ]]; then
    echo "ERROR: lambda_handler.py missing from build root"
    exit 1
fi

# --------------------------------------------------
# Verify dependencies before ZIP
# --------------------------------------------------

echo ""
echo "Checking dependencies..."

REQUIRED_MODULES=(
    "django"
    "mangum"
    "rest_framework"
    "corsheaders"
)

for module in "${REQUIRED_MODULES[@]}"; do
    if [[ ! -e "${BUILD_DIR}/${module}" ]]; then
        echo "ERROR: Missing dependency: ${module}"
        exit 1
    fi

    echo "OK: ${module}"
done

# --------------------------------------------------
# Create ZIP
# --------------------------------------------------

rm -f "${OUTPUT_ZIP}"

echo ""
echo "Creating ZIP..."

(
    cd "${BUILD_DIR}"
    zip -qr "${OUTPUT_ZIP}" .
)

echo ""
echo "ZIP created:"
echo "${OUTPUT_ZIP}"

# --------------------------------------------------
# Inspect ZIP
# --------------------------------------------------

echo ""
echo "=============================================="
echo "ZIP CONTENT CHECK"
echo "=============================================="

unzip -l "${OUTPUT_ZIP}" | head -40

# --------------------------------------------------
# Validate ZIP structure
# --------------------------------------------------

echo ""
echo "Validating ZIP..."

python - "${OUTPUT_ZIP}" "${SERVICE_NAME}" <<'PY'
import sys
import zipfile

zip_path = sys.argv[1]
service_name = sys.argv[2]

with zipfile.ZipFile(zip_path, "r") as z:
    files = z.namelist()

required = [
    "lambda_handler.py",
]

for item in required:
    if item not in files:
        print(f"ERROR: Missing {item}")
        sys.exit(1)

# Handler MUST be at root
if any(
    name.endswith("/lambda_handler.py")
    and name != "lambda_handler.py"
    for name in files
):
    print("ERROR: lambda_handler.py exists inside nested directory")
    sys.exit(1)

# Service folder MUST NOT be the ZIP root
nested_service = f"{service_name}/"

if any(name.startswith(nested_service) for name in files):
    print(
        f"ERROR: ZIP contains nested service directory: {nested_service}"
    )
    sys.exit(1)

required_modules = [
    "django/",
    "mangum/",
    "rest_framework/",
    "corsheaders/",
]

for module in required_modules:
    if not any(name.startswith(module) for name in files):
        print(f"ERROR: Missing dependency: {module}")
        sys.exit(1)

print("")
print("SUCCESS")
print("-----------------------------")
print("lambda_handler.py : OK")
print("django             : OK")
print("mangum             : OK")
print("rest_framework     : OK")
print("corsheaders        : OK")
print("No nested service  : OK")
print("-----------------------------")
print(f"Valid Lambda ZIP: {zip_path}")
PY

echo ""
echo "=============================================="
echo "PACKAGE SUCCESS"
echo "=============================================="

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "artifact_path=${OUTPUT_ZIP}" >> "${GITHUB_OUTPUT}"
fi