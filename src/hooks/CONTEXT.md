# hooks/ - Context

## Descricao
Custom React hooks para logica reutilizavel no client-side.

## Hooks planejados

### useFilters
```typescript
// Gerencia estado dos filtros do marketplace
// Sincroniza com URL searchParams (para URLs compartilhaveis)
// Debounce em mudancas para evitar requests excessivos
//
// Uso: const { filters, setFilter, clearFilters } = useFilters()
```

### useDebounce
```typescript
// Debounce generico para valores
// Uso: const debouncedSearch = useDebounce(searchTerm, 300)
```

### useImageUpload
```typescript
// Gerencia upload de multiplas imagens
// - Preview local antes do upload
// - Upload para /api/upload
// - Estado de progresso
// - Reordenamento (drag-and-drop)
// - Remocao
//
// Uso: const { images, upload, remove, reorder, isUploading } = useImageUpload(listingId)
```

### useMediaQuery
```typescript
// Detecta breakpoints (mobile/tablet/desktop)
// Uso: const isMobile = useMediaQuery("(max-width: 768px)")
```

### useWhatsAppUrl
```typescript
// Gera URL do WhatsApp formatada
// Uso: const url = useWhatsAppUrl({ phone: "11999998888", title: "Consultorio..." })
```

## Convencoes
- Prefixo `use` (convencao React)
- Um hook por arquivo
- Sempre tipado com TypeScript
- Arquivo no padrao `useNomeDoHook.ts`
- Todos os hooks sao client-side (`"use client"` implicito pelo uso de hooks React)

---
## Changelog
- [2026-03-30] - Context criado
