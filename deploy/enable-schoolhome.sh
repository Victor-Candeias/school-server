#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_DIR=/home/victor/Dev/school/school-server
readonly NGINX_SOURCE="$PROJECT_DIR/deploy/nginx/school-server.conf"
readonly NGINX_TARGET=/etc/nginx/sites-available/school-server

if [[ ${EUID} -ne 0 ]]; then
    echo "Executar com privilégios administrativos:" >&2
    echo "  sudo ./deploy/enable-schoolhome.sh" >&2
    exit 1
fi

for command in cloudflared curl nginx systemctl; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Comando obrigatório não encontrado: $command" >&2
        exit 1
    fi
done

echo "[1/4] A proteger e configurar o Nginx..."
install -m 0644 "$NGINX_SOURCE" "$NGINX_TARGET"
ln -sfn "$NGINX_TARGET" /etc/nginx/sites-enabled/school-server
if [[ -L /etc/nginx/sites-enabled/default ]]; then
    unlink /etc/nginx/sites-enabled/default
fi
nginx -t
systemctl reload nginx

echo "[2/4] A reiniciar as APIs com cookies seguros..."
systemctl restart school-auth school-api

echo "[3/4] A configurar o serviço Cloudflare Tunnel..."
if systemctl list-unit-files cloudflared.service --no-legend | grep -q cloudflared.service; then
    echo "O serviço cloudflared já está instalado."
else
    read -rsp "Token do túnel Cloudflare: " tunnel_token
    echo
    if [[ -z "$tunnel_token" ]]; then
        echo "O token do túnel é obrigatório." >&2
        exit 1
    fi
    cloudflared service install "$tunnel_token"
    unset tunnel_token
fi
systemctl enable --now cloudflared

echo "[4/4] A validar o ponto de entrada local..."
curl --fail --silent --show-error --output /dev/null \
    --header "Host: schoolhome.pt" \
    http://127.0.0.1/

db_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
    --header "Host: schoolhome.pt" \
    http://127.0.0.1/db-api/openapi.json)"
if [[ "$db_status" != "404" ]]; then
    echo "/db-api deveria devolver 404, mas devolveu $db_status." >&2
    exit 1
fi

systemctl is-active --quiet nginx school-auth school-api cloudflared

echo "Configuração local de schoolhome.pt concluída."
echo "Confirma agora no dashboard a rota:"
echo "  schoolhome.pt -> http://localhost:80"
