---
maestru: "0.4"
type: work-spec
id: fe-29-spec
title: "FE-29 Dashboard avaliações por semestre"
template: implementation-plan-v1
work-item: frontend/FE-29
owner: victor
created: 2026-06-27
---

# FE-29 Dashboard avaliações por semestre

## Overview

Adicionar à opção lateral "Avaliações" um dashboard central por semestre. O utilizador escolhe 1.º ou 2.º semestre, vê uma tabela com alunos nas linhas e testes nas colunas, com cada célula preenchida pelo total do aluno nesse teste.

## Implementation

1. Guardar o semestre no momento de avaliação para permitir filtrar testes por semestre.
2. Calcular os totais por aluno/teste a partir dos valores já gravados em `studentstestmoments`.
3. Adicionar ações de relatório e gravação para a tabela de avaliações do semestre.
4. Persistir o resumo do semestre numa coleção própria para consultas futuras.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/App.tsx` | update | Renderizar dashboard Avaliações, seleção de semestre, cálculo de totais, relatório e gravação |
| `frontend/src/App.css` | update | Estilos da grelha de avaliações por semestre |
| `frontend/src/api/school.ts` | update | Cliente para gravar resumo de avaliações do semestre |
| `school/routes/class_tests_router.py` | update | Endpoint para upsert do resumo de avaliações |
| `school/utils/config.py` | update | Nome da coleção de resumos de avaliações |
