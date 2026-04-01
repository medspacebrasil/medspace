# MEDSPACE - Guia de Deploy

## Infraestrutura

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                         │
│  ┌───────────────────────────────────────────┐  │
│  │  Next.js 16 (Serverless Functions)        │  │
│  │  - SSR / RSC / API Routes                 │  │
│  │  - Edge Middleware (auth check)            │  │
│  │  - Static assets (CDN global)             │  │
│  └───────────────────────────────────────────┘  │
│  Domain: medspace.com.br (ou alternativo)       │
│  SSL: automatico                                │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌─────────▼────────┐
│   SUPABASE      │    │   SUPABASE       │
│   PostgreSQL    │    │   Storage        │
│   (Free Tier)   │    │   (Free Tier)    │
│   500MB         │    │   1GB            │
└─────────────────┘    └──────────────────┘
```

## Custos Estimados (MVP)

| Servico | Plano | Custo Mensal | Limites |
|---------|-------|-------------|---------|
| Vercel | Hobby (free) | R$ 0 | 100GB bandwidth, serverless functions |
| Supabase | Free Tier | R$ 0 | 500MB DB, 1GB storage, 50k auth MAU |
| Dominio | .com.br | ~R$ 40/ano | Registro.br |
| **Total MVP** | | **~R$ 3/mes** | (apenas dominio rateado) |

### Upgrade quando necessario
| Servico | Plano Pro | Custo |
|---------|-----------|-------|
| Vercel | Pro | ~$20/mes |
| Supabase | Pro | $25/mes |

## Setup Supabase

### 1. Criar projeto
1. Acessar supabase.com e criar conta
2. Criar novo projeto (regiao: sa-east-1 / Sao Paulo)
3. Anotar: Project URL, anon key, service role key, database password

### 2. Configurar banco
```bash
# Connection string (usar no .env.local)
# Pooler (para serverless - recomendado para Vercel)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct (para migrations)
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Configurar Storage
1. No painel Supabase, ir em Storage
2. Criar bucket `listings` (publico)
3. Configurar policy:
   - SELECT: publico (qualquer um pode ver imagens)
   - INSERT: autenticado (via service role key no backend)
   - DELETE: autenticado (via service role key no backend)

### 4. Rodar migrations
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Setup Vercel

### 1. Conectar repositorio
1. Acessar vercel.com
2. Import Git Repository
3. Selecionar o repositorio do MEDSPACE
4. Framework: Next.js (detectado automaticamente)

### 2. Variaveis de ambiente
Configurar em Vercel > Settings > Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth.js
AUTH_SECRET=gerar-com-openssl
AUTH_URL=https://medspace.com.br

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# App
NEXT_PUBLIC_APP_URL=https://medspace.com.br
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE=Ola, vi seu anuncio no MedSpace e tenho interesse!
```

### 3. Configurar dominio
1. Em Vercel > Settings > Domains
2. Adicionar `medspace.com.br` (ou alternativo)
3. Configurar DNS no Registro.br apontando para Vercel
4. SSL sera provisionado automaticamente

### 4. Build settings
- Build Command: `npx prisma generate && next build`
- Output Directory: `.next`
- Install Command: `npm install`

## Ambientes

| Ambiente | Branch | URL | Banco |
|----------|--------|-----|-------|
| Production | `main` | medspace.com.br | Supabase prod |
| Preview | PRs / branches | preview-xxx.vercel.app | Supabase prod (cuidado) |
| Local | - | localhost:3000 | Supabase dev (ou local Docker) |

### Recomendacao: banco separado para dev
Para desenvolvimento local seguro, considerar:
1. Docker Compose com PostgreSQL local
2. Ou criar segundo projeto no Supabase (free tier permite ate 2)

## Checklist de Lancamento

### Pre-deploy
- [ ] Todas as variaveis de ambiente configuradas na Vercel
- [ ] Migrations rodadas no banco de producao
- [ ] Seed executado (especialidades, tipos de sala, equipamentos)
- [ ] Usuario admin criado manualmente no banco
- [ ] Imagens dos logos uploadadas para public/
- [ ] Favicon configurado
- [ ] Meta tags (og:image, description) configuradas
- [ ] CORS e CSP headers revisados

### Deploy
- [ ] Push para `main` dispara build automatico na Vercel
- [ ] Verificar build logs na Vercel
- [ ] Verificar que o site esta acessivel

### Pos-deploy
- [ ] Testar fluxo de cadastro de clinica
- [ ] Testar criacao de anuncio com upload de fotos
- [ ] Testar filtros no marketplace
- [ ] Testar botao WhatsApp (mobile e desktop)
- [ ] Testar responsividade em dispositivo real
- [ ] Verificar que admin consegue moderar anuncios
- [ ] Configurar monitoramento (Vercel Analytics / Supabase Dashboard)

## Monitoramento

| O que | Ferramenta | Como |
|-------|-----------|------|
| Erros frontend | Vercel (built-in) | Dashboard > Logs |
| Performance | Vercel Analytics | Metricas de Core Web Vitals |
| Banco de dados | Supabase Dashboard | Queries, storage, auth |
| Uptime | UptimeRobot (free) | Ping a cada 5 min |
| WhatsApp clicks | Event tracking | Custom analytics no botao |

## Rollback

Em caso de problema em producao:
1. **Vercel:** Ir em Deployments, selecionar deploy anterior, clicar "Promote to Production"
2. **Banco:** Migrations nao tem rollback automatico. Para reversao, criar migration reversa manual.
3. **Storage:** Imagens no Supabase nao sao versionadas. Backups manuais se necessario.

---

## Changelog
- [2026-03-30] - Guia de deploy criado para o MVP
