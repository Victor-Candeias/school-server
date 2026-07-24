#!/usr/bin/env bash

set -Eeuo pipefail

readonly SERVICES=(
  mongodb44
  school-db
  school-auth
  school-api
  nginx
)

if (( EUID != 0 )); then
  exec sudo -- "$0" "$@"
fi

echo "A iniciar o School Server..."
systemctl start "${SERVICES[@]}"

echo
echo "Estado dos serviços:"
for service in "${SERVICES[@]}"; do
  printf "  %-12s %s\n" "$service" "$(systemctl is-active "$service")"
done

echo
echo "School Server iniciado."
