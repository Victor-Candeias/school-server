---
maestru: "0.4"
type: work-spec
id: bug-51-spec
title: "BUG-51 Plano de regresso das configurações"
template: implementation-plan-v1
work-item: bug-fixes/BUG-51
owner: developer
created: 2026-07-29
---

# BUG-51 Plano de regresso das configurações

## Overview

Guardar a secção ativa imediatamente antes da entrada nas configurações e
expor uma ação própria para fechar o ecrã, sem reutilizar a ação que navega
sempre para as escolas.

## Implementation

1. Manter a última secção não `settings` numa referência do hook de
   configurações.
2. Atualizar essa referência apenas quando a entrada nas configurações for
   autorizada.
3. Criar `closeSettingsDashboard` para restaurar a secção guardada.
4. Expor a ação através do contexto e ligá-la ao botão
   `Fechar configurações`.
5. Validar lint, build e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/useAppSettings.ts` | Modify | Memorizar e restaurar a secção anterior |
| `frontend/src/hooks/applicationRuntime.ts` | Modify | Tipar a nova ação de fecho |
| `frontend/src/context/appSettingsContextValue.ts` | Modify | Expor a ação no contexto |
| `frontend/src/context/AppSettingsContext.tsx` | Modify | Fornecer a ação à secção |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Usar a ação no botão de fecho |
