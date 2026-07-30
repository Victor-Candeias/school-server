---
maestru: "0.4"
type: work-item
id: DEPLOY-05
title: Publicar schoolhome.pt com Cloudflare Tunnel
created: 2026-07-29
owner: developer
priority: critical
status: in-progress
track: deployment
specs: [deploy-05-spec]
---

# DEPLOY-05: Publicar schoolhome.pt com Cloudflare Tunnel

## Objetivo

Preparar o servidor para publicar a aplicação em `https://schoolhome.pt`
através de Cloudflare Tunnel, mantendo os serviços internos inacessíveis pela
Internet.

## Critérios de aceitação

- O Nginx reconhece `schoolhome.pt` e `www.schoolhome.pt`.
- O frontend e apenas as APIs de autenticação e escola são publicados.
- `/db-api` devolve 404 no ponto de entrada público.
- O cookie de autenticação usa `Secure`, `HttpOnly`, `SameSite=Lax` e `/`.
- A configuração mantém os health checks locais através de `127.0.0.1`.
- O procedimento para ligar o túnel ao serviço `http://localhost:80` está
  documentado sem guardar credenciais no repositório.
