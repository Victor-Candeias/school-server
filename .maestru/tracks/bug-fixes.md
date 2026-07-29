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
| BUG-14 | Adicionar botão para sair das configurações no frontend | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-15 | Adicionar máscara ao código postal no frontend | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-16 | Reduzir tamanho dos títulos dos cartões no frontend | done | 2026-06-26 |  | low | 2026-06-26 |  |  |
| BUG-17 | Associar dados escolares ao utilizador autenticado | done | 2026-06-26 |  | high | 2026-06-26 |  |  |
| BUG-18 | Ajustar largura dos campos na modal de aluno | done | 2026-06-26 |  | low | 2026-06-26 |  |  |
| BUG-19 | Adicionar edição de turma e dashboard de alunos | done | 2026-06-26 |  | high | 2026-06-26 |  | [BUG-19](../specs/bug-fixes/bug-19-spec.md) |
| BUG-20 | Adicionar edição e desativação de alunos no dashboard | done | 2026-06-26 |  | high | 2026-06-26 |  | [BUG-20](../specs/bug-fixes/bug-20-spec.md) |
| BUG-21 | Corrigir menu de apagar ou desativar aluno | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-22 | Abrir novo aluno pelo menu lateral de alunos | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-23 | Corrigir edição de aluno e erro na modal | done | 2026-06-26 |  | high | 2026-06-26 |  |  |
| BUG-24 | Adicionar momentos de avaliação no menu de alunos | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-25 | Mover novo aluno para painel central | done | 2026-06-26 |  | medium | 2026-06-26 |  |  |
| BUG-26 | Ajustar painel de momentos de avaliação | done | 2026-06-26 |  | low | 2026-06-26 |  |  |
| BUG-27 | Corrigir erro 405 nos momentos de avaliação | done | 2026-06-26 |  | high | 2026-06-26 |  |  |
| BUG-28 | Corrigir persistência dos valores de avaliação | done | 2026-06-26 |  | critical | 2026-06-26 |  |  |
| BUG-29 | Ajustar botões do dashboard de alunos | done | 2026-06-27 |  | medium | 2026-06-27 |  |  |
| BUG-30 | Mostrar zero em células de avaliação vazias | done | 2026-06-27 |  | medium | 2026-06-27 |  |  |
| BUG-31 | Inicializar grelha de avaliação ao selecionar momento | done | 2026-06-27 |  | high | 2026-06-27 |  |  |
| BUG-32 | Gravar grelha de avaliação manualmente | done | 2026-06-27 |  | high | 2026-06-27 |  |  |
| BUG-33 | Corrigir gravação manual da grelha de avaliação | done | 2026-06-27 |  | critical | 2026-06-27 |  |  |
| BUG-34 | Gravar valores em studentstestmoments | done | 2026-06-27 |  | critical | 2026-06-27 |  |  |
| BUG-35 | Persistir temporizador de mensagens e cores de percentagem | done | 2026-06-27 |  | high | 2026-06-27 |  |  |
| BUG-36 | Nomear opção quatro como Avaliações | done | 2026-06-27 |  | low | 2026-06-27 |  |  |
| BUG-37 | Corrigir 404 da imagem de fundo no frontend | done | 2026-07-24 | developer | medium | 2026-07-24 |  |  |
| BUG-38 | Corrigir navegação hierárquica do menu principal | done | 2026-07-24 |  | medium | 2026-07-24 |  |  |
| BUG-39 | Corrigir estados cumulativos da navegação principal | done | 2026-07-24 |  | high | 2026-07-24 |  |  |
| BUG-40 | Corrigir toolbar e scroll do menu de alunos no mobile | done | 2026-07-24 |  | high | 2026-07-24 |  |  |
| BUG-41 | Atualizar PostCSS vulnerável usado pelo Vite | done | 2026-07-28 |  | high | 2026-07-28 |  |  |
| BUG-42 | Distinguir fechar e gravar configurações | done | 2026-07-28 |  | medium | 2026-07-28 |  | [BUG-42](../specs/bug-fixes/bug-42-spec.md) |
| BUG-43 | Mover seletor de tema para a top bar | done | 2026-07-28 |  | medium | 2026-07-28 |  | [BUG-43](../specs/bug-fixes/bug-43-spec.md) |
| BUG-44 | Adicionar menu hambúrguer à top bar mobile | done | 2026-07-28 |  | high | 2026-07-28 |  |  |
| BUG-45 | Ajustar ações mobile e identidade visual do frontend | done | 2026-07-28 |  | medium | 2026-07-28 |  | [BUG-45](../specs/bug-fixes/bug-45-spec.md) |
| BUG-46 | Corrigir scroll vertical dos dashboards no mobile | done | 2026-07-28 |  | high | 2026-07-28 |  |  |
| BUG-47 | Reorganizar informação dos alunos no mobile | done | 2026-07-28 |  | medium | 2026-07-28 |  |  |
| BUG-48 | Reorganizar momentos de avaliação no mobile | done | 2026-07-28 |  | medium | 2026-07-28 |  |  |
| BUG-49 | Adaptar Alunos M.Avaliação ao mobile | done | 2026-07-28 |  | high | 2026-07-28 |  |  |
| BUG-50 | Usar texto branco nos popups de sucesso | done | 2026-07-28 |  | low | 2026-07-28 |  |  |
| BUG-51 | Regressar ao menu anterior ao fechar configurações | done | 2026-07-29 |  | medium | 2026-07-29 |  | [BUG-51](../specs/bug-fixes/bug-51-spec.md) |
| BUG-52 | Reorganizar grelha de M.Avaliação no mobile | done | 2026-07-29 |  | medium | 2026-07-29 |  |  |
| BUG-53 | Adaptar calendário dos alunos ao mobile | done | 2026-07-29 |  | high | 2026-07-29 |  |  |
| BUG-54 | Restaurar navegação após novo login | done | 2026-07-29 |  | high | 2026-07-29 |  | [BUG-54](../specs/bug-fixes/bug-54-spec.md) |
| BUG-55 | Restaurar confirmação ao fechar configurações | done | 2026-07-29 | developer | high | 2026-07-29 |  | [BUG-55](../specs/bug-fixes/bug-55-spec.md) |
| BUG-56 | Configurar cores dos popups de aviso | done | 2026-07-29 |  | medium | 2026-07-29 |  | [BUG-56](../specs/bug-fixes/bug-56-spec.md) |
<!-- /maestru:work-items-list -->
