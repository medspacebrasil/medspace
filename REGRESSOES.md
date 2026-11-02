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

### upload-security.test.ts travava no request.formData() (02/11/2026)
- **Sintoma:** 4 casos de `__tests__/integration/api/upload-security.test.ts` davam
  timeout (5s) ao chegar em `request.formData()`. Só o caso de 401 (que retorna antes
  do parse) passava.
- **Causa:** o parser multipart do `Request.formData()` (undici) trava sobre um `File`
  criado no ambiente jsdom deste runner. A rota (`src/app/api/upload/route.ts`) está
  correta; o problema era o round-trip de serializacao multipart no teste. Além disso,
  dois casos passariam "à toa" mesmo sem travar: o conteúdo era `"fake-image-data"`,
  que não tem magic bytes de imagem, então a rota rejeitava antes e as asserts dentro
  de `if (uploadCall)` nunca rodavam; e dois esperavam mensagem em inglês ("Invalid
  file type"/"File too large") enquanto a rota responde em português.
- **Correção (só no teste):** um stub `uploadRequest` entrega o `FormData` direto (sem
  passar pela serializacao multipart); bytes de cabeçalho reais (PNG/JPEG) fazem a
  validação por magic bytes passar e as asserts de nome de arquivo exercitarem de
  verdade; mensagens corrigidas para o português real; e um caso novo (arquivo que se
  diz imagem mas tem conteúdo falso deve dar 400) blinda a checagem de magic bytes.
- **Teste:** os 6 casos passam. Provado numa CÓPIA da rota no scratchpad: removendo a
  validação de magic bytes, o arquivo falso é aceito (201) e o caso novo FALHA; com a
  rota real, passa.
- **Nota de ambiente:** rodar a suíte inteira com workers paralelos pode derrubar
  processos por falta de memória quando a máquina está sob carga (swap cheio). Use
  `npx vitest run --no-file-parallelism` para um resultado estável; arquivos isolados
  rodam normal.
