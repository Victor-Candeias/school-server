---
maestru: "0.4"
type: work-spec
id: deploy-01-spec
title: "Plano de deploy com systemd e Nginx"
template: implementation-plan-v1
work-item: deployment/DEPLOY-01
owner: victor
created: 2026-07-24
---

# Plano de deploy com systemd e Nginx

## Overview

Configurar um deploy local persistente do school-server, iniciado
automaticamente no arranque do computador. MongoDB e os três serviços
FastAPI permanecem em loopback; o Nginx serve o build estático do frontend
e é o único ponto de entrada exposto à rede.

## Implementation

1. Auditar serviços existentes, portas, permissões administrativas e
   firewall.
2. Adicionar ao repositório unidades systemd reproduzíveis para
   `db_service`, `auth` e `school`.
3. Adicionar configuração Nginx para SPA e proxies `/auth-api`,
   `/school-api` e `/db-api`.
4. Criar um ficheiro de ambiente protegido em
   `/etc/school-server/backend.env`.
5. Instalar as unidades, compilar e publicar o frontend em
   `/var/www/school-server`.
6. Ativar os serviços no arranque e validar MongoDB, APIs, proxy e frontend
   através da rede local.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `deploy/systemd/school-db.service` | Create | Serviço systemd do `db_service` |
| `deploy/systemd/school-auth.service` | Create | Serviço systemd de autenticação |
| `deploy/systemd/school-api.service` | Create | Serviço systemd da API escolar |
| `deploy/nginx/school-server.conf` | Create | Frontend SPA e proxy reverso |
| `deploy/backend.env.example` | Create | Contrato não secreto de configuração |
| `deploy/install.sh` | Create | Instalação privilegiada e ativação reproduzível |
| `.maestru/docs/project-overview.md` | Update | Registar o estado efetivamente instalado |

## Validation

- `npm ci` e `npm run build` concluídos com sucesso.
- Unidades verificadas com `systemd-analyze verify`.
- `mongodb44`, `school-db`, `school-auth`, `school-api` e `nginx`
  habilitados e ativos.
- Frontend, assets e fallback SPA respondem com HTTP 200 pela rede local.
- OpenAPI de `db_service`, `auth` e `school` responde diretamente em
  loopback.
- Proxies `/auth-api`, `/school-api` e `/db-api` respondem através do Nginx.
- Porta `8000` inacessível através do IP da rede, confirmando o isolamento
  externo do backend.
