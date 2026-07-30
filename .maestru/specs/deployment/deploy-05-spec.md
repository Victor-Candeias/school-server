---
maestru: "0.4"
type: work-spec
id: deploy-05-spec
title: "DEPLOY-05 Plano de publicação Cloudflare"
template: implementation-plan-v1
work-item: deployment/DEPLOY-05
owner: developer
created: 2026-07-29
---

# DEPLOY-05 Plano de publicação Cloudflare

## Overview

Endurecer o ponto de entrada Nginx e a sessão de autenticação antes de ligar
`schoolhome.pt` ao serviço local através de um Cloudflare Tunnel gerido pelo
dashboard.

## Implementation

1. Separar o virtual host público do host predefinido e aceitar o domínio e
   os endereços usados pelos health checks.
2. Bloquear explicitamente `/db-api` no Nginx, mantendo o serviço disponível
   apenas em loopback para `auth` e `school`.
3. Marcar o cookie de autenticação e a respetiva remoção como seguros para
   HTTPS.
4. Documentar a criação da rota Cloudflare
   `schoolhome.pt → http://localhost:80`.
5. Validar testes, configuração Nginx, Maestru e comportamento publicado.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `deploy/nginx/school-server.conf` | Modify | Restringir hosts e bloquear a API de base de dados |
| `auth/routes/auth_routes.py` | Modify | Emitir e remover cookies seguros |
| `school/routes/auth_routes.py` | Modify | Manter a implementação duplicada coerente |
| `api_tests/tests/test_auth_service.py` | Modify | Validar os atributos do cookie |
| `deploy/enable-schoolhome.sh` | Create | Aplicar a configuração e instalar o túnel |
| `deploy/cloudflare/README.md` | Create | Documentar a ligação do túnel |
| `.maestru/docs/project-overview.md` | Modify | Atualizar a arquitetura publicada |
