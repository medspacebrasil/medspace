# components/ - Context

## Descricao
Componentes React reutilizaveis, organizados por dominio.

## Estrutura
```
components/
├── ui/              # shadcn/ui (gerenciado pelo CLI - nao editar manualmente)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── sheet.tsx        # Drawer mobile
│   ├── skeleton.tsx     # Loading placeholder
│   ├── toast.tsx
│   ├── carousel.tsx     # Galeria de fotos
│   └── ...
│
├── layout/           # Componentes estruturais
│   ├── Header.tsx       # Header publico (logo, nav, login)
│   ├── Footer.tsx       # Footer publico
│   ├── Sidebar.tsx      # Sidebar do painel/admin
│   ├── MobileNav.tsx    # Navegacao mobile (hamburger ou bottom)
│   └── Container.tsx    # Wrapper de largura maxima
│
├── anuncios/         # Componentes do dominio de anuncios
│   ├── ListingCard.tsx      # Card do anuncio (usado na listagem)
│   ├── ListingGrid.tsx      # Grid de cards
│   ├── ListingFilters.tsx   # Barra/sidebar de filtros
│   ├── ListingGallery.tsx   # Galeria de fotos (detalhe do anuncio)
│   ├── ListingDetail.tsx    # Bloco de informacoes do anuncio
│   ├── WhatsAppButton.tsx   # Botao CTA "Tenho interesse"
│   ├── ListingStatusBadge.tsx # Badge de status (DRAFT, PENDING, etc)
│   └── EmptyState.tsx       # Estado vazio (sem resultados)
│
└── forms/            # Componentes de formulario
    ├── ListingForm.tsx      # Formulario de criar/editar anuncio
    ├── ImageUpload.tsx      # Upload de imagens com preview e reorder
    ├── SpecialtySelect.tsx  # Multi-select de especialidades
    ├── EquipmentSelect.tsx  # Multi-select de equipamentos
    ├── CitySelect.tsx       # Select de cidade
    ├── WhatsAppInput.tsx    # Input com mascara de WhatsApp
    └── FormError.tsx        # Exibicao de erros do formulario
```

## Convencoes

### shadcn/ui (`ui/`)
- Instalados via CLI: `npx shadcn@latest add button`
- NAO editar diretamente os arquivos em `ui/` (re-gerados pelo CLI)
- Customizar via props e `className` no componente que usa

### Componentes customizados
- Um componente por arquivo
- PascalCase para nomes
- Props tipadas com interface
- Exportacao nomeada (nao default)
- Server Components por padrao; `"use client"` apenas quando necessario (event handlers, hooks)

### Quando usar "use client"
- Formularios com estado (inputs controlados)
- Componentes com event handlers (onClick, onChange)
- Componentes que usam hooks (useState, useEffect)
- Interacoes de UI (modais, dropdowns, carousels)

### Quando manter Server Component
- Cards de listagem (puro render)
- Layouts
- Componentes que apenas recebem props e renderizam

## Componentes-chave

### ListingCard
```
┌────────────────────┐
│  [Foto principal]  │
│                    │
├────────────────────┤
│ Titulo do anuncio  │
│ Cidade - Bairro    │
│ [Tag] [Tag] [Tag]  │
│ Descricao breve... │
└────────────────────┘
```

### WhatsAppButton
- Cor verde (#25D366)
- Icone do WhatsApp
- Texto: "Tenho interesse"
- Abre: `https://wa.me/55XXXXXXXXXXX?text=Ola...`
- Mensagem pre-preenchida com nome do anuncio

---
## Changelog
- [2026-03-30] - Context criado
