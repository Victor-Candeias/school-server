#!/bin/bash
# Setup e arranque de todos os microserviços (Linux)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker_compose() {
    if docker info >/dev/null 2>&1; then
        docker compose "$@"
    else
        sudo docker compose "$@"
    fi
}

start_infrastructure() {
    echo "=== A iniciar infraestrutura Docker ==="
    cd "$SCRIPT_DIR"
    docker_compose -f db_service/docker-compose.yml up -d mongo
    echo "=== MongoDB pronto em mongodb://localhost:27017 ==="
}

setup_service() {
    local name=$1
    local dir="$SCRIPT_DIR/$name"
    echo "=== Configurar $name ==="
    cd "$dir"
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    source .venv/bin/activate
    pip install -q -r requirements.txt
    deactivate
    echo "=== $name pronto ==="
}

start_service() {
    local name=$1
    local dir="$SCRIPT_DIR/$name"
    echo "=== A iniciar $name ==="
    cd "$dir"
    source .venv/bin/activate
    HOST=0.0.0.0 \
    MONGO_DB_CONNECTION_STRING="${MONGO_DB_CONNECTION_STRING:-mongodb://localhost:27017}" \
    DATABASE_NAME="${DATABASE_NAME:-school}" \
    BD_BASE_URL="${BD_BASE_URL:-http://127.0.0.1:8000/db-api}" \
    python3 main.py &
    deactivate
    echo "$name iniciado (PID: $!)"
    sleep 2
}

# Iniciar dependências Docker
start_infrastructure

# Instalar dependências
setup_service db_service
setup_service auth
setup_service school

# Iniciar serviços por ordem
start_service db_service
start_service auth
start_service school

echo ""
echo "=== Todos os serviços iniciados ==="
echo "  db_service : http://127.0.0.1:8000/docs"
echo "  auth       : http://127.0.0.1:8010/docs"
echo "  school     : http://127.0.0.1:8020/docs"
echo ""
echo "Para parar: kill \$(lsof -ti:8000,8010,8020)"
