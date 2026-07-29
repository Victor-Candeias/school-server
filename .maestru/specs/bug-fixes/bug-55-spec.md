---
maestru: "0.4"
type: work-spec
id: bug-55-spec
title: "BUG-55 Plano de recuperação da confirmação"
template: implementation-plan-v1
work-item: bug-fixes/BUG-55
owner: developer
created: 2026-07-29
---

# BUG-55 Plano de recuperação da confirmação

## Overview

Recuperar o diálogo de confirmação existente antes do refactor `560ba4d` e
integrá-lo nos hooks, contexto e componentes da arquitetura modular.

## Implementation

1. Adicionar ao estado da aplicação a visibilidade do diálogo.
2. Tornar a gravação reutilizável e devolver sucesso ou falha.
3. Restaurar as ações de abrir, gravar e sair, descartar e cancelar.
4. Ligar o formulário de configurações à ação de confirmação.
5. Criar um componente acessível para o diálogo e restaurar os seus estilos.
6. Validar lint, build e o estado Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/hooks/useApplicationState.ts` | Modify | Guardar a visibilidade do diálogo |
| `frontend/src/hooks/applicationRuntime.ts` | Modify | Tipar o estado e as ações recuperadas |
| `frontend/src/hooks/useAppSettings.ts` | Modify | Controlar gravação, descarte e saída |
| `frontend/src/context/appSettingsContextValue.ts` | Modify | Expor a ação principal ao formulário |
| `frontend/src/context/AppSettingsContext.tsx` | Modify | Fornecer a ação pelo contexto |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Abrir a confirmação quando necessário |
| `frontend/src/components/modals/SettingsConfirmationModal.tsx` | Create | Apresentar as três decisões |
| `frontend/src/pages/DashboardPage.tsx` | Modify | Montar o diálogo global |
| `frontend/src/App.css` | Modify | Estilizar ações e estados do diálogo |
