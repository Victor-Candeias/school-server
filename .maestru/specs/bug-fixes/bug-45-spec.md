---
maestru: "0.4"
type: work-spec
id: bug-45-spec
title: "BUG-45 Plano de ações mobile e identidade visual"
template: implementation-plan-v1
work-item: bug-fixes/BUG-45
owner: developer
created: 2026-07-28
---

# BUG-45 Plano de ações mobile e identidade visual

## Overview

Melhorar a utilização mobile da top bar, atualizar a identidade apresentada
pelo browser e distinguir visualmente as ações de criação principais.

## Implementation

1. Manter tema e logout sempre visíveis no cabeçalho mobile, fora do menu
   hambúrguer, conservando as versões desktop na área de ações.
2. Alterar o título HTML para `School Management` e substituir o favicon padrão
   do Vite por um símbolo escolar simples.
3. Aplicar uma classe verde suave exclusivamente aos botões de criar escola,
   ano letivo, turma e aluno.
4. Validar lint, build, frontend em execução e Maestru.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/components/layout/DashboardTopbar.tsx` | Modify | Separar ações rápidas do menu mobile |
| `frontend/src/App.css` | Modify | Adaptar top bar e botões verdes |
| `frontend/index.html` | Modify | Atualizar título do browser |
| `frontend/public/favicon.svg` | Modify | Usar ícone relacionado com escolas |
| `frontend/src/pages/sections/SchoolsSection.tsx` | Modify | Identificar criação de escola |
| `frontend/src/pages/sections/AcademicYearsSection.tsx` | Modify | Identificar criação de ano |
| `frontend/src/pages/sections/ClassesSection.tsx` | Modify | Identificar criação de turma |
| `frontend/src/pages/sections/StudentsList.tsx` | Modify | Identificar criação de aluno |
