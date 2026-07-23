---
maestru: "0.4"
type: work-spec
id: fe-05-spec
title: "Plano de Implementação: Gestão de Anos Letivos"
template: implementation-plan-v1
work-item: frontend/FE-05
owner: victor
created: 2026-07-23
---

# Plano de Implementação: Gestão de Anos Letivos

## Overview

A secção "Anos Letivos" já permite listar, criar e editar anos letivos (`frontend/src/App.tsx`, `school/routes/years_routes.py`). Falta a funcionalidade de eliminar um ano letivo, seguindo o padrão já usado para outras entidades (`students`, `class_tests`). Este spec cobre a adição do endpoint de remoção e da ação correspondente na UI, incluindo confirmação e tratamento de erro quando o ano tem turmas associadas.

## Implementation

1. Adicionar endpoint `DELETE /years/delete` em `school/routes/years_routes.py`, seguindo o padrão de `students_routes.py`/`class_tests_router.py` (usa `api_client.delete`, valida `deleted_count`).
2. Adicionar método `deleteYear(id)` em `frontend/src/api/school.ts` que chama o novo endpoint.
3. Adicionar botão "Eliminar" no cartão de cada ano letivo na secção "Anos Letivos" (`frontend/src/App.tsx`), com diálogo/confirmação antes de remover.
4. Após eliminação bem-sucedida, remover o ano da lista local e recarregar a lista de anos; mostrar `yearsError` em caso de falha (ex.: ano com turmas associadas).
5. (Opcional/avaliar) Impedir eliminação de anos com turmas associadas, validando no backend antes de apagar ou devolvendo mensagem de erro clara.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `school/routes/years_routes.py` | update | Novo endpoint `DELETE /years/delete` |
| `frontend/src/api/school.ts` | update | Método `deleteYear` no cliente da API |
| `frontend/src/App.tsx` | update | Botão/confirmação de eliminação na secção Anos Letivos e tratamento de erro |
