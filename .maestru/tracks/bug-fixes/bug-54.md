---
maestru: "0.4"
type: work-item
id: BUG-54
title: Restaurar navegação após novo login
created: 2026-07-29
priority: high
status: done
track: bug-fixes
specs: [bug-54-spec]
completed: 2026-07-29
---

# BUG-54: Restaurar navegação após novo login

Guardar a posição atual quando o utilizador termina a sessão e restaurá-la no
login seguinte do mesmo utilizador.

## Acceptance Criteria

- O logout manual e o logout por inatividade guardam a posição atual.
- A posição é guardada separadamente por utilizador.
- Após o login, a aplicação restaura a secção, escola, ano, turma e submenu de
  alunos quando as entidades ainda existem.
- A restauração aguarda o carregamento assíncrono dos dados necessários.
- Se a posição não puder ser restaurada, a aplicação permanece no dashboard
  de escolas.
- Não são persistidas passwords nem dados de autenticação.
