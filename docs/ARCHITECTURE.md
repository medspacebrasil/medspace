# MEDSPACE - Arquitetura do Sistema

## Visao Geral

MEDSPACE e um marketplace web para conectar medicos a clinicas que oferecem salas e equipamentos. O MVP foca em geracao de leads via WhatsApp, sem checkout integrado.

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (CDN + Edge)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js 16 (App Router)                │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Pages SSR   │  │ Server       │  │ Route Handlers  │  │  │
│  │  │  + RSC       │  │ Actions      │  │ (API REST)      │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └───────┬─────────┘  │  │
│  │         │                 │                   │            │  │
│  │         └─────────────────┼───────────────────┘            │  │
│  │                           │                                │  │
│  │                    ┌──────▼───────┐                        │  │
│  │                    │   Prisma ORM │                        │  │
│  │                    └──────┬───────┘                        │  │
│  └───────────────────────────┼───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │  Supabase     │  │  Supabase   │  │  Supabase   │
     │  PostgreSQL   │  │  Auth       │  │  Storage    │
     │  (dados)      │  │  (sessoes)  │  │  (imagens)  │
     └──────────────┘  └─────────────┘  └─────────────┘
```

## Stack Tecnica Detalhada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 16 (App Router) | SSR/SSG, Server Components, Server Actions, deploy nativo Vercel |
| UI Library | shadcn/ui + Tailwind CSS | Componentes acessiveis, customizaveis, sem vendor lock-in |
| Banco de Dados | PostgreSQL 18 (Supabase) | Relacional, robusto, gratuito no tier free do Supabase |
| ORM | Prisma | Type-safe, migrations automaticas, boa DX |
| Autenticacao | Auth.js v5 (NextAuth) | Integracao nativa Next.js, providers flexiveis |
| Storage | Supabase Storage | S3-compatible, integrado ao ecossistema Supabase |
| Deploy Web | Vercel | Zero-config para Next.js, edge functions, CDN global |
| Deploy DB | Supabase | Postgres gerenciado, tier gratuito generoso |

## Decisoes Arquiteturais

### 1. Monolito Next.js (sem backend separado)
**Decisao:** Todo o backend roda dentro do Next.js via Route Handlers e Server Actions.
**Razao:** MVP com prazo curto. Reduz complexidade operacional. Server Actions eliminam boilerplate de API para operacoes de formulario. Route Handlers cobrem endpoints REST quando necessario.
**Trade-off:** Se o projeto escalar muito, pode ser necessario extrair microsservicos. Mas para o MVP e Fase 2, e mais que suficiente.

### 2. Supabase como infraestrutura unificada
**Decisao:** Usar Supabase para Postgres + Storage (e opcionalmente Auth como fallback).
**Razao:** Custo zero no tier free (500MB DB, 1GB storage). Elimina necessidade de configurar S3/R2 separadamente. Painel visual para a cliente gerenciar se necessario.
**Trade-off:** Vendor lock-in parcial, mas Prisma abstrai o acesso ao banco, facilitando migracao futura.

### 3. Auth.js como camada de autenticacao primaria
**Decisao:** Auth.js (NextAuth v5) como provider principal, com Supabase Auth como alternativa.
**Razao:** Integracao nativa com Next.js App Router. Suporte a credentials (email/senha) e OAuth. Session strategy com JWT para performance.
**Trade-off:** Auth.js com credentials requer mais configuracao que Supabase Auth, mas da mais controle.

### 4. Prisma como ORM
**Decisao:** Prisma para todas as operacoes de banco de dados.
**Razao:** Type-safety end-to-end, migrations versionadas, schema declarativo, excelente DX.
**Trade-off:** Overhead de query em comparacao com SQL puro, mas negligenciavel para o MVP.

### 5. Mobile-first com shadcn/ui
**Decisao:** Design system baseado em shadcn/ui com abordagem mobile-first.
**Razao:** Componentes acessiveis e customizaveis. Nao adiciona peso ao bundle (copy-paste, nao lib). Tailwind permite prototipagem rapida.

## Estrutura de Rotas (App Router)

```
src/app/
├── (auth)/                    # Grupo de rotas de autenticacao
│   ├── login/page.tsx         # Tela de login
│   ├── cadastro/page.tsx      # Cadastro de clinica
│   └── layout.tsx             # Layout limpo (sem header completo)
│
├── (public)/                  # Grupo de rotas publicas
│   ├── page.tsx               # Home (hero + busca + destaques)
│   ├── anuncios/
│   │   ├── page.tsx           # Marketplace (listagem + filtros)
│   │   └── [slug]/page.tsx    # Detalhe do anuncio
│   └── layout.tsx             # Layout com header/footer completo
│
├── painel/                    # Dashboard da clinica (protegido)
│   ├── page.tsx               # Visao geral dos anuncios
│   ├── anuncios/
│   │   ├── novo/page.tsx      # Criar anuncio
│   │   └── [id]/
│   │       └── editar/page.tsx # Editar anuncio
│   ├── perfil/page.tsx        # Perfil da clinica
│   └── layout.tsx             # Layout com sidebar do painel
│
├── admin/                     # Painel admin (protegido, role=admin)
│   ├── page.tsx               # Dashboard admin
│   ├── clinicas/page.tsx      # Gerenciar clinicas
│   ├── anuncios/page.tsx      # Moderar anuncios
│   └── layout.tsx             # Layout admin
│
├── api/                       # Route Handlers (REST)
│   ├── auth/[...nextauth]/route.ts
│   ├── anuncios/route.ts      # GET (listar) + POST (criar)
│   ├── anuncios/[id]/route.ts # GET + PUT + DELETE
│   ├── upload/route.ts        # POST (upload de imagens)
│   └── admin/                 # Endpoints administrativos
│
├── layout.tsx                 # Root layout (providers, fonts)
├── loading.tsx                # Loading global
├── error.tsx                  # Error boundary global
└── globals.css                # Estilos globais + Tailwind
```

## Fluxo de Dados

### Leitura (Visitante buscando anuncios)
```
Browser → Server Component (RSC) → Prisma → Supabase PostgreSQL
                                      ↓
                              HTML renderizado no servidor
                                      ↓
                              Stream para o browser (fast FCP)
```

### Escrita (Clinica criando anuncio)
```
Browser → Form Submit → Server Action → Validacao (Zod)
                                            ↓
                                    Prisma → Supabase PostgreSQL
                                            ↓
                                    Upload → Supabase Storage
                                            ↓
                                    revalidatePath/redirect
```

### Autenticacao
```
Browser → Auth.js → Credentials Provider (email/senha)
                        ↓
                 JWT Session (cookie httpOnly)
                        ↓
                 Middleware verifica rotas protegidas
                 (/painel/*, /admin/*)
```

## Seguranca

- **Auth:** JWT com httpOnly cookies, CSRF protection via Auth.js
- **Autorizacao:** Middleware de rota + verificacao server-side por role (clinica vs admin)
- **Upload:** Validacao de tipo (apenas imagens), limite de tamanho (5MB), sanitizacao de nome
- **Input:** Validacao com Zod em Server Actions e Route Handlers
- **SQL Injection:** Prevenido pelo Prisma (queries parametrizadas)
- **XSS:** React escapa output por padrao + CSP headers
- **Rate Limiting:** Implementar em endpoints publicos criticos (login, cadastro)

## Performance

- **SSR + Streaming:** Server Components para paginas publicas (SEO + performance)
- **Image Optimization:** next/image com Supabase Storage como loader
- **ISR:** Incremental Static Regeneration para paginas de anuncio (revalidate on demand)
- **Code Splitting:** Automatico pelo Next.js App Router
- **DB:** Indices em campos de filtro (cidade, bairro, especialidade, tipo_sala)

## Escalabilidade Futura (Fase 2+)

A arquitetura permite evolucao sem reescrita:
- **Checkout/Pagamento:** Adicionar Stripe via Route Handler
- **Avaliacoes:** Nova tabela + relacao com anuncios
- **Busca avancada:** Integrar com Supabase Full-Text Search ou Algolia
- **Destaque pago:** Flag no anuncio + ordenacao por destaque
- **Dashboard metricas:** Nova rota no painel com charts (Recharts)
- **Notificacoes:** Supabase Realtime ou email via Resend

---

## Changelog
- [2026-03-30] - Documento criado com arquitetura inicial do MVP
