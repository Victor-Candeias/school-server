---
maestru: "0.4"
type: work-spec
id: fe-33-spec
title: "FE-33 Plano de refactor do App.tsx"
template: implementation-plan-v1
work-item: frontend/FE-33
owner: developer
created: 2026-07-28
---

# FE-33 Plano de refactor do App.tsx

## Overview

Reduzir `frontend/src/App.tsx` a uma shell de composição e separar as áreas
visuais com fronteiras claras, sem alterar os contratos com as APIs nem o
comportamento dos dashboards existentes.

## Implementation

1. Mover a orquestração atual para `application/SchoolApplication.tsx`.
2. Extrair o ecrã de autenticação para `components/auth/AuthPage.tsx`.
3. Extrair a navegação autenticada para `components/layout/DashboardTopbar.tsx`.
4. Manter `App.tsx` responsável apenas por montar a aplicação e carregar o CSS
   global.
5. Validar tipos, lint e build de produção.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/App.tsx` | Rewrite | Shell mínima da aplicação |
| `frontend/src/application/SchoolApplication.tsx` | Create | Estado, efeitos e orquestração dos dashboards |
| `frontend/src/components/auth/AuthPage.tsx` | Create | Formulários de login e registo |
| `frontend/src/components/layout/DashboardTopbar.tsx` | Create | Navegação e ações da sessão autenticada |
