# src/ - Context

## Visao Geral
Diretorio raiz de todo o codigo-fonte da aplicacao.

## Estrutura
```
src/
├── app/           # Next.js App Router (rotas, layouts, API)
├── components/    # Componentes React reutilizaveis
├── lib/           # Configuracoes, utilitarios, acesso a dados
├── hooks/         # Custom React hooks
└── types/         # TypeScript types e interfaces globais
```

## Path Alias
`@/` aponta para `src/`. Configurado no `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Uso: `import { prisma } from "@/lib/db"`

## Contextos de cada subpasta
- [app/CONTEXT.md](app/CONTEXT.md) - Rotas e paginas
- [components/CONTEXT.md](components/CONTEXT.md) - Componentes UI
- [lib/CONTEXT.md](lib/CONTEXT.md) - Logica de negocio e configs
- [hooks/CONTEXT.md](hooks/CONTEXT.md) - Hooks customizados
- [types/CONTEXT.md](types/CONTEXT.md) - Tipos TypeScript

---
## Changelog
- [2026-03-30] - Context criado
