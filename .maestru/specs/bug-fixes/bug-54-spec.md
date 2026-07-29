---
maestru: "0.4"
type: work-spec
id: bug-54-spec
title: "BUG-54 Plano de persistência da navegação"
template: implementation-plan-v1
work-item: bug-fixes/BUG-54
owner: developer
created: 2026-07-29
---

# BUG-54 Plano de persistência da navegação

## Overview

Persistir uma referência mínima da navegação no armazenamento local, associada
ao identificador do utilizador. Depois do login, restaurar a hierarquia apenas
quando as coleções de escolas, anos e turmas necessárias estiverem carregadas.

## Implementation

1. Criar utilitário tipado para validar, guardar e ler a posição por
   utilizador.
2. Expor uma ação de captura da posição no hook de autenticação.
3. Capturar a posição antes do logout manual e do logout por inatividade.
4. Após o login, aguardar os dados e resolver os identificadores guardados
   para os documentos atuais.
5. Restaurar a secção e o submenu dos alunos sem persistir dados sensíveis.
6. Validar lint, build e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/utils/navigationPersistence.ts` | Create | Persistir e validar a posição por utilizador |
| `frontend/src/hooks/useAuth.ts` | Modify | Capturar a posição no logout |
| `frontend/src/hooks/applicationRuntime.ts` | Modify | Tipar a ação de captura |
| `frontend/src/hooks/useSchoolApplication.ts` | Modify | Restaurar a posição após carregar dados |
