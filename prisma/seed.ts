import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set for seeding")
}
const adapter = new PrismaPg(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Specialties
  const specialties = [
    "Cardiologia",
    "Dermatologia",
    "Endocrinologia",
    "Gastroenterologia",
    "Ginecologia",
    "Neurologia",
    "Oftalmologia",
    "Ortopedia",
    "Otorrinolaringologia",
    "Pediatria",
    "Psiquiatria",
    "Urologia",
    "Nutrologia",
    "Pneumologia",
    "Reumatologia",
    "Radiologia e Diagnóstico por Imagem",
    "Genética Médica",
    "Ginecologia e Obstetrícia",
    "Clínica Médica",
    "Mastologia",
    "Nefrologia",
    "Hematologia",
    "Infectologia",
    "Geriatria",
    "Alergia e Imunologia",
    "Oncologia",
    "Cirurgia Geral",
    "Cirurgia Plástica",
    "Cirurgia Vascular",
    "Medicina do Trabalho",
    "Medicina Esportiva",
    "Medicina de Família e Comunidade",
    "Anestesiologia",
  ]

  // Remove deprecated specialties
  await prisma.specialty.deleteMany({
    where: { slug: { in: ["odontologia", "psicologia", "outros"] } },
  })

  for (const name of specialties) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
    await prisma.specialty.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`  ✓ ${specialties.length} specialties`)

  // Room Types
  const roomTypes = [
    "Consultório",
    "Sala de procedimento",
    "Sala cirúrgica",
    "Sala de exames",
    "Sala compartilhada",
  ]

  for (const name of roomTypes) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
    await prisma.roomType.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`  ✓ ${roomTypes.length} room types`)

  // Equipment (recursos disponíveis nas clínicas - amenities)
  const equipmentItems = [
    "Estacionamento no local (gratuito)",
    "Estacionamento no local (pago)",
    "Recepcionista",
    "Manobrista",
    "Prontuário eletrônico",
    "Computador",
    "Wi-Fi",
    "Impressora",
    "Maca",
    "Poltrona de estética",
  ]

  // Remove deprecated equipment items (replaced or moved to separate "Aparelhos" catalog)
  await prisma.equipment.deleteMany({
    where: {
      slug: {
        in: [
          "cadeira-odontologica",
          "autoclave",
          "negatoscopio",
          "ultrassom",
          "eletrocardiografo",
          "dermatoscopio",
          "oftalmoscopio",
          "otoscopio",
          "balanca-digital",
          "ar-condicionado",
          "bioimpedancia",
          "estacionamento",
        ],
      },
    },
  })

  for (const name of equipmentItems) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
    await prisma.equipment.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`  ✓ ${equipmentItems.length} equipment items`)

  // Admin user
  const adminPassword = await hash("admin123456", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@medspace.com.br" },
    update: {},
    create: {
      email: "admin@medspace.com.br",
      passwordHash: adminPassword,
      name: "Admin MedSpace",
      role: "ADMIN",
    },
  })
  console.log(`  ✓ Admin user: admin@medspace.com.br / admin123456`)

  // Demo clinic
  const clinicPassword = await hash("clinica123456", 12)
  const demoUser = await prisma.user.upsert({
    where: { email: "clinica@demo.com" },
    update: {},
    create: {
      email: "clinica@demo.com",
      passwordHash: clinicPassword,
      name: "Dr. Maria Silva",
      role: "CLINIC",
      clinic: {
        create: {
          name: "Clínica Saúde Total",
          whatsapp: "11999998888",
          phone: "1133334444",
          city: "São Paulo",
          neighborhood: "Centro",
          description:
            "Clínica moderna no coração de São Paulo, com equipamentos de última geração.",
        },
      },
    },
  })
  console.log(`  ✓ Demo clinic: clinica@demo.com / clinica123456`)

  // Get clinic and taxonomies for demo listing
  const clinic = await prisma.clinic.findUnique({
    where: { userId: demoUser.id },
  })
  const cardio = await prisma.specialty.findUnique({
    where: { slug: "cardiologia" },
  })
  const dermato = await prisma.specialty.findUnique({
    where: { slug: "dermatologia" },
  })
  const consultorio = await prisma.roomType.findUnique({
    where: { slug: "consultorio" },
  })
  const wifi = await prisma.equipment.findUnique({ where: { slug: "wi-fi" } })
  const ar = await prisma.equipment.findUnique({
    where: { slug: "ar-condicionado" },
  })

  if (clinic && cardio && dermato && consultorio && wifi && ar) {
    await prisma.listing.upsert({
      where: { slug: "consultorio-equipado-centro-sp" },
      update: {},
      create: {
        clinicId: clinic.id,
        title: "Consultório Equipado - Centro SP",
        slug: "consultorio-equipado-centro-sp",
        description:
          "Sala ampla com ar condicionado, Wi-Fi e recepcionista. Ideal para cardiologistas e dermatologistas.",
        fullDescription:
          "Consultório totalmente equipado no centro de São Paulo.\n\nDispomos de uma sala ampla (25m²) com ótima iluminação natural, ar condicionado split, Wi-Fi de alta velocidade e serviço de recepcionista.\n\nIdeal para médicos que buscam um espaço profissional e bem localizado para atendimentos.\n\nHorários disponíveis: segunda a sexta, das 8h às 20h.\nSábados: das 8h às 14h.",
        city: "São Paulo",
        neighborhood: "Centro",
        whatsapp: "11999998888",
        roomTypeId: consultorio.id,
        status: "PUBLISHED",
        specialties: {
          create: [
            { specialtyId: cardio.id },
            { specialtyId: dermato.id },
          ],
        },
        equipment: {
          create: [{ equipmentId: wifi.id }, { equipmentId: ar.id }],
        },
      },
    })
    console.log(`  ✓ Demo listing created`)
  }

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
