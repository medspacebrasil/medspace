# src/app/ - Context (App Router)

## Visao Geral
Diretorio do Next.js App Router. Cada pasta representa uma rota. Agrupa rotas em grupos logicos usando `(parenteses)`.

## Estrutura de Rotas

```
app/
├── (auth)/                # Rotas de autenticacao (layout limpo)
│   ├── login/page.tsx     # /login
│   ├── cadastro/page.tsx  # /cadastro
│   └── layout.tsx         # Layout sem header/footer completo
│
├── (public)/              # Rotas publicas (layout completo)
│   ├── page.tsx           # / (Home)
│   ├── anuncios/
│   │   ├── page.tsx       # /anuncios (Marketplace)
│   │   └── [slug]/page.tsx # /anuncios/consultorio-centro-sp
│   └── layout.tsx         # Header + Footer
│
├── painel/                # Dashboard da clinica (protegido por middleware)
│   ├── page.tsx           # /painel
│   ├── anuncios/
│   │   ├── novo/page.tsx  # /painel/anuncios/novo
│   │   └── [id]/editar/page.tsx # /painel/anuncios/abc123/editar
│   ├── perfil/page.tsx    # /painel/perfil
│   └── layout.tsx         # Sidebar + header do painel
│
├── admin/                 # Painel admin (protegido por middleware, role=ADMIN)
│   ├── page.tsx           # /admin
│   ├── clinicas/page.tsx  # /admin/clinicas
│   ├── anuncios/page.tsx  # /admin/anuncios
│   └── layout.tsx         # Layout admin
│
├── api/                   # Route Handlers (REST)
│   └── (ver api/CONTEXT.md)
│
├── layout.tsx             # Root layout (html, body, providers, fonts)
├── loading.tsx            # Loading global (Suspense fallback)
├── error.tsx              # Error boundary global
├── not-found.tsx          # Pagina 404 customizada
└── globals.css            # Tailwind directives + estilos globais
```

## Arquivos especiais do Next.js
| Arquivo | Funcao |
|---------|--------|
| `page.tsx` | Define a UI da rota |
| `layout.tsx` | Layout compartilhado (nao re-renderiza entre navegacoes) |
| `loading.tsx` | UI de loading (Suspense boundary) |
| `error.tsx` | Error boundary da rota |
| `not-found.tsx` | UI para 404 |

## Middleware
`src/middleware.ts` (na raiz de src/) intercepta requests para:
- Redirecionar `/painel/*` para `/login` se nao autenticado
- Redirecionar `/admin/*` para `/` se role != ADMIN
- Aplicar headers de seguranca

## Contextos das subpastas
- [(auth)/CONTEXT.md]((auth)/CONTEXT.md)
- [(public)/CONTEXT.md]((public)/CONTEXT.md)
- [painel/CONTEXT.md](painel/CONTEXT.md)
- [admin/CONTEXT.md](admin/CONTEXT.md)
- [api/CONTEXT.md](api/CONTEXT.md)

---
## Changelog
- [2026-03-30] - Context criado
