import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

// Cache durations (seconds)
const TAXONOMY_TTL = 60 * 5 // 5 minutes — taxonomies almost never change at runtime
const LISTING_TTL = 60 // 1 minute — listings change more often (edits, new posts, admin actions)

// ============================================
// TAXONOMIES (Specialty, RoomType, Equipment, EquipmentCategory)
// ============================================

export const getCachedSpecialties = unstable_cache(
  async () => {
    return prisma.specialty.findMany({ orderBy: { name: "asc" } })
  },
  ["specialties:all"],
  { revalidate: TAXONOMY_TTL, tags: ["taxonomies"] }
)

export const getCachedTopSpecialties = unstable_cache(
  async (take: number) => {
    return prisma.specialty.findMany({ orderBy: { name: "asc" }, take })
  },
  ["specialties:top"],
  { revalidate: TAXONOMY_TTL, tags: ["taxonomies"] }
)

export const getCachedRoomTypes = unstable_cache(
  async () => {
    return prisma.roomType.findMany({ orderBy: { name: "asc" } })
  },
  ["roomTypes:all"],
  { revalidate: TAXONOMY_TTL, tags: ["taxonomies"] }
)

export const getCachedEquipment = unstable_cache(
  async () => {
    return prisma.equipment.findMany({ orderBy: { name: "asc" } })
  },
  ["equipment:all"],
  { revalidate: TAXONOMY_TTL, tags: ["taxonomies"] }
)

export const getCachedEquipmentCategories = unstable_cache(
  async () => {
    return prisma.equipmentCategory.findMany({ orderBy: { name: "asc" } })
  },
  ["equipmentCategories:all"],
  { revalidate: TAXONOMY_TTL, tags: ["taxonomies"] }
)

// ============================================
// LISTINGS — public, published, type=CLINIC
// ============================================

export const getCachedPublishedClinicCities = unstable_cache(
  async () => {
    return prisma.listing.findMany({
      where: { status: "PUBLISHED", type: "CLINIC" },
      select: { city: true, state: true },
      distinct: ["city", "state"],
      orderBy: { city: "asc" },
    })
  },
  ["listings:cities:clinic"],
  { revalidate: TAXONOMY_TTL, tags: ["listings"] }
)

export const getCachedFeaturedClinicListings = unstable_cache(
  async (take: number) => {
    return prisma.listing.findMany({
      where: { status: "PUBLISHED", type: "CLINIC", featured: true },
      include: {
        clinic: true,
        roomType: true,
        specialties: { include: { specialty: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take,
    })
  },
  ["listings:featured:clinic"],
  { revalidate: LISTING_TTL, tags: ["listings"] }
)

export const getCachedClinicListingsPage = unstable_cache(
  async (
    where: Prisma.ListingWhereInput,
    sort: "recent" | "oldest",
    skip: number,
    take: number
  ) => {
    return prisma.listing.findMany({
      where,
      include: {
        clinic: true,
        roomType: true,
        specialties: { include: { specialty: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      },
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip,
      take,
    })
  },
  ["listings:page:clinic"],
  { revalidate: LISTING_TTL, tags: ["listings"] }
)

export const getCachedClinicListingsCount = unstable_cache(
  async (where: Prisma.ListingWhereInput) => {
    return prisma.listing.count({ where })
  },
  ["listings:count:clinic"],
  { revalidate: LISTING_TTL, tags: ["listings"] }
)

export const getCachedClinicListingBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.listing.findFirst({
      where: { slug, status: "PUBLISHED", type: "CLINIC" },
      include: {
        clinic: true,
        roomType: true,
        specialties: { include: { specialty: true } },
        equipment: { include: { equipment: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }] },
      },
    })
  },
  ["listings:bySlug:clinic"],
  { revalidate: LISTING_TTL, tags: ["listings"] }
)
