# Prisma - Context

## O que vai nesta pasta
- `schema.prisma` - Schema declarativo do banco de dados (modelos, relacoes, indices)
- `migrations/` - Historico de migrations versionadas (auto-geradas pelo Prisma)
- `seed.ts` - Script para popular o banco com dados iniciais

## Schema
Ver detalhes completos em [docs/DATABASE.md](../docs/DATABASE.md).

**Modelos:**
- `User` - Usuario autenticado (clinica ou admin)
- `Clinic` - Perfil da clinica (1:1 com User)
- `Listing` - Anuncio de sala/consultorio
- `ListingImage` - Fotos do anuncio
- `Specialty` - Especialidade medica (lookup)
- `Equipment` - Equipamento disponivel (lookup)
- `RoomType` - Tipo de sala (lookup)
- `ListingSpecialty` - Juncao N:N anuncio-especialidade
- `ListingEquipment` - Juncao N:N anuncio-equipamento

## Datasource
- Provider: `postgresql`
- Host: Supabase (sa-east-1)
- Usa `DATABASE_URL` (pooler/pgbouncer para serverless) e `DIRECT_URL` (para migrations)

## Comandos uteis
```bash
npx prisma migrate dev          # Criar/aplicar migration local
npx prisma migrate deploy       # Aplicar migrations em producao
npx prisma generate             # Regenerar client apos mudanca no schema
npx prisma db seed              # Rodar seed
npx prisma studio               # Abrir UI visual do banco
npx prisma db push              # Push direto (sem migration, apenas dev)
```

## Seed
O seed deve popular:
1. Especialidades (16+)
2. Tipos de sala (5)
3. Equipamentos (14+)
4. 1 usuario admin (para testes)
5. Dados fake de clinicas/anuncios (para demo)

---
## Changelog
- [2026-03-30] - Context criado
