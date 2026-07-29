#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly PROJECT_DIR="$SCRIPT_DIR"
readonly FRONTEND_DIR="$PROJECT_DIR/frontend"
readonly WEB_ROOT=/var/www/school-server
readonly ENV_FILE=/etc/school-server/backend.env
readonly SYSTEMD_DIR=/etc/systemd/system
readonly SERVICES=(school-db school-auth school-api)

TEMP_DIR=

cleanup() {
  if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
    rm -rf -- "$TEMP_DIR"
  fi
}

on_error() {
  local exit_code=$?

  echo >&2
  echo "Deploy interrompido (código $exit_code)." >&2
  echo "Consultar os serviços com:" >&2
  echo "  sudo systemctl status school-db school-auth school-api nginx --no-pager" >&2
  exit "$exit_code"
}

trap cleanup EXIT
trap on_error ERR

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Comando obrigatório não encontrado: $1" >&2
    exit 1
  fi
}

wait_for_url() {
  local name=$1
  local url=$2
  local attempt

  for attempt in {1..20}; do
    if curl --fail --silent --show-error --output /dev/null "$url"; then
      printf "  %-12s OK\n" "$name"
      return 0
    fi
    sleep 1
  done

  echo "O health check de $name falhou: $url" >&2
  return 1
}

render_unit() {
  local service=$1
  local component=$2
  local source_file="$PROJECT_DIR/deploy/systemd/$service.service"
  local target_file="$TEMP_DIR/$service.service"

  if [[ ! -f "$source_file" ]]; then
    echo "Unidade systemd não encontrada: $source_file" >&2
    exit 1
  fi

  sed \
    -e "s|^User=.*|User=$DEPLOY_USER|" \
    -e "s|^Group=.*|Group=$DEPLOY_GROUP|" \
    -e "s|^WorkingDirectory=.*|WorkingDirectory=$PROJECT_DIR/$component|" \
    -e "s|^ExecStart=.*|ExecStart=$PROJECT_DIR/.venv/bin/python main.py|" \
    "$source_file" >"$target_file"
}

for command in curl npm python3 sed stat sudo; do
  require_command "$command"
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Configuração ausente: $ENV_FILE" >&2
  echo "Executar primeiro: sudo ./deploy/install.sh" >&2
  exit 1
fi

if [[ ! -f "$FRONTEND_DIR/package-lock.json" ]]; then
  echo "Lockfile do frontend não encontrado." >&2
  exit 1
fi

readonly DEPLOY_USER="$(stat -c '%U' "$PROJECT_DIR")"
readonly DEPLOY_GROUP="$(stat -c '%G' "$PROJECT_DIR")"

if [[ "$DEPLOY_USER" == "UNKNOWN" || "$DEPLOY_GROUP" == "UNKNOWN" ]]; then
  echo "Não foi possível determinar o utilizador do deployment." >&2
  exit 1
fi

echo "A preparar o deploy a partir de $PROJECT_DIR"
sudo -v

echo
echo "[1/6] A atualizar o ambiente Python..."
if [[ ! -x "$PROJECT_DIR/.venv/bin/python" ]]; then
  python3 -m venv "$PROJECT_DIR/.venv"
fi

"$PROJECT_DIR/.venv/bin/python" -m pip install \
  --disable-pip-version-check \
  -r "$PROJECT_DIR/db_service/requirements.txt" \
  -r "$PROJECT_DIR/auth/requirements.txt" \
  -r "$PROJECT_DIR/school/requirements.txt"

echo
echo "[2/6] A validar o backend..."
"$PROJECT_DIR/.venv/bin/python" -m compileall -q \
  "$PROJECT_DIR/db_service" \
  "$PROJECT_DIR/auth" \
  "$PROJECT_DIR/school"

echo
echo "[3/6] A instalar dependências e compilar o frontend..."
npm --prefix "$FRONTEND_DIR" ci
npm --prefix "$FRONTEND_DIR" run build

if [[ ! -f "$FRONTEND_DIR/dist/index.html" ]]; then
  echo "O build não produziu frontend/dist/index.html." >&2
  exit 1
fi

echo
echo "[4/6] A instalar as unidades dos serviços..."
TEMP_DIR="$(mktemp -d)"
render_unit school-db db_service
render_unit school-auth auth
render_unit school-api school

for service in "${SERVICES[@]}"; do
  sudo install -m 0644 "$TEMP_DIR/$service.service" "$SYSTEMD_DIR/$service.service"
done
sudo systemctl daemon-reload

echo
echo "[5/6] A publicar o frontend e reiniciar o backend..."
sudo install -d -m 0755 "$WEB_ROOT"
sudo cp -a "$FRONTEND_DIR/dist/." "$WEB_ROOT/"
sudo find "$WEB_ROOT" -type d -exec chmod 0755 {} +
sudo find "$WEB_ROOT" -type f -exec chmod 0644 {} +

sudo systemctl restart "${SERVICES[@]}"
sudo systemctl restart nginx

echo
echo "[6/6] A verificar o deployment..."
for service in "${SERVICES[@]}" nginx; do
  sudo systemctl is-active --quiet "$service"
done

wait_for_url "base de dados" "http://127.0.0.1:8000/openapi.json"
wait_for_url "autenticação" "http://127.0.0.1:8010/openapi.json"
wait_for_url "school API" "http://127.0.0.1:8020/openapi.json"
wait_for_url "frontend" "http://127.0.0.1/"

echo
echo "Deploy do backend e frontend concluído com sucesso."
