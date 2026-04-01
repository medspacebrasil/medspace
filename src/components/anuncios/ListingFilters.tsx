"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface FilterOption {
  id: string
  name: string
  slug: string
}

interface ListingFiltersProps {
  specialties: FilterOption[]
  roomTypes: FilterOption[]
  equipment: FilterOption[]
  cities: string[]
}

export function ListingFilters({
  specialties,
  roomTypes,
  equipment,
  cities,
}: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`/anuncios?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push("/anuncios")
  }, [router])

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4" />
          Filtros
        </h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={searchParams.get("city") ?? ""}
          onChange={(e) => updateFilter("city", e.target.value)}
        >
          <option value="">Todas as cidades</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <Select
          value={searchParams.get("specialty") ?? ""}
          onChange={(e) => updateFilter("specialty", e.target.value)}
        >
          <option value="">Todas as especialidades</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          value={searchParams.get("roomType") ?? ""}
          onChange={(e) => updateFilter("roomType", e.target.value)}
        >
          <option value="">Todos os tipos de sala</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.slug}>
              {rt.name}
            </option>
          ))}
        </Select>

        <Select
          value={searchParams.get("equipment") ?? ""}
          onChange={(e) => updateFilter("equipment", e.target.value)}
        >
          <option value="">Todos os equipamentos</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.slug}>
              {eq.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
