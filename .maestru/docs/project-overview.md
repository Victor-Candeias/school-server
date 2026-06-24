---
maestru: "0.4"
type: doc
id: project-overview
title: School Server — Visão Geral do Projeto
created: 2026-06-24
description: "Documento explicativo sobre a arquitetura, microserviços e funcionamento do projeto school-server"
owner: victor
tags: [overview, architecture, microservices]
updated: 2026-06-24
---

# School Server — Visão Geral do Projeto

## Descrição

<!-- maestru:summary -->
Backend de gestão escolar em arquitetura de microserviços (Python/FastAPI). Composto por 3 serviços independentes: db_service (MongoDB, porta 8000), auth (autenticação, porta 8010) e school (gestão escolar, porta 8020). Suporta Docker e integração com frontend Next.js.
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

---

## Como Iniciar

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

### Docker
```bash
cd db_service && docker-compose up
cd auth && docker-compose up
```

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

## Frontend Esperado

O backend está configurado para aceitar pedidos CORS do frontend **Next.js** a correr em:
- `http://localhost:3000`
- `http://localhost:3001`
