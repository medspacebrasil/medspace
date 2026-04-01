# admin/ - Context (Painel Administrativo)

## Descricao
Area protegida para administradores. Requer autenticacao com role ADMIN. Middleware redireciona para `/` se role != ADMIN.

## Rotas
| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin` | `page.tsx` | Dashboard com metricas gerais |
| `/admin/clinicas` | `clinicas/page.tsx` | Gerenciar clinicas |
| `/admin/anuncios` | `anuncios/page.tsx` | Moderar anuncios |

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
