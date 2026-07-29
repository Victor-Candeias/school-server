---
maestru: "0.4"
type: work-item
id: BUG-42
title: Distinguir fechar e gravar configurações
created: 2026-07-28
priority: medium
status: done
track: bug-fixes
specs: [bug-42-spec]
completed: 2026-07-28
---

# BUG-42: Distinguir fechar e gravar configurações

Sem alterações pendentes, o botão deve mostrar `Fechar configurações`, usar
fundo verde e regressar ao dashboard das escolas. Após qualquer alteração
persistível, deve mostrar `Gravar configurações`, usar fundo vermelho e guardar
os valores.

## Acceptance Criteria

- O estado inicial do botão é verde e fecha as configurações.
- Alterar qualquer campo persistível torna o botão vermelho.
- Uma gravação bem-sucedida devolve o botão ao estado verde.
- Uma gravação com erro mantém o estado vermelho.
