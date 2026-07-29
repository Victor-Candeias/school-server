---
maestru: "0.4"
type: work-item
id: BUG-56
title: Configurar cores dos popups de aviso
created: 2026-07-29
priority: medium
status: done
track: bug-fixes
specs: [bug-56-spec]
completed: 2026-07-29
---

# BUG-56: Configurar cores dos popups de aviso

## Problema

As cores dos popups de sucesso estão fixas no CSS e não podem ser adaptadas
pelas configurações da aplicação.

## Critérios de aceitação

- As configurações permitem escolher a cor de fundo e a cor do texto dos popups.
- As cores apresentam uma pré-visualização antes de gravar.
- As escolhas são persistidas nas configurações globais.
- Dashboard, toasts de sucesso e feedback de autenticação usam as cores gravadas.
- Instalações existentes mantêm o fundo verde e o texto branco como padrão.
