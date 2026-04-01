# MEDSPACE - Guia de Engenharia

## Convencoes de Codigo

### Linguagem
- **Codigo:** Ingles (variaveis, funcoes, componentes, commits)
- **Conteudo:** Portugues (textos de UI, labels, mensagens de erro para o usuario)
- **Rotas URL:** Portugues (ex: `/anuncios`, `/painel`, `/cadastro`)
- **Banco de dados:** Ingles para nomes de tabela/coluna (ex: `listing`, `clinic`, `specialty`)

### Nomenclatura
| Item | Convencao | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `ListingCard.tsx` |
| Funcoes/hooks | camelCase | `useListings()` |
| Arquivos de pagina | `page.tsx` (Next.js convention) | `src/app/anuncios/page.tsx` |
| Arquivos de layout | `layout.tsx` | `src/app/layout.tsx` |
| Server Actions | camelCase, prefixo verbo | `createListing()`, `updateListing()` |
| Route Handlers | `route.ts` | `src/app/api/anuncios/route.ts` |
| Tipos/Interfaces | PascalCase, prefixo I para interfaces | `Listing`, `IListingFilters` |
| Variaveis de ambiente | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| Tabelas Prisma | PascalCase singular | `model Listing` |
| CSS classes | Tailwind utilities | `className="flex items-center gap-2"` |

### Estrutura de Componentes
```typescript
// 1. Imports
import { ComponentProps } from "react"

// 2. Types (se necessario)
interface ListingCardProps {
  listing: Listing
}

// 3. Component
export function ListingCard({ listing }: ListingCardProps) {
  // hooks primeiro
  // handlers depois
  // render
  return (...)
}
```

### Server Actions
```typescript
// src/app/painel/anuncios/actions.ts
"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const createListingSchema = z.object({
  title: z.string().min(5).max(120),
  // ...
})

export async function createListing(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const validated = createListingSchema.parse(
    Object.fromEntries(formData)
  )

  // ... prisma create
}
```

### Route Handlers
```typescript
// src/app/api/anuncios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // ... filtros
  const listings = await prisma.listing.findMany({ ... })
  return NextResponse.json(listings)
}
```

## Estrutura de Pastas

```
cejana-clinica-olx/
├── docs/                      # Documentacao do projeto
├── prisma/                    # Schema, migrations, seeds
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                    # Assets estaticos
│   └── images/                # Logos, favicons, placeholders
├── src/
│   ├── app/                   # Next.js App Router (rotas)
│   │   ├── (auth)/            # Grupo: login, cadastro
│   │   ├── (public)/          # Grupo: home, marketplace, detalhe
│   │   ├── painel/            # Dashboard clinica (protegido)
│   │   ├── admin/             # Painel admin (protegido)
│   │   ├── api/               # Route Handlers
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   ├── ui/                # shadcn/ui (gerenciado pelo CLI)
│   │   ├── layout/            # Header, Footer, Sidebar, Nav
│   │   ├── anuncios/          # Cards, filtros, galeria
│   │   └── forms/             # Form components reutilizaveis
│   ├── lib/                   # Utilitarios e configuracoes
│   │   ├── auth/              # Config Auth.js
│   │   ├── db/                # Prisma client singleton
│   │   ├── utils/             # Helpers gerais
│   │   └── validators/        # Schemas Zod
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types globais
├── __tests__/                 # Testes
│   ├── unit/                  # Testes unitarios
│   ├── integration/           # Testes de integracao
│   └── e2e/                   # Testes end-to-end
├── .env.local                 # Variaveis de ambiente (local, NAO commitar)
├── .env.example               # Template de variaveis (commitar)
├── next.config.ts             # Config Next.js
├── tailwind.config.ts         # Config Tailwind
├── tsconfig.json              # Config TypeScript
├── prisma/schema.prisma       # Schema do banco
└── package.json
```

## Workflow de Desenvolvimento

### Setup Inicial
```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variaveis de ambiente
cp .env.example .env.local

# 3. Rodar migrations
npx prisma migrate dev

# 4. Seed do banco (dados iniciais)
npx prisma db seed

# 5. Iniciar dev server
npm run dev
```

### Variaveis de Ambiente (.env.example)
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"

# Auth.js
AUTH_SECRET="gerar-com-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Supabase (Storage + opcionalmente Auth)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxxx"
SUPABASE_SERVICE_ROLE_KEY="xxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE="Ola, vi seu anuncio no MedSpace e tenho interesse!"
```

### Git Workflow
- **Branch principal:** `main`
- **Branches de feature:** `feat/nome-da-feature`
- **Branches de fix:** `fix/descricao-do-bug`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **PRs:** Sempre para `main`, com descricao do que foi feito

### Padrao de Commits
```
feat: add listing creation form with image upload
fix: correct filter query for specialty search
docs: update API documentation with new endpoints
chore: configure Prisma with Supabase connection
style: adjust mobile responsiveness on listing cards
```

## Dependencias Principais

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "@prisma/client": "^6.x",
    "next-auth": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "zod": "^3.x",
    "tailwindcss": "^4.x",
    "lucide-react": "^0.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "@types/react": "^19.x",
    "vitest": "^3.x",
    "@testing-library/react": "^16.x",
    "playwright": "^1.x"
  }
}
```

## Padroes de Erro

### Server Actions - erros retornados ao form
```typescript
export async function createListing(formData: FormData) {
  try {
    // validacao + operacao
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, errors: { _form: ["Erro interno"] } }
  }
}
```

### Route Handlers - HTTP status codes
```typescript
export async function GET() {
  // 200 - sucesso
  // 400 - input invalido
  // 401 - nao autenticado
  // 403 - sem permissao
  // 404 - nao encontrado
  // 500 - erro interno
}
```

---

## Changelog
- [2026-03-30] - Documento criado com padroes de engenharia do MVP
