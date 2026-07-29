---
maestru: "0.4"
type: work-spec
id: fe-36-spec
title: "FE-36 Avaliações agrupadas por tipo"
template: implementation-plan-v1
work-item: frontend/FE-36
owner: victor
created: 2026-07-29
---

# FE-36 Avaliações agrupadas por tipo

## Overview

Reorganizar a tabela da opção "Avaliações" para agrupar, dentro do semestre selecionado,
os momentos de avaliação pelo respetivo tipo configurado. Cada grupo apresenta os
momentos nas subcolunas e uma coluna final "Soma" com o subtotal por aluno.

## Implementation

1. Derivar grupos estáveis a partir de `evaluationMomentTemplateType` (com fallback para
   `type`) e preservar a ordem dos momentos.
2. Calcular o subtotal de cada grupo por aluno e acrescentá-lo às linhas usadas pela
   tabela, gravação e relatório.
3. Renderizar dois níveis de cabeçalho: tipo do momento e, abaixo, momentos mais "Soma".
4. Ajustar os estilos da grelha e manter scroll horizontal quando a largura exceder o ecrã.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/applicationRuntime.ts` | update | Tipar os grupos e as novas ações de cálculo |
| `frontend/src/hooks/useAssessments.ts` | update | Agrupar momentos, calcular subtotais e alinhar o payload |
| `frontend/src/hooks/useEvaluations.ts` | update | Expor as novas ações no modelo da aplicação |
| `frontend/src/pages/sections/SemesterAssessments.tsx` | update | Renderizar cabeçalhos agrupados e subtotais |
| `frontend/src/App.css` | update | Estilizar os dois níveis de cabeçalho e as colunas de soma |
