# MEDSPACE - Modelo de Dados

## Diagrama de Entidades

```
┌─────────────┐       ┌─────────────────┐       ┌───────────────┐
│    User      │ 1───1 │     Clinic      │ 1───N │   Listing     │
├─────────────┤       ├─────────────────┤       ├───────────────┤
│ id           │       │ id              │       │ id            │
│ email        │       │ userId          │       │ clinicId      │
│ passwordHash │       │ name            │       │ title         │
│ role         │       │ phone           │       │ description   │
│ createdAt    │       │ whatsapp        │       │ fullDescription│
│ updatedAt    │       │ city            │       │ roomTypeId    │
└─────────────┘       │ neighborhood    │       │ city          │
                       │ createdAt       │       │ neighborhood  │
                       │ updatedAt       │       │ whatsapp      │
                       └─────────────────┘       │ status        │
                                                  │ slug          │
                                                  │ createdAt     │
                                                  │ updatedAt     │
                                                  └───────┬───────┘
                                                          │
                           ┌──────────────────────────────┼──────────────┐
                           │                              │              │
                  ┌────────▼────────┐          ┌──────────▼───┐  ┌───────▼──────┐
                  │ ListingImage    │          │ N:N Tables   │  │   RoomType   │
                  ├─────────────────┤          │              │  ├──────────────┤
                  │ id              │          │ listing_     │  │ id           │
                  │ listingId       │          │ specialty    │  │ name         │
                  │ url             │          │              │  │ slug         │
                  │ order           │          │ listing_     │  └──────────────┘
                  │ createdAt       │          │ equipment    │
                  └─────────────────┘          └──────────────┘

┌───────────────┐       ┌───────────────┐
│  Specialty    │       │  Equipment    │
├───────────────┤       ├───────────────┤
│ id            │       │ id            │
│ name          │       │ name          │
│ slug          │       │ slug          │
└───────────────┘       └───────────────┘
```

## Prisma Schema (conceitual)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// AUTENTICACAO
// ============================================

enum Role {
  CLINIC
  ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         Role     @default(CLINIC)
  clinic       Clinic?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

// ============================================
// CLINICA
// ============================================

model Clinic {
  id           String    @id @default(cuid())
  userId       String    @unique @map("user_id")
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  phone        String?
  whatsapp     String
  city         String
  neighborhood String
  description  String?
  listings     Listing[]
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("clinics")
}

// ============================================
// ANUNCIO
// ============================================

enum ListingStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
  ARCHIVED
}

model Listing {
  id              String        @id @default(cuid())
  clinicId        String        @map("clinic_id")
  clinic          Clinic        @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  title           String
  slug            String        @unique
  description     String        @db.VarChar(300)
  fullDescription String?       @map("full_description") @db.Text
  roomTypeId      String?       @map("room_type_id")
  roomType        RoomType?     @relation(fields: [roomTypeId], references: [id])
  city            String
  neighborhood    String
  whatsapp        String
  status          ListingStatus @default(DRAFT)
  images          ListingImage[]
  specialties     ListingSpecialty[]
  equipment       ListingEquipment[]
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@index([city])
  @@index([neighborhood])
  @@index([status])
  @@index([clinicId])
  @@map("listings")
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("listing_images")
}

// ============================================
// TAXONOMIAS (Lookup Tables)
// ============================================

model Specialty {
  id       String             @id @default(cuid())
  name     String             @unique
  slug     String             @unique
  listings ListingSpecialty[]

  @@map("specialties")
}

model Equipment {
  id       String             @id @default(cuid())
  name     String             @unique
  slug     String             @unique
  listings ListingEquipment[]

  @@map("equipment")
}

model RoomType {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  listings Listing[]

  @@map("room_types")
}

// ============================================
// TABELAS DE JUNCAO (N:N)
// ============================================

model ListingSpecialty {
  listingId   String    @map("listing_id")
  specialtyId String    @map("specialty_id")
  listing     Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  specialty   Specialty @relation(fields: [specialtyId], references: [id], onDelete: Cascade)

  @@id([listingId, specialtyId])
  @@map("listing_specialties")
}

model ListingEquipment {
  listingId   String    @map("listing_id")
  equipmentId String    @map("equipment_id")
  listing     Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@id([listingId, equipmentId])
  @@map("listing_equipment")
}
```

## Dados Seed (Iniciais)

### Especialidades
- Cardiologia, Dermatologia, Endocrinologia, Gastroenterologia
- Ginecologia, Neurologia, Oftalmologia, Ortopedia
- Otorrinolaringologia, Pediatria, Psiquiatria, Urologia
- Odontologia, Fisioterapia, Nutricao, Psicologia

### Tipos de Sala
- Consultorio, Sala de procedimento, Sala cirurgica
- Sala de exames, Sala compartilhada

### Equipamentos
- Maca, Cadeira odontologica, Autoclave, Negatoscopio
- Ultrassom, Eletrocardiografo, Dermatoscopio
- Oftalmoscopio, Otoscopio, Balanca digital
- Ar condicionado, Wi-Fi, Recepcionista, Estacionamento

## Regras de Negocio (Validacao)

| Campo | Regra |
|-------|-------|
| email | Unico, formato valido |
| password | Minimo 8 caracteres |
| title | 5-120 caracteres |
| description | Ate 300 caracteres |
| whatsapp | Formato brasileiro (DDDnumero, 10-11 digitos) |
| city | Obrigatorio |
| neighborhood | Obrigatorio |
| specialties | Minimo 1 |
| images | Minimo 1 para publicar (PUBLISHED) |
| status | DRAFT pode ser salvo sem imagens |
| slug | Auto-gerado a partir do titulo, unico |

## Indices para Performance

Os indices ja estao declarados no schema Prisma acima:
- `listings.city` - Filtro por cidade
- `listings.neighborhood` - Filtro por bairro
- `listings.status` - Filtro por status (so mostra PUBLISHED no marketplace)
- `listings.clinic_id` - Listagem de anuncios por clinica
- `specialties.slug` / `equipment.slug` / `room_types.slug` - Lookup por slug na URL

## Queries Principais

### Listagem marketplace (com filtros)
```sql
SELECT l.*, c.name as clinic_name
FROM listings l
JOIN clinics c ON l.clinic_id = c.id
LEFT JOIN listing_specialties ls ON l.id = ls.listing_id
LEFT JOIN listing_equipment le ON l.id = le.listing_id
WHERE l.status = 'PUBLISHED'
  AND (l.city = ? OR ? IS NULL)
  AND (l.neighborhood = ? OR ? IS NULL)
  AND (ls.specialty_id = ? OR ? IS NULL)
  AND (le.equipment_id = ? OR ? IS NULL)
  AND (l.room_type_id = ? OR ? IS NULL)
ORDER BY l.created_at DESC
LIMIT 20 OFFSET ?
```

### Detalhe do anuncio (por slug)
```sql
SELECT l.*, c.*, rt.name as room_type_name,
  array_agg(DISTINCT s.name) as specialties,
  array_agg(DISTINCT e.name) as equipment,
  array_agg(DISTINCT li.url ORDER BY li.order) as images
FROM listings l
JOIN clinics c ON l.clinic_id = c.id
LEFT JOIN room_types rt ON l.room_type_id = rt.id
LEFT JOIN listing_specialties ls ON l.id = ls.listing_id
LEFT JOIN specialties s ON ls.specialty_id = s.id
LEFT JOIN listing_equipment le ON l.id = le.listing_id
LEFT JOIN equipment e ON le.equipment_id = e.id
LEFT JOIN listing_images li ON l.id = li.listing_id
WHERE l.slug = ? AND l.status = 'PUBLISHED'
GROUP BY l.id, c.id, rt.name
```

---

## Changelog
- [2026-03-30] - Modelo de dados inicial criado para o MVP
