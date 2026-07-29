---
maestru: "0.4"
type: work-spec
id: fe-08-spec
title: "FE-08 Plano de templates de momentos de avaliação"
template: implementation-plan-v1
work-item: frontend/FE-08
owner: developer
created: 2026-07-29
---

# FE-08 Plano de templates de momentos de avaliação

## Overview

Estender as configurações globais com uma coleção normalizada de templates de
momentos de avaliação e fornecer uma interface editável antes das regras de
cores.

## Implementation

1. Definir o tipo, o estado inicial e as operações de adicionar, editar e
   remover templates.
2. Incluir os templates na normalização, impressão digital e payload das
   configurações.
3. Expor o estado e as ações através do contexto de configurações.
4. Criar a secção responsiva com tipo, ponderação e ação de remoção.
5. Normalizar e persistir os templates na API, garantindo ponderações entre
   0 e 100.
6. Adicionar testes unitários para a normalização do backend.
7. Validar testes, lint, build e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `school/routes/class_tests_router.py` | Modify | Normalizar e persistir os templates |
| `school/tests/test_class_tests_settings.py` | Create | Testar a normalização |
| `frontend/src/api/school.ts` | Modify | Tipar os templates no contrato da API |
| `frontend/src/types/index.ts` | Modify | Definir o modelo usado pela interface |
| `frontend/src/utils/constants.ts` | Modify | Definir o valor inicial |
| `frontend/src/hooks/useApplicationState.ts` | Modify | Manter os templates no estado |
| `frontend/src/hooks/applicationRuntime.ts` | Modify | Tipar estado e ações |
| `frontend/src/hooks/useAppSettings.ts` | Modify | Normalizar, editar e gravar templates |
| `frontend/src/context/appSettingsContextValue.ts` | Modify | Expor estado e ações |
| `frontend/src/context/AppSettingsContext.tsx` | Modify | Fornecer estado e ações |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Renderizar a secção antes das cores |
| `frontend/src/App.css` | Modify | Estilizar desktop e mobile |
