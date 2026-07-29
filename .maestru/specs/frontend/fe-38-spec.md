---
maestru: "0.4"
type: work-spec
id: fe-38-spec
title: "FE-38 Resultado final das avaliações"
template: implementation-plan-v1
work-item: frontend/FE-38
owner: victor
created: 2026-07-29
---

# FE-38 Resultado final das avaliações

## Overview

Adicionar uma coluna global "Final" no fim da tabela de avaliações. O valor final de
cada aluno corresponde à soma dos resultados ponderados de todos os tipos de momento
de avaliação do semestre.

## Implementation

1. Calcular o resultado final como
   `Σ(média do grupo × ponderação do grupo / 100)`.
2. Acrescentar "Final" ao cabeçalho e às linhas da tabela depois de todos os grupos.
3. Incluir a coluna final nos dados usados pela gravação e pelo relatório.
4. Destacar visualmente o resultado final sem alterar o alinhamento da grelha.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/applicationRuntime.ts` | update | Tipar a ação de cálculo do resultado final |
| `frontend/src/hooks/useAssessments.ts` | update | Somar os resultados ponderados e atualizar o payload |
| `frontend/src/hooks/useEvaluations.ts` | update | Expor a nova ação no modelo |
| `frontend/src/pages/sections/SemesterAssessments.tsx` | update | Renderizar a coluna Final |
| `frontend/src/App.css` | update | Destacar o cabeçalho e os valores finais |
