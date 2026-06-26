# Auditoria de Segurança — MEDSPACE

**Data:** 2026-06-26
**Tipo:** Static secure-code review autorizado (advisory) sobre o próprio repositório.
**Metodologia:** [0xSteph/pentest-ai-agents](https://github.com/0xSteph/pentest-ai-agents) — agentes
`code-auditor`, `api-security`, `database-attacker`, `bizlogic-hunter`, `crypto-analyzer`.

## Resumo
Postura geral forte. Não foram encontrados SQLi, IDOR/BOLA exploráveis, XSS com sink real,
nem exposição de credenciais. Os achados sérios eram de **lógica de moderação** e
**falha silenciosa de rate-limit**. Todos os itens abaixo foram corrigidos nesta data.

> ⚠️ **Mudança de comportamento importante:** anúncios de clínica agora entram na **fila de
> revisão (PENDING)** ao serem criados/enviados — não vão mais ao ar automaticamente. Além
> disso, **editar um anúncio já publicado o devolve para revisão**. Anúncios que já estavam
> publicados antes desta data **não foram alterados** e continuam no ar até serem editados.

## Correções aplicadas

| ID | Severidade | Achado | Correção |
|----|-----------|--------|----------|
| C1 | Crítico | Anúncios de clínica publicavam sem moderação (`createListing`/`publishListing` setavam `PUBLISHED`) | Passam a entrar como `PENDING`; só o admin publica. Igual a aparelhos/educação. |
| H1 | Alto | `blockClinic` não bloqueava (update no-op, sem flag) | Coluna `User.blockedAt`; login negado e guard de escrita `getActiveClinicSession()` rejeita sessão atual; ação `unblockClinic` + botão na UID admin. |
| H2 | Alto | Rate-limit falhava aberto silenciosamente sem Upstash | Opt-in `RATE_LIMIT_FAIL_CLOSED=true` faz limiters críticos (login/senha/registro/reset) negarem quando o Redis está indisponível; warning mais explícito. |
| H3 | Alto | Edição pós-aprovação não voltava à revisão (bait-and-switch) | Edição do dono em anúncio `PUBLISHED` reseta para `PENDING` + limpa `reviewedAt` (anúncios, aparelhos, educação e `PUT /api/anuncios/[id]`). Admin permanece confiável. |
| M2 | Médio | `/api/me/export` sem rate limit | `rateLimit(RATE_LIMITS.export, userId)` (5/h). |
| M3 | Médio | `findMany` admin sem paginação (payload ilimitado) | Cap de 200 por página + `?page`/`?limit` em `/api/admin/anuncios` e `/api/admin/clinicas`. |
| M4 | Médio | `setListingStatus` aceitava status arbitrário | Allowlist de enum antes do update. |
| M5 | Médio | Reset de senha apagava token válido em uso (denial-of-reset) | Só remove tokens **expirados**; tokens válidos coexistem (uso único, 1h). |
| M7 | Médio | Ações destrutivas sem rate limit | `rateLimit(RATE_LIMITS.destructive)` em `deleteAccount`. |
| L1 | Baixo | Timing oracle no login (e-mail inexistente) | `compare` contra hash dummy no caminho sem usuário. |
| L2 | Baixo | `changePassword` não revogava tokens de reset | `deleteMany` dos tokens do usuário na troca. |
| L3 | Baixo | Filtro `condition` de aparelhos sem allowlist (500) | Allowlist `NOVO/SEMINOVO/USADO`. |

## Itens NÃO corrigidos (recomendações — exigem decisão/infra)

- **M1 — CSP com `'unsafe-inline'` em `script-src`.** Migrar para CSP por nonce (via middleware)
  é defesa-em-profundidade, mas há risco de quebrar scripts inline/terceiros em produção e
  hoje **não existe sink de XSS** no código (zero `dangerouslySetInnerHTML`/`eval`). Deixado como
  recomendação a aplicar com teste em staging.
- **M6 — Bucket Supabase `listings` público + headers de serve.** É configuração de
  infraestrutura (Supabase Storage), não do código. Mitigado pela validação por magic-byte que
  rejeita SVG/HTML no upload. Recomenda-se `nosniff`/signed URLs no Storage.
- **H4 — Segredos no `.env`.** O arquivo é gitignored (não vazou no repo), mas contém chaves
  reais (service-role, AUTH_SECRET, senha do DB). **Rotacionar** se forem os valores de produção
  e mantê-los apenas nas env vars da Vercel.

## Ações operacionais recomendadas
1. Provisionar Upstash em produção e definir `RATE_LIMIT_FAIL_CLOSED=true`.
2. Rotacionar os segredos do `.env` (ver H4).
3. Revisar no painel admin os anúncios de clínica que já estavam `PUBLISHED` antes desta data.

## Observação de infraestrutura
O projeto usa `prisma db push` (sem histórico de migrations). A tabela `password_reset_tokens`
**não existia** no banco — foi criada agora junto com a coluna `blocked_at` (mudanças aditivas,
sem perda de dados). Backup lógico completo salvo em `backups/` antes das alterações.
