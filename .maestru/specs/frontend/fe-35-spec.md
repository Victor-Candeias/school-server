---
maestru: "0.4"
type: work-spec
id: fe-35-spec
title: "FE-35 Plano de code splitting do frontend"
template: implementation-plan-v1
work-item: frontend/FE-35
owner: developer
created: 2026-07-28
---

# FE-35 Plano de code splitting do frontend

## Overview

Reduzir o JavaScript carregado inicialmente pelo frontend, criando fronteiras de
carregamento para secções, submenus de alunos e modais. Separar React e Recharts
em chunks estáveis e disponibilizar um relatório visual do bundle para orientar
otimizações futuras.

## Implementation

1. Substituir imports estáticos das secções secundárias e dos modais por
   `React.lazy`, mantendo a secção inicial de escolas disponível imediatamente.
2. Adicionar `Suspense` com um estado de carregamento acessível e reutilizável.
3. Carregar cada submenu de alunos apenas quando for selecionado, garantindo que
   Recharts não pertence ao chunk inicial.
4. Configurar os grupos `react-vendor` e `charts-vendor` através de
   `build.rolldownOptions.output.codeSplitting`.
5. Adicionar um modo de análise que produza `dist/stats.html` com os módulos e
   tamanhos dos chunks.
6. Validar lint, TypeScript, build normal, build de análise e o índice Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/pages/DashboardPage.tsx` | Modify | Carregar secções e modais sob pedido |
| `frontend/src/pages/sections/StudentsSection.tsx` | Modify | Carregar apenas o submenu selecionado |
| `frontend/src/components/feedback/SectionLoader.tsx` | Create | Apresentar fallback acessível de carregamento |
| `frontend/vite.config.ts` | Modify | Separar vendors e ativar relatório visual |
| `frontend/package.json` | Modify | Adicionar comando e dependência de análise |
| `frontend/package-lock.json` | Modify | Fixar a dependência de análise |
