---
maestru: "0.4"
type: work-item
id: BUG-55
title: Restaurar confirmação ao fechar configurações
created: 2026-07-29
owner: developer
priority: high
status: done
track: bug-fixes
specs: [bug-55-spec]
completed: 2026-07-29
branch: bug-55-restore-settings-confirmation
---

# BUG-55: Restaurar confirmação ao fechar configurações

O refactor modular do frontend removeu o diálogo apresentado quando o
utilizador tenta fechar as configurações com alterações pendentes. Restaurar o
fluxo sem alterar os comportamentos já recuperados em `origin/main`.

## Acceptance Criteria

- Sem alterações, o botão verde `Fechar configurações` regressa ao dashboard
  anterior.
- Com alterações, o botão vermelho `Gravar configurações` abre um diálogo.
- O diálogo apresenta `Gravar e sair`, `Sair sem gravar` e `Cancelar`.
- `Gravar e sair` só fecha depois de a API responder com sucesso.
- `Sair sem gravar` repõe todos os últimos valores persistidos.
- `Cancelar` mantém o formulário e as alterações no ecrã.
- O diálogo é acessível e utilizável em desktop e mobile.
