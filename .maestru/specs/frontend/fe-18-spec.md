---
maestru: "0.4"
type: work-spec
id: fe-18-spec
title: "FE-18 Dashboard alunos por momento de avaliação"
template: implementation-plan-v1
work-item: frontend/FE-18
owner: victor
created: 2026-06-26
---

# FE-18 Dashboard alunos por momento de avaliação

## Overview

Adicionar a opção lateral "Alunos/M.Avaliação" ao dashboard da turma. A opção permite selecionar um momento de avaliação e preencher uma grelha de valores por aluno e questão, gravando cada célula quando perde foco ou quando o utilizador prime Enter.

## Implementation

1. Expor endpoints no serviço `school` para listar e fazer upsert dos valores de aluno por momento/questão.
2. Adicionar métodos no cliente frontend para carregar e guardar esses valores.
3. Guardar cada valor como documento independente associado a user, escola, ano, turma, momento, aluno e questão.
4. Renderizar a opção 3 com descrição, combobox de momentos, grelha dinâmica por questões e coluna total.
5. Fazer gravação imediata por célula em `blur` ou `Enter`, com atualização otimista do estado local.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `school/routes/class_tests_router.py` | update | Endpoints de listagem/upsert de valores por aluno/momento/questão |
| `frontend/src/api/school.ts` | update | Métodos de API para valores da grelha |
| `frontend/src/App.tsx` | update | Nova opção lateral, seleção do momento, tabela editável e persistência imediata |
| `frontend/src/App.css` | update | Estilos da grelha Alunos/M.Avaliação |
