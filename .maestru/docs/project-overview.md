---
maestru: "0.4"
type: doc
id: project-overview
title: School Server — Visão Geral do Projeto
created: 2026-06-24
description: "Documento explicativo sobre a arquitetura, microserviços e funcionamento do projeto school-server"
owner: victor
tags: [overview, architecture, microservices]
updated: 2026-07-24
---

# School Server — Visão Geral do Projeto

## Descrição

<!-- maestru:summary -->
Backend de gestão escolar em arquitetura de microserviços (Python/FastAPI). Composto por 3 serviços independentes: db_service (MongoDB, porta 8000), auth (autenticação, porta 8010) e school (gestão escolar, porta 8020). A base de dados canónica local é MongoDB 4.4.29, executada pelo serviço mongodb44.service em 127.0.0.1:27017.
<!-- /maestru:summary -->

O **School Server** é um backend para gestão escolar construído com uma arquitetura de **microserviços**. Cada serviço é independente, desenvolvido em **Python com FastAPI**, e comunicam entre si via HTTP. O sistema permite gerir escolas, anos letivos, turmas, alunos, testes e autenticação de utilizadores.

---

## Arquitetura

O projeto é composto por **3 microserviços** que devem ser iniciados sequencialmente:

```
school-server/
├── db_service/     → Serviço de base de dados (MongoDB)   porta: 8000
├── auth/           → Serviço de autenticação              porta: 8010
└── school/         → Serviço principal de gestão escolar  porta: 8020
```

O ficheiro `_StartServers.cmd` inicia os 3 serviços por ordem, com um intervalo de 2 segundos entre cada um.

### Base de dados canónica local

- **Versão:** MongoDB 4.4.29
- **Serviço systemd:** `mongodb44.service` (instalado e ativo no arranque do sistema)
- **Servidor:** `/home/victor/.mongo-local/bin/mongod`
- **Shell:** `/home/victor/.mongo-local/bin/mongo`
- **Diretório de dados:** `/home/victor/.mongodata`
- **Endereço:** `mongodb://127.0.0.1:27017`
- **Exposição:** apenas loopback; não aceita ligações MongoDB externas
- **Cache WiredTiger:** 0,25 GB

Esta instalação local é a forma canónica de executar MongoDB neste computador. Os ficheiros Docker Compose são apenas uma alternativa portátil e usam a linha MongoDB 4.4, compatível com o processador sem AVX.

---

## Microserviços

### 1. `db_service` — Serviço de Base de Dados
- **Porta:** 8000
- **Prefixo de rotas:** `/db-api`
- **Responsabilidade:** Abstrai o acesso à base de dados MongoDB. Todos os outros serviços comunicam com este para operações de leitura/escrita.
- **Stack:** FastAPI + PyMongo + Uvicorn
- **Docker:** Suporte via `Dockerfile` e `docker-compose.yml`

### 2. `auth` — Serviço de Autenticação
- **Porta:** 8010
- **Prefixo de rotas:** `/auth`
- **Responsabilidade:** Gestão de autenticação de utilizadores (login, registo, tokens).
- **CORS:** Configurado para aceitar pedidos de `localhost:3000` e `localhost:3001` (frontend Next.js)
- **Stack:** FastAPI + Uvicorn
- **Docker:** Suporte via `Dockerfile` e `docker-compose.yml`

### 3. `school` — Serviço de Gestão Escolar
- **Porta:** 8020
- **Responsabilidade:** Gestão de todas as entidades escolares.
- **Rotas disponíveis:**
  | Prefixo      | Tag             | Descrição                        |
  |--------------|-----------------|----------------------------------|
  | `/auth`      | auth            | Autenticação no serviço school   |
  | `/schools`   | schools         | Gestão de escolas                |
  | `/years`     | years           | Gestão de anos letivos           |
  | `/class`     | classes         | Gestão de turmas                 |
  | `/students`  | students        | Gestão de alunos                 |
  | `/config`    | configurations  | Configurações e testes escolares |
- **CORS:** Configurado para `localhost:3000` e `localhost:3001`
- **Stack:** FastAPI + Uvicorn

---

## Tecnologias Utilizadas

| Tecnologia       | Versão    | Uso                                   |
|------------------|-----------|---------------------------------------|
| Python           | 3.x       | Linguagem principal                   |
| MongoDB          | 4.4.29    | Base de dados local canónica           |
| FastAPI          | 0.115.11  | Framework web / REST API              |
| Uvicorn          | 0.34.0    | Servidor ASGI                         |
| PyMongo          | 4.11.3    | Driver MongoDB                        |
| Pydantic         | 2.10.6    | Validação de dados / modelos          |
| python-dotenv    | 1.0.1     | Gestão de variáveis de ambiente       |
| pytest           | 8.3.5     | Testes automatizados                  |
| Docker           | —         | Containerização dos serviços          |

---

## Variáveis de Ambiente

Cada serviço utiliza um ficheiro `.env` para configuração:

| Variável | Descrição                        | Default     |
|----------|----------------------------------|-------------|
| `HOST`   | IP/hostname do servidor          | `127.0.0.1` |
| `PORT`   | Porta do servidor                | varia       |
| `MONGO_DB_CONNECTION_STRING` | Ligação ao MongoDB local | `mongodb://127.0.0.1:27017` |

---

## Arranque canónico do ambiente de desenvolvimento

Todos os comandos seguintes partem da raiz do repositório:

```bash
cd /home/victor/Dev/school/school-server
```

### 1. MongoDB

Iniciar a base de dados local:

```bash
sudo systemctl start mongodb44
```

Verificar o estado, se necessário:

```bash
systemctl status mongodb44 --no-pager
```

O MongoDB escuta apenas em `127.0.0.1:27017`.

### 2. Backend

Os três serviços devem ser iniciados pela ordem abaixo, cada um num terminal
separado. Todos escutam apenas no endereço local da máquina.

```bash
# Terminal 1 — acesso à base de dados
HOST=127.0.0.1 PORT=8000 ./.venv/bin/python db_service/main.py

# Terminal 2 — autenticação
HOST=127.0.0.1 PORT=8010 ./.venv/bin/python auth/main.py

# Terminal 3 — gestão escolar
HOST=127.0.0.1 PORT=8020 ./.venv/bin/python school/main.py
```

| Serviço | Endereço local | Documentação OpenAPI |
|---------|----------------|----------------------|
| `db_service` | `http://127.0.0.1:8000` | `http://127.0.0.1:8000/docs` |
| `auth` | `http://127.0.0.1:8010` | `http://127.0.0.1:8010/docs` |
| `school` | `http://127.0.0.1:8020` | `http://127.0.0.1:8020/docs` |

Como os serviços usam `HOST=127.0.0.1`, as portas `8000`, `8010` e `8020`
não ficam diretamente acessíveis a partir de outras máquinas.

### 3. Frontend

Iniciar o frontend React/Vite num quarto terminal:

```bash
cd /home/victor/Dev/school/school-server/frontend
npm run dev -- --host 0.0.0.0
```

Na própria máquina, abrir:

```text
http://localhost:5173
```

Noutra máquina da mesma rede, abrir:

```text
http://<IP-DA-MAQUINA-SERVIDORA>:5173
```

O frontend escuta em `0.0.0.0:5173`, ficando disponível nas interfaces de
rede da máquina, desde que a firewall permita a porta `5173`.

O proxy de desenvolvimento do Vite permite que um cliente externo use o
backend sem expor diretamente as portas dos serviços:

| Caminho recebido pelo Vite | Destino local |
|----------------------------|---------------|
| `/auth-api` | `http://127.0.0.1:8010` |
| `/school-api` | `http://127.0.0.1:8020` |
| `/db-api` | `http://127.0.0.1:8000` |

Assim, o frontend fica acessível na rede, enquanto o backend permanece
diretamente acessível apenas na máquina e é alcançado externamente através
do proxy do Vite.

Para parar cada processo iniciado num terminal, usar `Ctrl+C`.

### Instalação inicial de dependências

Se o ambiente virtual Python ou as dependências do frontend ainda não
existirem:

```bash
python3 -m venv .venv
./.venv/bin/pip install -r db_service/requirements.txt
./.venv/bin/pip install -r auth/requirements.txt
./.venv/bin/pip install -r school/requirements.txt

cd frontend
npm install
```

### Windows
```cmd
_StartServers.cmd
```
Inicia os 3 serviços sequencialmente.

### Manual (por serviço)
```bash
# 1. Base de dados
cd db_service && python main.py

# 2. Autenticação
cd auth && python main.py

# 3. Gestão escolar
cd school && python main.py
```

### Docker — alternativa portátil
```bash
cd db_service && docker-compose up
cd auth && docker-compose up
```

---

## Deploy estável com arranque automático

Num deploy estável, o frontend não deve ser executado com o servidor de
desenvolvimento do Vite. O build estático é servido pelo Nginx, que também
funciona como ponto de entrada e proxy para os serviços backend.

### Arquitetura de arranque

```text
Arranque do PC
  ├─ mongodb44.service
  ├─ school-db.service     → 127.0.0.1:8000
  ├─ school-auth.service   → 127.0.0.1:8010
  ├─ school-api.service    → 127.0.0.1:8020
  └─ nginx.service         → rede externa, porta 80/443
       ├─ serve frontend/dist
       └─ encaminha /auth-api, /school-api e /db-api
```

### 1. MongoDB

Garantir que o MongoDB inicia automaticamente:

```bash
sudo systemctl enable --now mongodb44
```

### 2. Serviços systemd do backend

Criar três unidades systemd:

- `school-db.service` para `db_service`;
- `school-auth.service` para `auth`;
- `school-api.service` para `school`.

As unidades devem usar:

- `User=victor` e `Group=victor`;
- o diretório de trabalho correto;
- `.venv/bin/python` do projeto como executável;
- `Restart=always`;
- dependências entre MongoDB, `db_service`, `auth` e `school`;
- `HOST=127.0.0.1`, para que o backend não fique diretamente exposto à rede.

Não omitir `User=` nas unidades: numa unidade systemd de sistema, a omissão
faz o processo executar como `root`. O utilizador `victor` é usado porque o
repositório e o ambiente virtual já lhe pertencem.

### 3. Configuração do backend

Fornecer às unidades, pelo menos, a configuração:

```dotenv
DATABASE_NAME=school
BD_BASE_URL=http://127.0.0.1:8000/db-api
```

A configuração deve ficar num ficheiro protegido, por exemplo
`/etc/school-server/backend.env`, referenciado pelas unidades systemd.

### 4. Build do frontend

Produzir os ficheiros estáticos:

```bash
cd /home/victor/Dev/school/school-server/frontend
npm ci
npm run build
```

O build gera `frontend/dist`. Não é necessário manter um processo Node ou
Vite ativo depois do build.

### 5. Nginx

Instalar o Nginx:

```bash
sudo apt install nginx
```

O Nginx deve:

- servir o conteúdo compilado em `/var/www/school-server`;
- usar fallback para `index.html`, necessário para as rotas React;
- encaminhar `/auth-api` para `127.0.0.1:8010`;
- encaminhar `/school-api` para `127.0.0.1:8020`;
- encaminhar `/db-api` para `127.0.0.1:8000`;
- escutar na porta `80`, ou na porta `443` com HTTPS.

### 6. Ativação dos serviços

Depois de instalar as unidades e validar a configuração do Nginx:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now school-db school-auth school-api nginx
```

### 7. Firewall

Expor apenas o ponto de entrada do Nginx:

```text
Permitir externamente: 80 e/ou 443
Bloquear externamente: 27017, 8000, 8010 e 8020
```

MongoDB e os três serviços Python permanecem acessíveis apenas através de
`127.0.0.1`. O Nginx é o único serviço da aplicação diretamente acessível
pela rede.

---

## Estrutura de Pastas (por serviço)

```
<serviço>/
├── main.py         → Ponto de entrada da aplicação
├── models/         → Modelos de dados (Pydantic)
├── routes/         → Definição das rotas/endpoints
├── utils/          → Funções utilitárias
├── tests/          → Testes automatizados (pytest)
├── requirements.txt → Dependências Python
└── .env            → Variáveis de ambiente (não versionado)
```

---

## Frontend

O frontend atual usa React, TypeScript e Vite. Em desenvolvimento, a porta
padrão é `5173`; os serviços `auth` e `school` aceitam essa origem por CORS.
O acesso normal às APIs pelo frontend usa os caminhos de proxy descritos na
secção de arranque canónico.
