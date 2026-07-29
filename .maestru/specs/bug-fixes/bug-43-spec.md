---
maestru: "0.4"
type: work-spec
id: bug-43-spec
title: "BUG-43 Plano do seletor de tema na top bar"
template: implementation-plan-v1
work-item: bug-fixes/BUG-43
owner: developer
created: 2026-07-28
---

# BUG-43 Plano do seletor de tema na top bar

## Overview

Retirar o seletor de tema da secção de configurações e colocá-lo na top bar,
imediatamente após o email do utilizador, mantendo a persistência existente em
`localStorage`.

## Implementation

1. Acrescentar estado e callback de tema às propriedades da top bar.
2. Renderizar o botão entre o email e o acesso às configurações.
3. Remover o seletor da secção e os campos de tema do respetivo contexto.
4. Substituir os estilos específicos da secção por estilos responsivos da top
   bar, incluindo dark mode.
5. Validar lint, build, frontend em execução e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/components/layout/DashboardTopbar.tsx` | Modify | Mostrar o seletor junto ao email |
| `frontend/src/pages/DashboardPage.tsx` | Modify | Fornecer estado e callback de tema |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Remover o seletor da secção |
| `frontend/src/context/appSettingsContextValue.ts` | Modify | Remover campos de tema não usados |
| `frontend/src/context/AppSettingsContext.tsx` | Modify | Deixar de fornecer campos de tema |
| `frontend/src/App.css` | Modify | Estilizar o seletor na top bar |
