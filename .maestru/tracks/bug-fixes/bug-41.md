---
maestru: "0.4"
type: work-item
id: BUG-41
title: Atualizar PostCSS vulnerável usado pelo Vite
created: 2026-07-28
priority: high
status: done
track: bug-fixes
completed: 2026-07-28
---

# BUG-41: Atualizar PostCSS vulnerável usado pelo Vite

Atualizar a dependência transitiva PostCSS usada pelo Vite para uma versão que
corrija o path traversal descrito em `GHSA-r28c-9q8g-f849`.

## Acceptance Criteria

- PostCSS deixa de estar numa versão afetada (`<=8.5.17`).
- `npm audit` não reporta vulnerabilidades.
- O lint e o build de produção do frontend continuam a passar.
