# MEDSPACE - Conectando Medicos e Clinicas

## Sobre o Projeto
Marketplace (estilo OLX) para conectar medicos a clinicas que oferecem salas e equipamentos para uso profissional. MVP focado em validacao de demanda com geracao de leads via WhatsApp (sem checkout nesta fase).

**Cliente:** Cejana H.
**Marca:** MEDSPACE - "Conectando Medicos e Clinicas"
**Dominio alvo:** medspace.com.br (verificar disponibilidade)

---

## Indice de Documentacao

### Documentos Principais
| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Arquitetura | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Visao geral da arquitetura, stack, decisoes tecnicas |
| Engenharia | [docs/ENGINEERING.md](docs/ENGINEERING.md) | Padroes de codigo, convencoes, workflow de desenvolvimento |
| Banco de Dados | [docs/DATABASE.md](docs/DATABASE.md) | Modelo de dados, entidades, relacionamentos, Prisma schema |
| API | [docs/API.md](docs/API.md) | Rotas da API, Server Actions, endpoints |
| Testes | [docs/TESTING.md](docs/TESTING.md) | Estrategia de testes, cobertura, ferramentas |
| Deploy | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Configuracao Supabase, Vercel, variaveis de ambiente |

### Context MDs por Area
| Area | Caminho | O que encontrar |
|------|---------|-----------------|
| Prisma | [prisma/CONTEXT.md](prisma/CONTEXT.md) | Schema do banco, migrations, seeds |
| Public | [public/CONTEXT.md](public/CONTEXT.md) | Assets estaticos, imagens, favicons |
| App (geral) | [src/app/CONTEXT.md](src/app/CONTEXT.md) | Estrutura de rotas, layouts, middlewares |
| Auth pages | [src/app/(auth)/CONTEXT.md](src/app/(auth)/CONTEXT.md) | Login, cadastro, recuperacao de senha |
| Public pages | [src/app/(public)/CONTEXT.md](src/app/(public)/CONTEXT.md) | Home, marketplace, pagina de anuncio |
| Painel clinica | [src/app/painel/CONTEXT.md](src/app/painel/CONTEXT.md) | Dashboard da clinica, CRUD de anuncios |
| Admin | [src/app/admin/CONTEXT.md](src/app/admin/CONTEXT.md) | Painel administrativo, moderacao |
| API routes | [src/app/api/CONTEXT.md](src/app/api/CONTEXT.md) | Route Handlers, endpoints REST |
| Componentes | [src/components/CONTEXT.md](src/components/CONTEXT.md) | UI components, shadcn, layout, forms |
| Lib | [src/lib/CONTEXT.md](src/lib/CONTEXT.md) | Auth config, DB client, utils, validators |
| Hooks | [src/hooks/CONTEXT.md](src/hooks/CONTEXT.md) | Custom React hooks |
| Types | [src/types/CONTEXT.md](src/types/CONTEXT.md) | TypeScript types e interfaces |
| Testes | [__tests__/CONTEXT.md](__tests__/CONTEXT.md) | Estrutura de testes, fixtures, helpers |

### Documentos de Referencia (somente leitura)
| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Guia original | [GUIDE.md](GUIDE.md) | Brief original do projeto |
| Conversa cliente | [Marketplace para consultorios medicos.txt](Marketplace%20para%20consultórios%20médicos.txt) | Historico de conversas com a cliente |

### Logos
- [6106d1d5-82f0-4f36-b6f7-882829f0de70.png](6106d1d5-82f0-4f36-b6f7-882829f0de70.png) - Logo fundo escuro (azul marinho + dourado)
- [ce96abd8-cb67-4160-a1c0-7cf9ff354ca3.png](ce96abd8-cb67-4160-a1c0-7cf9ff354ca3.png) - Logo fundo claro (rosa claro + dourado)

---

## Stack Tecnica
- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Banco:** PostgreSQL 18 (Supabase)
- **ORM:** Prisma
- **Auth:** Auth.js (NextAuth v5)
- **Storage:** Supabase Storage (S3-compatible)
- **Deploy:** Vercel (web) + Supabase (Postgres + Storage)

## Convencoes
- Back-end dentro do proprio Next.js (Route Handlers + Server Actions)
- Mobile-first design
- Portugues para conteudo do usuario, ingles para codigo
- Nomes de rotas em portugues (ex: /anuncios, /painel)

## Controle de Atualizacoes
Sempre que um MD for atualizado, adicionar entrada no final do arquivo:
```
## Changelog
- [DATA] - Descricao da mudanca
```
