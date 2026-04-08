"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Stethoscope } from "lucide-react"

interface HeroSearchProps {
  cities: string[]
  specialties: { slug: string; name: string }[]
}

export function HeroSearch({ cities, specialties }: HeroSearchProps) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [specialty, setSpecialty] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (specialty) params.set("specialty", specialty)
    router.push(`/anuncios?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
          <select
            value={city}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCity(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl bg-white/10 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 [&>option]:text-foreground"
          >
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
          <select
            value={specialty}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSpecialty(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl bg-white/10 pl-9 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 [&>option]:text-foreground"
          >
            <option value="">Todas as especialidades</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="h-11 gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold sm:w-auto"
        >
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      </div>
    </form>
  )
}
