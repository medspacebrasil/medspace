# MEDSPACE - Estrategia de Testes

## Visao Geral

A cobertura de testes do MEDSPACE segue a piramide de testes classica, com foco pragmatico para um MVP:

```
        ╱╲
       ╱ E2E ╲          Playwright (fluxos criticos)
      ╱────────╲
     ╱Integration╲      Vitest + Prisma (API, actions)
    ╱──────────────╲
   ╱    Unit Tests   ╲   Vitest (utils, validators, hooks)
  ╱────────────────────╲
```

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| **Vitest** | Testes unitarios e de integracao |
| **@testing-library/react** | Renderizacao de componentes React |
| **Playwright** | Testes end-to-end (browser real) |
| **Prisma** (test env) | Banco de teste isolado para integracao |
| **MSW** (Mock Service Worker) | Mock de APIs externas se necessario |

## Estrutura de Pastas

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── utils.test.ts           # Helpers gerais
│   │   └── validators.test.ts      # Schemas Zod
│   ├── hooks/
│   │   ├── useFilters.test.ts      # Hook de filtros
│   │   └── useDebounce.test.ts     # Hook de debounce
│   └── components/
│       ├── ListingCard.test.tsx     # Card do anuncio
│       ├── FilterBar.test.tsx       # Barra de filtros
│       └── WhatsAppButton.test.tsx  # Botao WhatsApp
│
├── integration/
│   ├── api/
│   │   ├── listings.test.ts        # CRUD de anuncios via API
│   │   ├── auth.test.ts            # Autenticacao
│   │   └── upload.test.ts          # Upload de imagens
│   ├── actions/
│   │   ├── createListing.test.ts   # Server Action de criar anuncio
│   │   ├── updateListing.test.ts   # Server Action de editar
│   │   └── registerClinic.test.ts  # Server Action de cadastro
│   └── db/
│       ├── listings.test.ts        # Queries de listagem com filtros
│       └── seed.test.ts            # Verificar seed roda corretamente
│
├── e2e/
│   ├── auth.spec.ts                # Fluxo de cadastro e login
│   ├── create-listing.spec.ts      # Clinica cria anuncio completo
│   ├── marketplace.spec.ts         # Navegacao, filtros, paginacao
│   ├── listing-detail.spec.ts      # Visualizar anuncio + CTA WhatsApp
│   ├── admin-moderation.spec.ts    # Admin aprova/rejeita anuncio
│   └── mobile.spec.ts              # Fluxos criticos no mobile viewport
│
├── fixtures/
│   ├── listings.ts                 # Dados fake de anuncios
│   ├── clinics.ts                  # Dados fake de clinicas
│   ├── users.ts                    # Usuarios de teste (clinica, admin)
│   └── images.ts                   # Imagens de teste (placeholder)
│
├── helpers/
│   ├── db.ts                       # Setup/teardown do banco de teste
│   ├── auth.ts                     # Helper para autenticar em testes
│   └── render.ts                   # Wrapper de render com providers
│
└── CONTEXT.md                      # Este arquivo de contexto
```

## Cobertura por Funcionalidade

### 1. Autenticacao
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Cadastro clinica | E2E | ALTA | Clinica se cadastra com email/senha e dados da clinica |
| Login | E2E | ALTA | Login com credenciais validas redireciona para /painel |
| Login invalido | Integration | ALTA | Credenciais erradas retornam erro adequado |
| Protecao de rota | Integration | ALTA | /painel/* redireciona para /login sem sessao |
| Admin-only | Integration | ALTA | /admin/* retorna 403 para role CLINIC |
| Logout | E2E | MEDIA | Logout limpa sessao e redireciona |
| Validacao campos | Unit | MEDIA | Schema Zod valida email, senha, whatsapp |

### 2. CRUD de Anuncios
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Criar anuncio | E2E | ALTA | Formulario completo cria anuncio com status DRAFT |
| Editar anuncio | E2E | ALTA | Clinica edita seu proprio anuncio |
| Excluir anuncio | Integration | ALTA | Delete remove anuncio e imagens associadas |
| Upload foto | Integration | ALTA | Upload aceita JPEG/PNG/WebP ate 5MB |
| Upload rejeitado | Integration | MEDIA | Rejeita arquivo >5MB ou tipo invalido |
| Publicar anuncio | Integration | ALTA | Muda status para PENDING (com validacao de campos obrigatorios) |
| Validacao campos | Unit | ALTA | Zod schema valida title, description, whatsapp, etc. |
| Slug unico | Integration | MEDIA | Slug auto-gerado e unico mesmo com titulos iguais |

### 3. Marketplace (Listagem + Filtros)
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Listagem basica | E2E | ALTA | Pagina exibe cards de anuncios publicados |
| Filtro cidade | Integration | ALTA | Filtra por cidade retorna apenas anuncios daquela cidade |
| Filtro especialidade | Integration | ALTA | Filtra por especialidade via join |
| Filtros combinados | Integration | ALTA | Cidade + especialidade + equipamento simultaneos |
| Paginacao | Integration | MEDIA | Navegar entre paginas funciona |
| Filtro sem resultado | E2E | MEDIA | Exibe mensagem amigavel quando nao ha resultados |
| Apenas publicados | Integration | ALTA | Listagem NAO mostra DRAFT, PENDING, REJECTED |

### 4. Pagina de Detalhe
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Dados completos | E2E | ALTA | Exibe titulo, descricao, fotos, especialidades, equipamentos |
| Galeria fotos | E2E | MEDIA | Galeria funciona (navegacao entre fotos) |
| Botao WhatsApp | E2E | ALTA | Botao abre WhatsApp com mensagem pre-preenchida |
| URL WhatsApp | Unit | ALTA | Funcao gera URL correta com encoding |
| SEO meta tags | Integration | MEDIA | Pagina tem title, description, og:image corretos |

### 5. Admin
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Listar pendentes | Integration | ALTA | Admin ve anuncios com status PENDING |
| Aprovar anuncio | Integration | ALTA | Mudar status para PUBLISHED |
| Rejeitar anuncio | Integration | ALTA | Mudar status para REJECTED |
| Bloquear clinica | Integration | MEDIA | Bloquear clinica desativa todos seus anuncios |
| Dashboard stats | Integration | BAIXA | Contadores de clinicas, anuncios, pendentes |

### 6. Responsividade (Mobile)
| Teste | Tipo | Prioridade | Descricao |
|-------|------|-----------|-----------|
| Home mobile | E2E | ALTA | Hero, busca e cards exibem corretamente no mobile |
| Filtros mobile | E2E | ALTA | Filtros funcionam e sao usaveis no mobile |
| Formulario mobile | E2E | MEDIA | Formulario de anuncio e usavel no mobile |
| Navegacao mobile | E2E | MEDIA | Menu hamburger funciona |

## Configuracao

### vitest.config.ts (conceitual)
```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/helpers/setup.ts"],
    include: [
      "__tests__/unit/**/*.test.{ts,tsx}",
      "__tests__/integration/**/*.test.{ts,tsx}"
    ],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/components/ui/**"] // shadcn components
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
```

### playwright.config.ts (conceitual)
```typescript
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 14"] } }
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true
  }
})
```

## Scripts npm

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

## Meta de Cobertura (MVP)

| Area | Meta | Justificativa |
|------|------|--------------|
| Validators (Zod schemas) | 100% | Criticos para integridade de dados |
| Utils/Helpers | 90%+ | Funcoes puras, faceis de testar |
| Server Actions | 80%+ | Logica de negocio principal |
| Route Handlers | 80%+ | Endpoints da API |
| Components | 60%+ | Foco em componentes com logica |
| E2E (fluxos criticos) | 100% dos fluxos | Cadastro, login, criar anuncio, buscar, contato WhatsApp |

---

## Changelog
- [2026-03-30] - Estrategia de testes criada para o MVP
