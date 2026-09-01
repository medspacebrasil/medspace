# admin/ - Context (Painel Administrativo)

## Descricao
Area protegida para administradores. Requer autenticacao com role ADMIN. Middleware redireciona para `/` se role != ADMIN.

## Rotas
| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin` | `page.tsx` | Dashboard com metricas gerais e resumo de cobrancas |
| `/admin/clinicas` | `clinicas/page.tsx` | Gerenciar clinicas |
| `/admin/anuncios` | `anuncios/page.tsx` | Moderar anuncios |
| `/admin/interesse` | `interesse/page.tsx` | Ranking de interesse por anuncio (visualizacoes e contatos); CSV em `/api/admin/interesse.csv` |
| `/admin/cobrancas` | `cobrancas/page.tsx` | Visao consolidada dos recebimentos: resumo (mes, total, aguardando, vigentes, estornos), listagem paginada com filtro; CSV em `/api/admin/cobrancas.csv` |

## Painel de cobrancas (`/admin/cobrancas`)
Somente leitura. Consultas em `src/lib/billing/reports.ts`; traducao de status para
situacao legivel em `src/lib/billing/status.ts` (`situacaoPedido`).

- "Recebido" e definido por `paidAt` preenchido, `origin = PAID_CHARGE` (cortesia fora) e
  status fora de estorno e chargeback, e nao por `status = PAID`. O pedido continua PAID
  depois que a vigencia termina; a leitura vira "Vigencia encerrada" pela data. O filtro
  "pagos" usa o mesmo criterio, para o card e a lista baterem.
- A cobranca mostrada por pedido e a paga, se houver; senao a mais recente
  (`cobrancaDoPedido`). Um pedido pode ter mais de uma cobranca (Pix e depois cartao).
- Filtros na URL em portugues (`?filtro=aguardando|pagos|vencidos|estornos|cortesias`).
- Estorno nao tem botao aqui: e feito no painel do Asaas, e o webhook `PAYMENT_REFUNDED`
  despublica o anuncio automaticamente.

## Funcionalidades solicitadas pela cliente
(Alinhadas na conversa WhatsApp de 25/03/2026):
- Ver todas as clinicas cadastradas
- Editar qualquer cadastro
- Excluir ou bloquear clinicas
- Aprovar/desaprovar cadastro
- Corrigir textos de anuncios
- Alterar fotos de anuncios
- Ajustar dados
- Botao "destacar clinica" (Fase 2 - pos-MVP)
- Numero de contato visivel

## Dashboard (`/admin`)
Metricas resumidas:
- Total de clinicas cadastradas
- Total de anuncios (por status)
- Anuncios pendentes de aprovacao (destaque se > 0)
- Contato das clinicas

## Gerenciar Clinicas (`/admin/clinicas`)
- Tabela com: nome da clinica, email, cidade, whatsapp, data cadastro, status
- Acoes por clinica:
  - Ver detalhes
  - Editar dados (nome, cidade, whatsapp)
  - Bloquear/desbloquear (bloquear desativa todos os anuncios)
  - Excluir (soft delete ou hard delete com confirmacao)

## Moderar Anuncios (`/admin/anuncios`)
- Filtro por status (PENDING, PUBLISHED, REJECTED, ARCHIVED)
- Tabela com: titulo, clinica, cidade, status, data
- Acoes por anuncio:
  - Aprovar (PENDING → PUBLISHED)
  - Rejeitar (PENDING → REJECTED)
  - Arquivar (qualquer → ARCHIVED)
  - Editar textos/fotos diretamente
  - Ver anuncio como publico (preview)

## Layout
Layout admin com sidebar:
```
┌──────────┬──────────────────────────────┐
│  ADMIN   │  Dashboard Admin     [Sair]  │
│          │──────────────────────────────│
│ Dashboard│                              │
│ Clinicas │        {children}            │
│ Anuncios │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

## Server Actions
Arquivo: `actions.ts`

| Action | Descricao |
|--------|-----------|
| `approveListing(id)` | Muda status para PUBLISHED |
| `rejectListing(id)` | Muda status para REJECTED |
| `archiveListing(id)` | Muda status para ARCHIVED |
| `blockClinic(clinicId)` | Bloqueia clinica + arquiva anuncios |
| `unblockClinic(clinicId)` | Desbloqueia clinica |
| `deleteClinic(clinicId)` | Remove clinica (com confirmacao) |
| `updateListingAdmin(id, formData)` | Edita anuncio como admin |

## Seguranca
- Todas as actions verificam `session.user.role === "ADMIN"`
- Middleware bloqueia acesso a /admin/* para non-admin
- Logs de acoes administrativas (futuro)

---
## Changelog
- [2026-03-30] - Context criado
- [2026-09-01] - Painel de cobrancas (`/admin/cobrancas` + CSV) e resumo de recebimentos no dashboard
