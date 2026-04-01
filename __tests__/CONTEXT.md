# __tests__/ - Context

## Descricao
Diretorio raiz de todos os testes da aplicacao.

Ver estrategia completa em [docs/TESTING.md](../docs/TESTING.md).

## Estrutura
```
__tests__/
├── unit/              # Testes unitarios (Vitest)
│   ├── lib/           # Utils, validators, helpers
│   ├── hooks/         # Custom hooks
│   └── components/    # Componentes React (render + assertions)
│
├── integration/       # Testes de integracao (Vitest + Prisma)
│   ├── api/           # Route Handlers
│   ├── actions/       # Server Actions
│   └── db/            # Queries e seeds
│
├── e2e/               # Testes end-to-end (Playwright)
│   ├── auth.spec.ts
│   ├── create-listing.spec.ts
│   ├── marketplace.spec.ts
│   ├── listing-detail.spec.ts
│   ├── admin-moderation.spec.ts
│   └── mobile.spec.ts
│
├── fixtures/          # Dados de teste reutilizaveis
│   ├── listings.ts    # Anuncios fake
│   ├── clinics.ts     # Clinicas fake
│   ├── users.ts       # Usuarios de teste
│   └── images.ts      # Imagens placeholder
│
└── helpers/           # Utilitarios de teste
    ├── db.ts          # Setup/teardown do banco de teste
    ├── auth.ts        # Mock/helper de autenticacao
    └── render.ts      # Wrapper de render com providers (React Testing Library)
```

## Comandos
```bash
npm test              # Roda unit + integration (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Com relatorio de cobertura
npm run test:e2e      # Roda E2E (Playwright, requer app rodando)
npm run test:e2e:ui   # Playwright com UI visual
npm run test:all      # Roda tudo
```

## Convencoes
- Arquivos de teste: `NomeDoArquivo.test.ts(x)` (unit/integration) ou `nome.spec.ts` (e2e)
- Fixtures: dados constantes, sem side effects
- Helpers: funcoes utilitarias com logica (setup DB, auth mock, etc)
- Cada teste deve ser independente (sem depender de ordem de execucao)
- Testes de integracao usam banco de teste isolado (rollback entre testes)

---
## Changelog
- [2026-03-30] - Context criado
