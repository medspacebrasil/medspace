# lib/ - Context

## Descricao
Utilitarios, configuracoes e logica de acesso a dados. Codigo que nao e componente React.

## Estrutura
```
lib/
├── auth/
│   ├── config.ts        # Configuracao do Auth.js (providers, callbacks, session strategy)
│   └── index.ts         # Export de auth(), signIn(), signOut()
│
├── db/
│   ├── prisma.ts        # Singleton do Prisma Client (evita multiplas instancias em dev)
│   └── index.ts         # Re-export do prisma client
│
├── utils/
│   ├── cn.ts            # Utility para merge de classes Tailwind (clsx + twMerge)
│   ├── slug.ts          # Gerar slug a partir de string (ex: titulo → titulo-slug)
│   ├── whatsapp.ts      # Gerar URL do WhatsApp com mensagem pre-preenchida
│   ├── format.ts        # Formatacao de datas, telefone, etc
│   └── constants.ts     # Constantes da aplicacao (limites, mensagens padrao)
│
└── validators/
    ├── listing.ts       # Zod schema para anuncio (create, update)
    ├── auth.ts          # Zod schema para login, cadastro
    ├── upload.ts        # Validacao de arquivo (tipo, tamanho)
    └── filters.ts       # Zod schema para query params de filtros
```

## Detalhes

### auth/config.ts
```typescript
// Configuracao do Auth.js v5
// - Provider: Credentials (email + senha)
// - Session strategy: JWT
// - Callbacks: jwt (adicionar role), session (expor role)
// - Pages: signIn → /login
```

### db/prisma.ts
```typescript
// Singleton pattern para evitar "Too many Prisma Clients" em dev
// Em producao: instancia unica normal
// Em dev: armazena no globalThis para sobreviver hot reload
```

### utils/whatsapp.ts
```typescript
// Gera URL para abrir WhatsApp:
// https://wa.me/55XXXXXXXXXXX?text=Ola%2C%20vi%20seu%20anuncio...
// Parametros: phone (string), message (string), listingTitle (string)
```

### utils/slug.ts
```typescript
// "Consultório equipado - Centro SP" → "consultorio-equipado-centro-sp"
// Remove acentos, caracteres especiais, converte para lowercase
// Adiciona sufixo numerico se slug ja existe no banco
```

### validators/listing.ts
```typescript
// Zod schemas:
// - createListingSchema: validacao para criacao
// - updateListingSchema: validacao para edicao (campos parciais)
// - publishListingSchema: validacao extra para publicar (min 1 foto, etc)
```

## Imports
Todos os utilitarios sao importados via path alias:
```typescript
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils/cn"
import { createListingSchema } from "@/lib/validators/listing"
```

---
## Changelog
- [2026-03-30] - Context criado
