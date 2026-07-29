---
maestru: "0.4"
type: work-spec
id: bug-56-spec
title: "BUG-56 Plano das cores dos popups"
template: implementation-plan-v1
work-item: bug-fixes/BUG-56
owner: developer
created: 2026-07-29
---

# BUG-56 Plano das cores dos popups

## Overview

Adicionar duas propriedades às configurações globais para controlar a cor de
fundo e a cor do texto dos popups de sucesso. Os valores atuais serão usados
como padrão para preservar o comportamento existente.

## Implementation

1. Acrescentar valores padrão e normalização de cores hexadecimais à API de
   configurações.
2. Integrar as propriedades no tipo, estado, normalização, gravação e deteção de
   alterações do frontend.
3. Expor dois seletores de cor com pré-visualização na página de configurações.
4. Aplicar as cores através de propriedades CSS globais aos avisos de sucesso.
5. Validar a normalização no backend e executar os gates do projeto.

## Impacted Files

| File | Action | Purpose |
|------|--------|---------|
| `school/routes/class_tests_router.py` | Modify | Persistir e normalizar as novas cores |
| `school/tests/test_class_tests_settings.py` | Modify | Testar a normalização de cores |
| `frontend/src/api/school.ts` | Modify | Tipar as novas configurações |
| `frontend/src/hooks/*` | Modify | Manter, carregar, gravar e aplicar as cores |
| `frontend/src/context/*` | Modify | Disponibilizar os controlos na página |
| `frontend/src/pages/sections/SettingsSection.tsx` | Modify | Mostrar seletores e pré-visualização |
| `frontend/src/App.css` | Modify | Consumir as propriedades CSS dos popups |
