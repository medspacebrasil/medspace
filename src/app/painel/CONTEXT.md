# painel/ - Context (Dashboard da Clinica)

## Descricao
Area protegida para clinicas gerenciarem seus anuncios. Requer autenticacao (role: CLINIC ou ADMIN). Middleware redireciona para `/login` se nao autenticado.

## Rotas
| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/painel` | `page.tsx` | Dashboard com visao geral dos anuncios |
| `/painel/anuncios/novo` | `anuncios/novo/page.tsx` | Formulario de criacao de anuncio |
| `/painel/anuncios/[id]/editar` | `anuncios/[id]/editar/page.tsx` | Formulario de edicao |
| `/painel/perfil` | `perfil/page.tsx` | Editar dados da clinica |

## Layout
Layout com sidebar (desktop) / bottom nav (mobile):
```
┌──────┬──────────────────────────────────┐
│      │  [Clinica Nome]          [Sair]  │
│ Side │──────────────────────────────────│
│ bar  │                                  │
│      │          {children}              │
│ Meus │                                  │
│anun- │                                  │
│cios  │                                  │
│      │                                  │
│Novo  │                                  │
│anun- │                                  │
│cio   │                                  │
│      │                                  │
│Perfil│                                  │
└──────┴──────────────────────────────────┘
```

## Dashboard (`/painel`)
- Contagem de anuncios por status (rascunho, pendente, publicado)
- Lista de anuncios da clinica (tabela ou cards)
- Cada anuncio mostra: titulo, status (badge colorido), data, acoes (editar, excluir)
- Botao "Novo anuncio" proeminente

## Criar Anuncio (`/painel/anuncios/novo`)
Formulario com os campos:

| Campo | Tipo | Obrigatorio | Notas |
|-------|------|------------|-------|
| Titulo | text input | Sim | 5-120 chars |
| Descricao breve | textarea | Sim | Ate 300 chars |
| Descricao completa | rich textarea | Nao | Texto livre |
| Cidade | select/autocomplete | Sim | |
| Bairro | text input | Sim | |
| WhatsApp | text input (mascara) | Sim | Formato: (XX) XXXXX-XXXX |
| Tipo de sala | select | Nao | Consultorio, sala procedimento, etc |
| Especialidades | multi-select | Sim (min 1) | Checkboxes ou tags |
| Equipamentos | multi-select | Nao | Checkboxes ou tags |
| Fotos | upload multiplo | Sim (para publicar) | Drag-and-drop, preview, reordenar |

### Fluxo de salvamento
1. Clinica preenche formulario
2. Pode "Salvar rascunho" (status: DRAFT) sem todos os campos obrigatorios
3. Pode "Publicar" (status: PENDING) - requer todos os campos + min 1 foto
4. Admin aprova → status: PUBLISHED

### Upload de fotos
- Aceita JPEG, PNG, WebP
- Max 5MB por foto
- Max 10 fotos por anuncio
- Preview com thumbnail
- Drag-and-drop para reordenar
- Upload vai para Supabase Storage via `/api/upload`

## Editar Anuncio (`/painel/anuncios/[id]/editar`)
- Mesmo formulario da criacao, pre-preenchido com dados existentes
- So pode editar anuncios da propria clinica
- Ao editar anuncio PUBLISHED, status volta para PENDING (re-moderacao)

## Perfil (`/painel/perfil`)
- Editar: nome da clinica, telefone, whatsapp, cidade, bairro, descricao
- Alterar senha

## Server Actions
Arquivo: `anuncios/actions.ts`

| Action | Descricao |
|--------|-----------|
| `createListing(formData)` | Valida + cria anuncio (DRAFT) |
| `updateListing(formData)` | Valida + atualiza anuncio |
| `deleteListing(formData)` | Remove anuncio + imagens |
| `publishListing(formData)` | Valida campos obrigatorios, muda status para PENDING |
| `updateProfile(formData)` | Atualiza dados da clinica |

---
## Changelog
- [2026-03-30] - Context criado
