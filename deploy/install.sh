#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=/home/victor/Dev/school/school-server
DEPLOY_DIR="$PROJECT_DIR/deploy"
ENV_DIR=/etc/school-server
ENV_FILE="$ENV_DIR/backend.env"
WEB_ROOT=/var/www/school-server
NGINX_AVAILABLE=/etc/nginx/sites-available/school-server
NGINX_ENABLED=/etc/nginx/sites-enabled/school-server

if [[ ${EUID} -ne 0 ]]; then
    echo "Executar com privilégios administrativos: sudo ./deploy/install.sh" >&2
    exit 1
fi

if [[ ! -f "$PROJECT_DIR/frontend/dist/index.html" ]]; then
    echo "Build do frontend ausente. Executar npm ci e npm run build em frontend/." >&2
    exit 1
fi

apt-get update
apt-get install -y nginx openssl

install -d -m 0755 "$ENV_DIR"
if [[ ! -f "$ENV_FILE" ]]; then
    install -m 0600 -o root -g root "$DEPLOY_DIR/backend.env.example" "$ENV_FILE"
    encryption_key="$(openssl rand -hex 32)"
    sed -i "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$encryption_key/" "$ENV_FILE"
fi

install -m 0644 "$DEPLOY_DIR/systemd/school-db.service" /etc/systemd/system/school-db.service
install -m 0644 "$DEPLOY_DIR/systemd/school-auth.service" /etc/systemd/system/school-auth.service
install -m 0644 "$DEPLOY_DIR/systemd/school-api.service" /etc/systemd/system/school-api.service

install -d -m 0755 "$WEB_ROOT"
cp -a "$PROJECT_DIR/frontend/dist/." "$WEB_ROOT/"
find "$WEB_ROOT" -type d -exec chmod 0755 {} +
find "$WEB_ROOT" -type f -exec chmod 0644 {} +

install -m 0644 "$DEPLOY_DIR/nginx/school-server.conf" "$NGINX_AVAILABLE"
ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
if [[ -L /etc/nginx/sites-enabled/default ]]; then
    unlink /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl daemon-reload
systemctl enable --now mongodb44
systemctl enable --now school-db.service school-auth.service school-api.service
systemctl enable --now nginx.service
systemctl restart nginx.service

echo "Deploy instalado e serviços ativados."
