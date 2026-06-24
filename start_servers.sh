#!/bin/bash
# Setup e arranque de todos os microserviços (Linux)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
    python3 main.py &
    deactivate
    echo "$name iniciado (PID: $!)"
    sleep 2
}

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
