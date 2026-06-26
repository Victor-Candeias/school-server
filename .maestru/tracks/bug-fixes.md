---
maestru: "0.4"
type: work-track
id: bug-fixes
title: "Bug Fixes & Code Corrections"
created: 2026-06-24
description: Correcções de bugs críticos e melhorias identificadas na análise do projeto school-server
owner: victor
---

# bug-fixes: Bug Fixes & Code Corrections

## Summary

<!-- maestru:work-items-list -->
| ID | Title | Status | Created | Owner | Priority | Completed | Template | Spec |
|---|---|---|---|---|---|---|---|---|
| BUG-01 | [CRÍTICO] datetime.timezone.utc AttributeError em create_token() | done | 2026-06-24 | victor | critical | 2026-06-24 |  |  |
| BUG-02 | [CRÍTICO] verificar_token_cookie() sem parametro self na classe Utils | done | 2026-06-24 | victor | critical | 2026-06-24 |  |  |
| BUG-03 | [CRÍTICO] GET endpoints em class_tests_router chamam add_document em vez de get_documents | done | 2026-06-24 | victor | critical | 2026-06-24 |  |  |
| BUG-04 | [CRÍTICO] Funcao duplicada find_moments_class em class_tests_router | done | 2026-06-24 | victor | critical | 2026-06-24 |  |  |
| BUG-05 | [CRÍTICO] get_next_id() chama .sort() e .limit() sobre uma lista Python | done | 2026-06-24 | victor | critical | 2026-06-24 |  |  |
| BUG-06 | [MÉDIO] jwt.decode algorithms deve ser lista em verificar_token_cookie() | done | 2026-06-24 | victor | high | 2026-06-24 |  |  |
| BUG-07 | [MÉDIO] BD_BASE_URL e ENCRYPTION_KEY sem valores default em school/config.py | done | 2026-06-24 | victor | high | 2026-06-24 |  |  |
| BUG-08 | [MÉDIO] F-strings com aspas duplas aninhadas incompativel com Python < 3.12 | done | 2026-06-24 | victor | high | 2026-06-24 |  |  |
| BUG-09 | [MÉDIO] GET /list chama request.json() sem try/except - falha sem body | done | 2026-06-24 | victor | high | 2026-06-24 |  |  |
| BUG-10 | [MÉDIO] Variavel payload potencialmente nao inicializada em get_users() | done | 2026-06-24 | victor | high | 2026-06-24 |  |  |
| BUG-11 | [MENOR] setup_logging() nunca e chamado no startup do db_service | done | 2026-06-24 | victor | medium | 2026-06-24 |  |  |
| BUG-12 | [MENOR] Endpoint /delete usa POST em vez de DELETE (auth service) | done | 2026-06-24 | victor | low | 2026-06-24 |  |  |
| BUG-13 | [MENOR] Flag id sempre False em get_users - logica find_by_id nunca executada | done | 2026-06-24 | victor | low | 2026-06-24 |  |  |
<!-- /maestru:work-items-list -->
