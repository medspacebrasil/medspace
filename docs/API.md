# MEDSPACE - Documentacao da API

## Visao Geral

A API do MEDSPACE e construida dentro do Next.js usando duas abordagens complementares:

1. **Server Actions** - Para operacoes de formulario (criar/editar anuncios, login, cadastro)
2. **Route Handlers** - Para endpoints REST consumidos pelo frontend (listagem, filtros, upload)

Base URL: `/api`

## Route Handlers (REST API)

### Anuncios

#### `GET /api/anuncios`
Lista anuncios publicados com filtros opcionais.

**Query Params:**
| Param | Tipo | Descricao |
|-------|------|-----------|
| city | string | Filtrar por cidade |
| neighborhood | string | Filtrar por bairro |
| specialty | string | Slug da especialidade |
| roomType | string | Slug do tipo de sala |
| equipment | string | Slug do equipamento |
| page | number | Pagina (default: 1) |
| limit | number | Itens por pagina (default: 20, max: 50) |
| sort | string | Ordenacao: `recent` (default), `oldest` |

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Consultorio equipado - Centro SP",
      "slug": "consultorio-equipado-centro-sp",
      "description": "Sala ampla com ar condicionado...",
      "city": "Sao Paulo",
      "neighborhood": "Centro",
      "roomType": { "name": "Consultorio", "slug": "consultorio" },
      "specialties": [{ "name": "Cardiologia", "slug": "cardiologia" }],
      "images": [{ "url": "https://...", "order": 0 }],
      "clinic": { "name": "Clinica Saude Total" },
      "createdAt": "2026-03-30T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### `GET /api/anuncios/[id]`
Retorna detalhes de um anuncio especifico pelo slug ou ID.

**Response 200:**
```json
{
  "id": "clx...",
  "title": "Consultorio equipado - Centro SP",
  "slug": "consultorio-equipado-centro-sp",
  "description": "Sala ampla com ar condicionado...",
  "fullDescription": "Descricao completa do anuncio...",
  "city": "Sao Paulo",
  "neighborhood": "Centro",
  "whatsapp": "11999998888",
  "status": "PUBLISHED",
  "roomType": { "name": "Consultorio", "slug": "consultorio" },
  "specialties": [...],
  "equipment": [...],
  "images": [...],
  "clinic": {
    "name": "Clinica Saude Total",
    "phone": "1133334444"
  },
  "createdAt": "2026-03-30T...",
  "updatedAt": "2026-03-30T..."
}
```

#### `POST /api/anuncios` (autenticado - CLINIC)
Cria um novo anuncio.

**Headers:** `Cookie: next-auth.session-token=...`

**Body (JSON):**
```json
{
  "title": "Consultorio equipado - Centro SP",
  "description": "Sala ampla com ar condicionado...",
  "fullDescription": "Descricao completa...",
  "city": "Sao Paulo",
  "neighborhood": "Centro",
  "whatsapp": "11999998888",
  "roomTypeId": "clx...",
  "specialtyIds": ["clx...", "clx..."],
  "equipmentIds": ["clx...", "clx..."]
}
```

**Response 201:** Anuncio criado (status DRAFT)

#### `PUT /api/anuncios/[id]` (autenticado - dono)
Atualiza um anuncio existente. Mesmo body do POST (campos parciais aceitos).

#### `DELETE /api/anuncios/[id]` (autenticado - dono ou ADMIN)
Remove um anuncio.

**Response 204:** Sem conteudo

---

### Upload de Imagens

#### `POST /api/upload`
Upload de imagem para Supabase Storage.

**Headers:** `Cookie: next-auth.session-token=...`
**Content-Type:** `multipart/form-data`

**Body:**
| Field | Tipo | Descricao |
|-------|------|-----------|
| file | File | Imagem (JPEG, PNG, WebP) |
| listingId | string | ID do anuncio (opcional, para associar) |

**Validacoes:**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho maximo: 5MB
- Maximo 10 imagens por anuncio

**Response 201:**
```json
{
  "url": "https://xxxx.supabase.co/storage/v1/object/public/listings/clx.../foto.webp",
  "id": "clx..."
}
```

---

### Autenticacao

#### `POST /api/auth/[...nextauth]`
Gerenciado pelo Auth.js. Endpoints automaticos:
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Sessao atual
- `GET /api/auth/csrf` - Token CSRF

---

### Admin

#### `GET /api/admin/clinicas` (autenticado - ADMIN)
Lista todas as clinicas cadastradas.

#### `GET /api/admin/anuncios` (autenticado - ADMIN)
Lista anuncios pendentes de moderacao.

**Query Params:**
| Param | Tipo | Descricao |
|-------|------|-----------|
| status | string | Filtrar por status (PENDING, PUBLISHED, etc) |

#### `PATCH /api/admin/anuncios/[id]/status` (autenticado - ADMIN)
Altera status de um anuncio (aprovar, rejeitar, arquivar).

**Body:**
```json
{
  "status": "PUBLISHED" | "REJECTED" | "ARCHIVED"
}
```

---

## Server Actions

Server Actions sao usadas para operacoes de formulario que nao precisam de endpoint REST.

### Auth Actions (`src/app/(auth)/actions.ts`)
| Action | Descricao | Input |
|--------|-----------|-------|
| `registerClinic` | Cadastro de clinica + usuario | FormData (email, password, clinicName, city, neighborhood, whatsapp) |
| `signIn` | Login com email/senha | FormData (email, password) |

### Painel Actions (`src/app/painel/anuncios/actions.ts`)
| Action | Descricao | Input |
|--------|-----------|-------|
| `createListing` | Criar anuncio | FormData (todos campos do anuncio) |
| `updateListing` | Editar anuncio | FormData (id + campos alterados) |
| `deleteListing` | Excluir anuncio | FormData (id) |
| `publishListing` | Mudar status para PENDING | FormData (id) |

### Admin Actions (`src/app/admin/actions.ts`)
| Action | Descricao | Input |
|--------|-----------|-------|
| `approveListing` | Aprovar anuncio | FormData (id) |
| `rejectListing` | Rejeitar anuncio | FormData (id) |
| `blockClinic` | Bloquear clinica | FormData (clinicId) |

## Middleware de Protecao de Rotas

```typescript
// src/middleware.ts
// Rotas protegidas:
// /painel/* → requer autenticacao (role: CLINIC ou ADMIN)
// /admin/*  → requer autenticacao (role: ADMIN)
// /api/admin/* → requer autenticacao (role: ADMIN)
```

## Codigos de Erro Padrao

| Codigo | Significado | Quando |
|--------|-------------|--------|
| 200 | OK | Sucesso em GET/PUT |
| 201 | Created | Sucesso em POST |
| 204 | No Content | Sucesso em DELETE |
| 400 | Bad Request | Validacao falhou (Zod) |
| 401 | Unauthorized | Nao autenticado |
| 403 | Forbidden | Sem permissao (role errada ou nao e dono) |
| 404 | Not Found | Recurso nao existe |
| 413 | Payload Too Large | Upload acima de 5MB |
| 422 | Unprocessable Entity | Dados semanticamente invalidos |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro inesperado |

---

## Changelog
- [2026-03-30] - Documentacao da API criada para o MVP
