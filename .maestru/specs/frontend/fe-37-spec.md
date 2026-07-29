---
maestru: "0.4"
type: work-spec
id: fe-37-spec
title: "FE-37 Médias e ponderações das avaliações"
template: implementation-plan-v1
work-item: frontend/FE-37
owner: victor
created: 2026-07-29
---

# FE-37 Médias e ponderações das avaliações

## Overview

Acrescentar ao grupo de cada tipo de momento de avaliação as colunas "Média" e
"M*ponderação". A média é calculada sobre os valores dos momentos do grupo e o
resultado ponderado aplica a percentagem guardada no template. Todos os valores
numéricos da tabela ficam centrados.

## Implementation

1. Associar a ponderação do template a cada grupo de momentos de avaliação.
2. Calcular a média aritmética por aluno e o valor ponderado com
   `média × ponderação / 100`.
3. Substituir a antiga coluna de soma pelas colunas "Média" e
   "M*<ponderação>%".
4. Aplicar a mesma estrutura às linhas gravadas e ao relatório do semestre.
5. Centrar os valores numéricos e destacar as colunas calculadas.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/applicationRuntime.ts` | update | Tipar ponderação e ações de média/valor ponderado |
| `frontend/src/hooks/useAssessments.ts` | update | Calcular e formatar média e ponderação |
| `frontend/src/hooks/useEvaluations.ts` | update | Expor as novas ações no modelo |
| `frontend/src/pages/sections/SemesterAssessments.tsx` | update | Renderizar as novas colunas |
| `frontend/src/App.css` | update | Centrar valores e destacar cálculos |
