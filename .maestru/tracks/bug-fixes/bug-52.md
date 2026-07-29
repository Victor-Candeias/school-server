---
maestru: "0.4"
type: work-item
id: BUG-52
title: Reorganizar grelha de M.Avaliação no mobile
created: 2026-07-29
priority: medium
status: done
track: bug-fixes
completed: 2026-07-29
---

# BUG-52: Reorganizar grelha de M.Avaliação no mobile

No menu `Alunos / M.Avaliação`, cada aluno deve ser apresentado em mobile com
o nome numa linha própria, os dois totais na linha seguinte e as questões
distribuídas três por linha.

## Acceptance Criteria

- `Nome do aluno` ocupa toda a primeira linha.
- `Total` e `Total (%)` partilham a segunda linha.
- As questões aparecem três por linha e continuam automaticamente nas linhas
  seguintes.
- Cada questão mantém o respetivo valor máximo e o campo de introdução.
- O layout desktop permanece inalterado.
