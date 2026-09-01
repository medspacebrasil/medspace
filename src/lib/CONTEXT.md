# lib/ - Context

## Descricao
Utilitarios, configuracoes e logica de acesso a dados. Codigo que nao e componente React.

## Estrutura (estado real)
```
lib/
├── analytics.ts         # GA4 via Consent Mode: trackWhatsAppLead(source) etc.
├── cache.ts             # unstable_cache das listagens/taxonomias (tag "listings")
├── csv.ts               # csvCell (protege contra formula no Excel) e csvFile (BOM, ";", CRLF)
├── email.ts             # sendEmail (SMTP Hostinger) e e-mail de redefinicao de senha
├── form-values.ts       # echoFormValues: reecoa valores em falha de action (React 19)
├── listing-status.ts    # Rotulos PT-BR de ListingStatus
├── listing-taxonomy.ts  # Ids validos de especialidades/equipamentos
├── rate-limit.ts        # Upstash sliding window; RATE_LIMITS centralizado (falha aberto sem env)
│
├── asaas/
│   └── client.ts        # Cliente HTTP do Asaas: customer, payment (create/get/delete/refund), Pix QR
│
├── auth/
│   ├── index.ts         # Auth.js v5: auth(), signIn(), signOut()
│   └── guards.ts        # getActiveClinicSession (rejeita conta bloqueada)
│
├── billing/
│   ├── pricing.ts       # Catalogo de precos (snapshot por pedido), publicationExpiry, formatBRL
│   ├── orders.ts        # Maquina de estados do pedido: criar, ativar, expirar, chargeback,
│   │                    #   estorno, cancelar pendentes (exclui cobranca no Asaas)
│   ├── checkout.ts      # startCheckout: cliente Asaas, reuso de pedido, fecha cobranca anterior
│   ├── status.ts        # Leitura humana: situacaoPedido, cobrancaDoPedido, podePagar,
│   │                    #   fraseVigencia, inicioDoMesBrasilia, formatadores
│   └── reports.ts       # Consultas do painel financeiro (somente leitura)
│
├── db/
│   ├── prisma.ts        # Singleton do Prisma 7 com adapter pg
│   └── index.ts
│
├── metrics/
│   ├── index.ts         # brasiliaDay, visitorHash, recordListingEvent, rankings
│   └── client.ts        # reportListingView / reportListingContact (beacon)
│
├── supabase/client.ts   # Cliente admin do Storage
├── utils/index.ts       # cn, generateSlug, formatPhone, listingWhatsAppMessage...
└── validators/          # Zod: auth, listing, equipment, education, phone, document, password-reset
```

## Regras que o codigo de cobranca assume
- Pedido pago continua `PAID` depois que a vigencia termina; `EXPIRED_UNPAID` e so para
  cobranca vencida sem pagamento. Rebaixar pedido pago o tornaria ativavel de novo e a
  liquidacao tardia do cartao republicaria o anuncio sem cobrar.
- `activatePublication` grava `paidUntil` sempre, mas so muda status para `PUBLISHED` se o
  anuncio esta em `AWAITING_PAYMENT`, `EXPIRED` ou `PUBLISHED`. Pagamento nao passa por cima
  de moderacao.
- Estorno e chargeback so derrubam o anuncio se `listing.paidUntil === order.expiresAt`
  (a vigencia corrente e a deste pedido).
- Antes de gerar cobranca nova no mesmo pedido, `startCheckout` consulta as abertas: paga
  ativa e interrompe (`ALREADY_PAID`); nao paga e excluida no Asaas.
- Antes de excluir anuncio ou conta, `cancelarPedidosPendentes` cancela pedidos sem
  pagamento e exclui as cobrancas abertas no Asaas.

## Imports
```typescript
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { createListingSchema } from "@/lib/validators"
```

---
## Changelog
- [2026-03-30] - Context criado
- [2026-09-01] - Arvore atualizada para o estado real; regras da cobranca por publicacao
