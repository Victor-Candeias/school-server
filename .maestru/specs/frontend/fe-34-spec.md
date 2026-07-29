---
maestru: "0.4"
type: work-spec
id: fe-34-spec
title: "FE-34 Plano de modularização do frontend"
template: implementation-plan-v1
work-item: frontend/FE-34
owner: developer
created: 2026-07-28
---

# FE-34 Plano de modularização do frontend

## Overview

Substituir o componente monolítico `SchoolApplication` por uma arquitetura
orientada a páginas, secções e hooks de domínio. A shell principal apenas
compõe providers e rotas; apresentação, estado e utilitários ficam separados.

## Implementation

1. Criar tipos, constantes e utilitários partilhados por domínio.
2. Extrair autenticação e configurações para contextos/hooks próprios.
3. Criar `DashboardPage` e secções independentes para escolas, anos, turmas,
   alunos e configurações.
4. Dividir a área de alunos em calendário, lista, avaliações e gráficos.
5. Extrair cada modal/formulário para um componente dedicado.
6. Remover `SchoolApplication.tsx` e manter `App.tsx` como shell.
7. Validar TypeScript, lint, build e estrutura Maestru.

## Result

- `App.tsx` é uma shell que compõe providers e a página principal.
- Estado React isolado em `useApplicationState`.
- Contratos partilhados de estado e ações definidos em `applicationRuntime`.
- Operações distribuídas por hooks de escolas, anos letivos, turmas, alunos,
  calendário, configurações, autenticação, avaliações, gráficos e relatórios.
- Autenticação e configurações disponibilizadas através de contextos próprios.
- Páginas, secções, modais, formulários e gráficos vivem em componentes
  independentes.
- O antigo `SchoolApplication.tsx` foi removido.
- Build TypeScript/Vite e lint executados com sucesso.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/App.tsx` | Update | Composição de providers e página ativa |
| `frontend/src/application/SchoolApplication.tsx` | Delete | Remover o novo monólito |
| `frontend/src/pages/**` | Create | Páginas e secções de apresentação |
| `frontend/src/components/**` | Create/Move | Modais, formulários e gráficos |
| `frontend/src/hooks/**` | Create | Estado e operações por domínio |
| `frontend/src/context/**` | Create | Autenticação e configurações globais |
| `frontend/src/utils/**` | Create | Formatação, calendário e cálculos |
| `frontend/src/types/index.ts` | Create | Contratos partilhados |
