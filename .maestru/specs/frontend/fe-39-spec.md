---
maestru: "0.4"
type: work-spec
id: fe-39-spec
title: "FE-39 Plano de cores por tipo de momento"
template: implementation-plan-v1
work-item: frontend/FE-39
owner: developer
created: 2026-08-03
---

# FE-39 Plano de cores por tipo de momento

## Overview
Permitir configurar, nas definições dos templates/tipos de momentos de avaliação, as cores usadas nos grupos da grelha de Avaliações por semestre. A imagem `Documents/ConfigurarCores.jpg` mostra grupos por tipo com fundo, média e ponderação em tons distintos; esses valores passam a vir da configuração do tipo, mantendo a paleta atual como fallback.

## Implementation
- Alargar o modelo `EvaluationMomentTemplate` com `backgroundColor`, `averageBackgroundColor`, `weightedBackgroundColor` e `textColor`.
- Normalizar e persistir esses campos no frontend e no backend, usando cores padrão por índice quando configurações antigas ainda não têm cores.
- Expor inputs de cor na secção "Templates de momentos de avaliação" e aplicar as variáveis CSS resultantes à grelha desktop e mobile de Avaliações por semestre.
- Atualizar testes de normalização das configurações para cobrir as novas cores.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/types/index.ts` | Update | Adicionar campos de cor aos templates de momentos. |
| `frontend/src/utils/constants.ts` | Update | Centralizar paleta padrão compatível com a imagem. |
| `frontend/src/hooks/useAppSettings.ts` | Update | Normalizar, criar e atualizar cores configuráveis. |
| `frontend/src/pages/sections/SettingsSection.tsx` | Update | Mostrar inputs e preview das cores por tipo. |
| `frontend/src/pages/sections/SemesterAssessments.tsx` | Update | Aplicar as cores configuradas por grupo/tipo. |
| `frontend/src/styles/settings.css` | Update | Ajustar layout da tabela de templates. |
| `frontend/src/styles/responsive.css` | Update | Ajustar layout mobile da tabela de templates. |
| `school/routes/class_tests_router.py` | Update | Persistir e normalizar as cores no endpoint de configurações. |
| `school/tests/test_class_tests_settings.py` | Update | Atualizar expectativas da normalização. |
