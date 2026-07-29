---
maestru: "0.4"
type: work-spec
id: bug-42-spec
title: "BUG-42 Plano do botão de configurações"
template: implementation-plan-v1
work-item: bug-fixes/BUG-42
owner: developer
created: 2026-07-28
---

# BUG-42 Plano do botão de configurações

## Overview

Transformar o botão principal das configurações num indicador de alterações
pendentes. Sem alterações, fecha o ecrã e usa fundo verde; com alterações,
grava os valores e usa fundo vermelho.

## Implementation

1. Guardar uma impressão digital das últimas configurações carregadas ou
   gravadas com sucesso.
2. Comparar o estado atual com essa referência para detetar alterações,
   mantendo o estado pendente quando a gravação falhar.
3. Expor a deteção e a ação de regresso às escolas através do contexto.
4. Alterar texto, tipo, ação e classe visual do botão conforme o estado.
5. Validar lint, build e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/useApplicationState.ts` | Modify | Guardar a referência das configurações persistidas |
| `frontend/src/hooks/applicationRuntime.ts` | Modify | Tipar o novo estado e ação |
| `frontend/src/hooks/useAppSettings.ts` | Modify | Normalizar, comparar e atualizar a referência |
| `frontend/src/context/appSettingsContextValue.ts` | Modify | Expor ações à secção |
| `frontend/src/context/AppSettingsContext.tsx` | Modify | Fornecer ações pelo contexto |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Alternar texto, ação e cor |
| `frontend/src/App.css` | Modify | Estilos verde e vermelho |
