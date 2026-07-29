---
maestru: "0.4"
type: work-item
id: BUG-51
title: Regressar ao menu anterior ao fechar configurações
created: 2026-07-29
priority: medium
status: done
track: bug-fixes
specs: [bug-51-spec]
completed: 2026-07-29
---

# BUG-51: Regressar ao menu anterior ao fechar configurações

Ao abrir as configurações, a aplicação deve memorizar a secção atual. Quando
não existirem alterações pendentes, `Fechar configurações` deve regressar
exatamente a essa secção, mantendo a escola, o ano, a turma e o submenu de
alunos já selecionados.

## Acceptance Criteria

- Abrir as configurações memoriza a secção atual do dashboard.
- Fechar as configurações regressa à secção memorizada.
- O contexto de seleção da secção anterior permanece inalterado.
- O bloqueio de alterações pendentes na avaliação continua ativo.
