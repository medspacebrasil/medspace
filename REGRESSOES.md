# Regressões conhecidas e blindadas — MedSpace

Registro dos bugs corrigidos e do teste que impede cada um de voltar. Ver skill `/regressao`.

## Blindados com teste

### Galeria do anúncio mostrava só 5 fotos e não ampliava (20/10/2026)
- **Sintoma (relato da Cejana):** anunciante envia até 10 fotos, mas só algumas
  aparecem; e não havia como ver a foto em tamanho maior.
- **Causa:** a página de detalhe (`src/app/(public)/anuncios/[slug]/page.tsx` e
  `aparelhos/[slug]/page.tsx`) renderizava `listing.images.slice(1, 5)` — capa + 4
  miniaturas, no máximo 5 — e as miniaturas eram `<div>` sem clique. Os dados do
  banco já vinham completos (o `include` não tem `take`).
- **Correção:** componente `src/components/anuncios/ListingGallery.tsx` (client) que
  renderiza uma miniatura para TODA imagem e abre um lightbox em tela cheia
  (object-contain, setas, teclado, miniaturas).
- **Teste:** `__tests__/unit/components/ListingGallery.test.tsx` — garante que N fotos
  geram N miniaturas (com o bug do slice seriam 5) e que o clique abre a visualização
  ampliada. Provado que falha com o código antigo reintroduzido numa cópia.
- **Commit:** fix(anuncios): galeria mostra todas as fotos e abre em tamanho maior.

## Sem teste automatizado (motivo registrado)

### upload-security.test.ts trava neste servidor
- **O quê:** 4 casos de `__tests__/integration/api/upload-security.test.ts` dão timeout
  (5s) ao chegar em `request.formData()` com um corpo multipart montado à mão. O caso
  de 401 (que retorna antes do parse) passa.
- **Por quê é ambiental:** falha idêntica antes de qualquer mudança desta data; é uma
  interação do `request.formData()` do undici/Node deste ambiente, não do código da
  rota (`src/app/api/upload/route.ts`, intocada). O resto da suíte roda normal.
- **Ação:** investigar à parte (versão do Node/undici ou mockar `@/lib/rate-limit` e
  trocar a montagem do Request). Não bloqueia correções que não tocam o upload.
