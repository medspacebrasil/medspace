"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, type ChangeEvent } from "react"
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
  states: { state: string; cities: string[] }[]
}

export function ListingFilters({
  specialties,
  roomTypes,
  equipment,
  states,
}: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedState, setSelectedState] = useState(searchParams.get("state") ?? "")

  const citiesForState = states.find((s) => s.state === selectedState)?.cities ?? []

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
    setSelectedState("")
    router.push("/anuncios")
  }, [router])

  const hasFilters = searchParams.toString().length > 0

  const handleChange = (key: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    updateFilter(key, e.target.value)
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4 text-gold" />
          Filtros
        </h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value)
            const params = new URLSearchParams(searchParams.toString())
            if (e.target.value) {
              params.set("state", e.target.value)
            } else {
              params.delete("state")
            }
            params.delete("city")
            params.delete("page")
            router.push(`/anuncios?${params.toString()}`)
          }}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="">Todos os estados</option>
          {states.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("city") ?? ""}
          onChange={handleChange("city")}
          disabled={!selectedState}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 max-h-60"
        >
          <option value="">{selectedState ? "Todas as cidades" : "Selecione um estado"}</option>
          {citiesForState.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("specialty") ?? ""}
          onChange={handleChange("specialty")}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="">Todas as especialidades</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("roomType") ?? ""}
          onChange={handleChange("roomType")}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="">Todos os tipos de sala</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.slug}>
              {rt.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("equipment") ?? ""}
          onChange={handleChange("equipment")}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="">Todos os equipamentos</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.slug}>
              {eq.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
