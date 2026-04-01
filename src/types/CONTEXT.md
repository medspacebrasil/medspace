# types/ - Context

## Descricao
Tipos TypeScript globais e interfaces compartilhadas entre diferentes partes da aplicacao.

## Arquivos planejados

### listing.ts
```typescript
// Tipos derivados do Prisma + formatados para uso na UI
//
// ListingWithRelations - Anuncio com clinic, images, specialties, equipment, roomType
// ListingCard - Subset para exibicao no card (listagem)
// ListingDetail - Dados completos para pagina de detalhe
// ListingFormData - Dados do formulario de criacao/edicao
// ListingFilters - Parametros de filtro do marketplace
// ListingStatus - Enum de status (espelha Prisma)
```

### auth.ts
```typescript
// Extensao dos tipos do Auth.js
//
// SessionUser - Usuario na sessao (id, email, name, role)
// Role - Enum de roles (CLINIC, ADMIN)
```

### api.ts
```typescript
// Tipos de resposta da API
//
// ApiResponse<T> - Wrapper padrao { data: T } | { error: string }
// PaginatedResponse<T> - { data: T[], pagination: { page, limit, total, totalPages } }
// ApiError - { error: string, status: number }
```

### form.ts
```typescript
// Tipos para formularios e Server Actions
//
// FormState - Estado de retorno de Server Actions { success, errors? }
// FieldErrors - Record<string, string[]>
```

## Convencoes
- Tipos do Prisma sao importados diretamente do `@prisma/client` quando possivel
- Tipos customizados aqui sao para:
  - Combinar/transformar tipos do Prisma para uso na UI
  - Tipar respostas da API
  - Tipar props de componentes compartilhados
  - Estender tipos de libs (Auth.js, etc)

---
## Changelog
- [2026-03-30] - Context criado
