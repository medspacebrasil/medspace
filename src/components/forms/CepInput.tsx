"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"

interface CepData {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface CepInputProps {
  defaultCity?: string
  defaultNeighborhood?: string
  defaultState?: string
  defaultCep?: string
}

export function CepInput({ defaultCity, defaultNeighborhood, defaultState, defaultCep }: CepInputProps) {
  const [cep, setCep] = useState(defaultCep ?? "")
  const [city, setCity] = useState(defaultCity ?? "")
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood ?? "")
  const [uf, setUf] = useState(defaultState ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    if (digits.length > 5) {
      return digits.slice(0, 5) + "-" + digits.slice(5)
    }
    return digits
  }

  async function lookupCep() {
    const digits = cep.replace(/\D/g, "")
    if (digits.length !== 8) {
      setError("CEP deve ter 8 dígitos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: CepData = await res.json()

      if (data.erro) {
        setError("CEP não encontrado")
        return
      }

      setCity(data.localidade)
      setNeighborhood(data.bairro || "")
      setUf(data.uf)
    } catch {
      setError("Erro ao buscar CEP. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input type="hidden" name="state" value={uf} />
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <div className="flex gap-2">
          <Input
            id="cep"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                lookupCep()
              }
            }}
            placeholder="00000-000"
            maxLength={9}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={lookupCep}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            name="city"
            value={city}
            readOnly
            placeholder="Busque pelo CEP"
            required
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            name="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder={city ? "Digite o bairro" : "Busque pelo CEP"}
            required
          />
          {uf && (
            <p className="text-xs text-muted-foreground">Estado: {uf}</p>
          )}
        </div>
      </div>
    </>
  )
}
