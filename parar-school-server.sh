#!/usr/bin/env bash

set -Eeuo pipefail

readonly SERVICES=(
  nginx
  school-api
  school-auth
  school-db
  mongodb44
)

if (( EUID != 0 )); then
  exec sudo -- "$0" "$@"
fi

echo "A parar o School Server..."
systemctl stop "${SERVICES[@]}"

echo
echo "Estado dos serviços:"
for service in "${SERVICES[@]}"; do
  printf "  %-12s %s\n" "$service" "$(systemctl is-active "$service" || true)"
done

echo
echo "School Server parado."
