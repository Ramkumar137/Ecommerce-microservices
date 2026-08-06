#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-${GITHUB_SHA:-HEAD}}"

if [ -z "${BASE_SHA}" ]; then
  if [ "${GITHUB_EVENT_NAME:-}" = "pull_request" ]; then
    BASE_SHA="${GITHUB_EVENT_PULL_REQUEST_BASE_SHA:-}"
  elif [ -n "${GITHUB_EVENT_BEFORE:-}" ] && [ "${GITHUB_EVENT_BEFORE}" != "0000000000000000000000000000000000000000" ]; then
    BASE_SHA="${GITHUB_EVENT_BEFORE}"
  else
    BASE_SHA="$(git rev-list --max-count=1 "${HEAD_SHA}^" 2>/dev/null || true)"
  fi
fi

if [ -z "${BASE_SHA}" ] || [ "${BASE_SHA}" = "${HEAD_SHA}" ]; then
  changed_files="$(git ls-files)"
else
  changed_files="$(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}" --)"
fi

backend_services=(
  "auth-service"
  "product-service"
  "inventory-service"
  "cart-service"
  "order-service"
  "payment-service"
  "analytics-service"
  "notification-service"
)

changed_services=()
for service in "${backend_services[@]}"; do
  if echo "${changed_files}" | grep -Eq "^${service}/|^${service}$"; then
    changed_services+=("${service}")
  fi
done

frontend_changed=false
if echo "${changed_files}" | grep -Eq '^frontend/|^frontend$'; then
  frontend_changed=true
fi

output_file="${GITHUB_OUTPUT:-}"
if [ -n "${output_file}" ]; then
  if [ "${#changed_services[@]}" -eq 0 ]; then
    echo "has_changes=false" >> "${output_file}"
    echo "services=[]" >> "${output_file}"
  else
    json_services="$(printf '%s\n' "${changed_services[@]}" | jq -R . | jq -s -c .)"
    echo "has_changes=true" >> "${output_file}"
    echo "services=${json_services}" >> "${output_file}"
  fi

  echo "frontend_changed=${frontend_changed}" >> "${output_file}"
fi

if [ "${#changed_services[@]}" -eq 0 ]; then
  echo "No backend service changes detected."
else
  echo "Changed services:"
  printf ' - %s\n' "${changed_services[@]}"
fi

if [ "${frontend_changed}" = "true" ]; then
  echo "Frontend changes detected."
fi
