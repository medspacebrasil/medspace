# Relatório de UX — Mensagens de erro, confirmações e feedbacks

**Data:** 2026-07-29/30
**Método:** auditoria de código (6 áreas mapeadas em paralelo) + testes reais no browser contra o app rodando local (`npm run dev`, http://localhost:3000). Fluxos testados de ponta a ponta: cadastro (erros + sucesso), login (senha errada, senha curta), recuperação de senha, criação/edição/foto/exclusão de anúncio, moderação no admin (rejeitar + aprovar), perfil (salvar, trocar senha, exportar dados LGPD, excluir conta) e páginas públicas (busca, detalhe do anúncio, CTA WhatsApp).
Todos os dados de teste criados foram removidos ao final (conta `teste.ux.medspace@example.com` excluída via UI, admin temporário removido via script).

---

## Resumo executivo

O app tem uma base boa: erros por campo em português, valores preservados após falha (padrão `echoFormValues` funcionando), fluxo de recuperação de senha exemplar e direitos LGPD completos no perfil. Os problemas graves se concentram em **3 temas**:

1. **Mensagens que mentem para o anunciante** sobre o status do anúncio (diz "publicado" quando está pendente de moderação; diz "no ar" quando a edição tirou o anúncio do ar).
2. **Ações sem nenhum feedback ou confirmação** — especialmente todas as ações de 1 clique do admin (aprovar, rejeitar, bloquear clínica) e a exclusão de conta (sucesso silencioso).
3. **Três padrões de feedback concorrentes** (modal auto-dismiss, banner que nunca some, query param na URL) — não existe sistema de toast; cada tela inventou o seu.

---

## P0 — Corrigem percepção errada do usuário (fazer primeiro)

### 1. Banner pós-criação de anúncio mente sobre publicação
Ao criar um anúncio, o anunciante cai em `/painel/anuncios/[id]/editar?created=1` e vê o banner verde **"Anúncio publicado com sucesso! Já está visível no site para os médicos."** — mas o status real é **Pendente** (aguarda moderação do admin) e o botão **"Ver no site" leva a uma página 404** (testado: a página pública não existe enquanto pendente).
**Risco de negócio:** o anunciante acha que terminou, nunca descobre que faltava aprovação (e foto), e o anúncio nunca vai ao ar.
**Correção sugerida:** banner condicionado ao status: "Anúncio criado! Ele está **em análise pela nossa equipe** e será publicado em até X horas. Enquanto isso, adicione fotos — anúncios com fotos são aprovados mais rápido." Esconder/desabilitar "Ver no site" enquanto não publicado.
Arquivos: `src/app/painel/anuncios/[id]/editar/*` (banner `?created=1`) e `src/app/painel/anuncios/actions.ts` (createListing cria PENDING).

### 2. Botão "Publicar" visível quando não pode ser usado
Na edição de anúncio de sala com status Pendente, o botão "Publicar" aparece, e o clique devolve o erro técnico **"Apenas rascunhos ou anúncios rejeitados podem ser enviados para revisão"** (testado). Além disso a mensagem fica presa na tela (não expira nem tem botão de fechar).
O form de **aparelho** faz certo (só mostra o botão para DRAFT/REJECTED) — replicar a lógica. E o rótulo deveria ser "Enviar para revisão", não "Publicar" (a ação não publica, enfileira).
Arquivo: `EditListingClient` usa `!isPublished` em vez de checar DRAFT/REJECTED.

### 3. Botão "Criar anúncio" do modal de boas-vindas não faz nada
No modal "Cadastro realizado com sucesso!", o CTA primário **"Criar anúncio" apenas fecha o modal** — não navega para `/painel/anuncios/novo` (testado; os dois botões têm o mesmo `onClick={() => setOpen(false)}`).
Arquivo: [WelcomeModal.tsx:75-82](../src/components/WelcomeModal.tsx#L75).

### 4. Editar anúncio publicado o tira do ar sem avisar
`updateListing` devolve anúncios PUBLISHED para PENDING (re-moderação), mas o modal de sucesso diz que as alterações "já estão no ar". O anunciante edita um detalhe e **sai do ar sem saber**.
**Correção:** avisar antes de salvar ("Salvar enviará o anúncio para nova revisão e ele ficará fora do ar até ser aprovado") e ajustar a mensagem pós-salvar.
Mesma mensagem enganosa aparece no admin ao editar anúncios com status != PUBLISHED.

### 5. Rejeição de anúncio sem motivo, sem confirmação, sem notificação
No admin, "Rejeitar" executa **imediatamente** (testado): sem confirmação, sem campo de motivo, sem toast — e a clínica nunca fica sabendo por que foi rejeitada (nada aparece no painel dela além do badge "Rejeitado").
**Correção:** dialog com motivo obrigatório (ou pelo menos motivos pré-definidos) + exibir o motivo no painel do anunciante + e-mail opcional.

### 6. Conversões do Google Ads bloqueadas pelo CSP
O CSP em `next.config.ts` permite GA/GTM mas **bloqueia os domínios de conversão do Google Ads** — testado localmente, o console mostra bloqueio de `pagead2.googlesyndication.com`, `ad.doubleclick.net`, `googleads.g.doubleclick.net`, `www.google.com/ccm|rmkt` e `www.googleadservices.com`. Isso significa que **a conversão da campanha (AW-18151653017) provavelmente não está sendo registrada em produção**.
**Correção:** adicionar a `script-src`, `img-src` e `connect-src`: `https://*.googlesyndication.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com`.

### 7. Exclusão de conta bem-sucedida é silenciosa
Após "Excluir minha conta" (fluxo bom: pede senha, avisa irreversibilidade), o usuário é redirecionado para `/?conta-excluida=1` — mas **a home nunca lê esse parâmetro e nenhuma confirmação aparece** (testado). Para um ato tão grave, o silêncio gera dúvida ("funcionou?").
**Correção:** renderizar banner "Sua conta foi excluída definitivamente" quando `conta-excluida=1`; idealmente enviar e-mail de confirmação (prática LGPD).

---

## P1 — Feedback ausente ou inconsistente

### 8. Não existe sistema de toast; 3 padrões concorrentes
- Edição de anúncio de sala: `SaveStatusModal` (modal que **auto-fecha em 2,5s** — no teste real passou despercebido).
- Perfil: banner inline que **nunca expira** ("Perfil atualizado com sucesso!" fica para sempre na tela).
- Exclusões: query param na URL (`?excluido=1`) — some se recarregar sem o param, persiste se recarregar com ele.
- Aparelhos/educação: banner inline (diferente da tela irmã de salas).
**Correção:** adotar 1 padrão único (ex.: sonner/shadcn toast) e usar em todo feedback transiente. O `CONTEXT.md` de componentes menciona `toast.tsx` que não existe.

### 9. Erros de validação fora da viewport em forms longos
No form de novo anúncio, após submit com erro, o primeiro erro inline ("Cidade é obrigatória") ficou **423px acima da viewport** (medido). O modal "Erro ao salvar — Verifique os campos destacados" compensa em parte, mas ao fechá-lo o usuário precisa caçar os campos.
**Correção:** scroll até o primeiro campo com erro + foco nele ao fechar o modal. Vale para cadastro e forms do admin também.
Extra: "Cidade é obrigatória" renderiza fora do bloco do CEP, longe do campo.

### 10. Login: uma única mensagem para 4 situações diferentes
"Email ou senha incorretos" é exibida para: senha errada, **senha < 8 caracteres** (o schema falha antes de checar credenciais — testado), **rate limit estourado** e **conta bloqueada pelo admin**. Usuário legítimo bloqueado ou rate-limitado recebe diagnóstico falso e continua tentando (consumindo mais rate limit).
**Correção:** validar minLength=8 no cliente; mensagem própria para rate limit ("Muitas tentativas. Aguarde X minutos.") — anti-enumeração não exige esconder o rate limit.

### 11. "Conta criada!" renderizada como erro
Se o auto-login falha após o cadastro, a mensagem **"Conta criada! Faça login para continuar."** aparece na caixa vermelha de erro (`errors._form`) e sem link para `/login`.

### 12. Admin: ações de 1 clique sem confirmação nem feedback
Aprovar, rejeitar, arquivar, destacar, marcar revisado: nenhuma pede confirmação e nenhuma dá feedback de sucesso (só o badge muda — testado). Pior caso: **"Bloquear clínica" arquiva todos os anúncios e nega o login da clínica em 1 clique sem confirmação**; "Excluir clínica" apaga o usuário inteiro mas o confirm só fala da clínica. Erros dessas ações usam `throw` → derrubam a página no error boundary genérico.

### 13. Upload de fotos: erros em inglês e usabilidade
- Erros da API vazam em inglês: "Upload failed", "Forbidden", "Unauthorized", "Internal server error".
- Upload de 1 em 1 (sem `multiple`), sem barra de progresso, sem drag-and-drop (o CONTEXT.md promete reordenação que não existe).
- Botões capa/remover só aparecem no hover — invisíveis no mobile/touch.
- Fotos salvam fora do submit — usuário pode achar que "Salvar Alterações" inclui as fotos.
- Ponto positivo (testado): arquivo inválido dá mensagem clara em PT ("Formato não aceito. Envie um arquivo JPEG, PNG ou WebP.").

### 14. Aparelhos e educação: status cru e feedback desigual
- Badge de status mostra o enum em inglês: "PENDING", "DRAFT" (tela de sala traduz, a de aparelho não).
- Criar aparelho não dá nenhum feedback de sucesso (sala e educação redirecionam com `?created=1`).
- `updateEducationSchema` é o único schema sem mensagens PT-BR — erros do Zod vazam em inglês.

### 15. `window.confirm` nativo para ações destrutivas
Excluir anúncio (painel e admin) e remover foto usam `confirm()` do browser — sem estilo, inconsistente com os modais do design system. Trocar por AlertDialog (shadcn) com o nome do item.

### 16. Página pública de anúncio não é revalidada
`revalidatePath("/anuncios")` cobre a listagem mas **não** `/anuncios/[slug]` — testado: após excluir a conta, a página pública do anúncio continuou no ar por um tempo (cache). Em produção, anúncio excluído/despublicado pode continuar acessível — inclusive relevante para LGPD.
**Correção:** `revalidatePath(\`/anuncios/\${slug}\`)` nas actions de moderação/edição/exclusão.

### 17. Redirecionamentos e páginas de erro
- Middleware redireciona não-logado para `/login` sem mensagem nem `callbackUrl` — o usuário perde a página que queria e não sabe por quê.
- 404 sem navegação do site nem CTA para `/anuncios` (beco sem saída).
- Sem `global-error.tsx` (erro no layout raiz mostra tela default do Next em inglês); único `error.tsx` na raiz — qualquer throw derruba a página inteira; `error.digest` não é exibido (impossível correlacionar com logs).
- Rate limit: `retryAfter` é calculado mas nunca mostrado ("mais tarde" é vago).

---

## P2 — Polimento de copy e detalhes

| # | Onde | Problema | Sugestão |
|---|------|----------|----------|
| 18 | Painel | "1 fotos", "1 especialidades" | Singular/plural ("1 foto") |
| 19 | /login | "Não tem conta? **Cadastre sua clínica**" | "Cadastre-se" (o cadastro atende médico, empresa, instituição) |
| 20 | /painel/perfil | Médico PF vê "Atualize os dados da **sua clínica**", "Nome da Clínica" | Adaptar labels ao `advertiserType` (como o /cadastro já faz) |
| 21 | Painel | Modal de migração de recursos é **bloqueante** e aparece para usuário recém-cadastrado (sem anúncios antigos) | Exibir só para contas criadas antes da migração; não bloquear |
| 22 | /cadastro e forms de anúncio | Cidade é readOnly e depende 100% do ViaCEP — se o serviço cair, cadastro trava | Liberar edição manual da cidade em caso de falha do lookup |
| 23 | Senhas | Sem minLength no cliente, sem indicador de força, sem confirmação no cadastro; após trocar senha os campos não são limpos | minLength=8 + limpar campos após sucesso |
| 24 | Painel | Nada avisa que **anúncio precisa de ≥1 foto para ser aprovado** (o admin nem consegue aprovar sem foto) | Aviso na tela de edição enquanto 0 fotos |
| 25 | /anuncios, /aparelhos | Empty state "Nenhum espaço encontrado **com esses filtros**" aparece mesmo sem filtro ativo | Diferenciar (padrão já existe em /educacao-medica) |
| 26 | Detalhe do anúncio | Mensagem do WhatsApp não inclui o título do anúncio (só educação inclui); clique não registra lead no banco (sem contagem por anúncio) | Incluir título; considerar registrar lead |
| 27 | Filtros públicos | Sem loading state (useTransition) — em rede lenta parece que o clique não funcionou | `isPending` nos filtros/busca |
| 28 | Cookie banner | Preferências salvas sem confirmação; sem role dialog/foco (a11y); X com aria-label "Voltar" | role="dialog" + foco + confirmação breve |
| 29 | Admin | Tabs de status descartam a busca `q` ao clicar; `<a>` em vez de `<Link>` (full reload) | Preservar query; usar Link |
| 30 | Admin | Anúncio criado pelo admin nasce PUBLISHED **sem foto** (backstop de foto só vale na aprovação) | Aplicar `assertCanPublish` também na criação |
| 31 | Recuperar senha | Sem opção de reenviar na tela de sucesso | Botão "Reenviar" com cooldown |
| 32 | /redefinir-senha | Token só validado no submit (usuário digita 2 senhas para descobrir link expirado); "As senhas não coincidem" só após round-trip | Validar token no load; comparar senhas no cliente |

---

## O que já está bom (manter)

- **Cadastro:** erros por campo claros e em PT; todos os valores preservados após erro (incluindo CEP/cidade/bairro — testado); busca automática de CEP; aceite de termos LGPD; opt-in de marketing separado.
- **Onboarding:** modal pós-cadastro explica exatamente o próximo passo e avisa que cadastro ≠ anúncio publicado (só falta o botão funcionar — item 3).
- **Recuperação de senha:** tela de sucesso exemplar (anti-enumeração, aviso de spam, validade de 1h, link de volta).
- **Perfil:** "Perfil atualizado com sucesso!" e "Senha atual incorreta" — feedbacks específicos e no lugar certo.
- **LGPD:** export JSON com aviso e e-mail de privacidade; exclusão de conta com confirmação por senha e aviso de irreversibilidade (falta só o item 7).
- **Admin:** badge de pendências na sidebar; "Aprovar" desabilitado para anúncio sem foto com badge "Sem foto"; autorização consistente em todas as actions.
- **Empty states do painel** com CTA por categoria.
- **Segurança:** anti-enumeração com timing constante no login, bcrypt cost 12, token de reset sha256 uso único/1h, troca de senha invalida tokens pendentes.

---

## Notas de ambiente (para o dev)

1. **Fix aplicado em `next.config.ts`:** `turbopack: { root: process.cwd() }`. O Turbopack (Next 16) inferia a raiz como `d:\Projects` por causa de divergência de maiúscula/minúscula da letra do drive (`d:` vs `D:`), quebrando a resolução de `@import "tailwindcss"`. Rodar o dev a partir de `D:\Projects\cejana-clinica-olx` (D maiúsculo) também ajuda.
2. Esse bug fazia o Turbopack respawnar workers de postcss infinitamente — foram encontrados **2.275 processos `postcss.js` zumbis** esgotando a memória do Windows (causa dos crashes de OOM antes do reboot). Com o fix, não deve reocorrer.
3. A senha do usuário `admin@medspace.com.br` não é mais a do seed (foi trocada — correto em ambiente compartilhado). O banco usado localmente contém dados reais (43 cadastros), então testes locais devem sempre usar dados claramente marcados e limpos ao final, como foi feito aqui.

---

## Status de implementação (2026-07-30)

**Implementado e testado localmente** (browser + tsc + 107 testes unitários passando):

- **P0 1–7: todos.** Banner honesto por status na criação/edição de anúncio; botão "Enviar para revisão" só em rascunho/rejeitado; CTA do modal de boas-vindas navegando; aviso de re-moderação ao salvar anúncio publicado (flag `demoted` da action); rejeição com **motivo obrigatório** (dialog no admin + coluna `rejection_reason` + banner no painel do anunciante, limpo ao aprovar); CSP liberando os domínios de conversão do Google Ads (0 erros de console); banner de confirmação de conta excluída na home.
- **P1:** scroll até o primeiro erro em forms longos (anúncio + cadastro); `minLength=8` da senha no cliente (login + cadastro); "Conta criada!" agora em verde com link para o login (campo `info` no ActionState); erros de upload/imagens traduzidos; badges de status traduzidos via `src/lib/listing-status.ts` ("Em análise" em vez de "Pendente"/"PENDING"); confirmação estilizada (`ConfirmDialog`) para bloquear/excluir clínica com aviso de que a conta do usuário é apagada; `revalidatePath` das páginas de detalhe (`/anuncios/[slug]`) em update/delete/publish/approve/reject e na exclusão de conta; `callbackUrl` no middleware + login (com proteção contra open redirect); tabs do admin preservando busca/filtros; 404 com CTA; `global-error.tsx` + `error.digest` visível.
- **P2:** singular/plural ("1 foto"); "Cadastre-se" no login; labels do perfil adaptadas ao tipo de anunciante; modal de migração só para contas com anúncios anteriores a 2026-05-10; empty states diferenciados (com/sem filtro) em /anuncios e /aparelhos; mensagem do WhatsApp com o título do anúncio; mensagens PT no `updateEducationSchema`; dica "anúncio sem foto não é aprovado" na edição; `?created=1` removido da URL após exibir o banner.

**Pendências conhecidas (não implementadas nesta rodada):**
- Sistema de toast unificado (sonner) — os 3 padrões continuam coexistindo, mas com mensagens corretas.
- `window.confirm` ainda usado na exclusão de anúncio (painel e admin) — trocar pelo `ConfirmDialog` criado.
- Mensagem específica de rate limit no login (continua genérica) e exibição do `retryAfter`.
- E-mail de notificação ao anunciante na rejeição/aprovação; e-mail de confirmação pós-exclusão de conta.
- Loading states nos filtros públicos; upload múltiplo/progresso; edição manual de cidade quando o ViaCEP falha.
- `next lint` está quebrado no repo (comando removido no Next 16) — pré-existente, migrar para `eslint` CLI.

## Changelog
- [2026-07-30] - Implementação dos P0/P1/P2 acima + re-teste E2E local completo (cadastro → anúncio → rejeição c/ motivo → reenvio → aprovação → exclusão de conta). Dados de teste removidos do banco.
- [2026-07-30] - Criação do relatório (auditoria de código + testes E2E locais dos fluxos de cadastro, login, anúncios, perfil, admin e páginas públicas).
