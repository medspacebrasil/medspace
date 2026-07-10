"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { onlyDigits } from "@/lib/validators"
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
  // Last CEP a lookup was started for — dedupes the automatic trigger and
  // marks stale responses (latest lookup wins when two fetches race).
  const lastLookup = useRef(defaultCity ? onlyDigits(defaultCep ?? "") : "")
  // Monotonic id per request so out-of-order responses can be discarded.
  const reqSeq = useRef(0)

  function formatCep(value: string) {
    const digits = onlyDigits(value).slice(0, 8)
    if (digits.length > 5) {
      return digits.slice(0, 5) + "-" + digits.slice(5)
    }
    return digits
  }

  async function lookupCep(rawCep: string, opts?: { auto?: boolean }) {
    const digits = onlyDigits(rawCep)
    if (digits.length !== 8) {
      // Automatic triggers stay silent while the user is still typing.
      if (!opts?.auto) setError("CEP deve ter 8 dígitos")
      return
    }
    // Skip when this CEP was already looked up automatically, or when the
    // same CEP is being fetched right now (e.g. Enter right after the 8th
    // digit triggered the automatic lookup).
    if ((opts?.auto || loading) && lastLookup.current === digits) return
    lastLookup.current = digits
    const reqId = ++reqSeq.current

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: CepData = await res.json()
      if (reqId !== reqSeq.current) return // a newer lookup superseded this one

      if (data.erro) {
        setError("CEP não encontrado")
        return
      }

      setCity(data.localidade)
      setUf(data.uf)
      // Automatic lookups must not clobber a neighborhood the user typed
      // (common in edit forms, where the field comes prefilled).
      setNeighborhood((prev) => (!opts?.auto || !prev ? data.bairro || "" : prev))
    } catch {
      if (reqId !== reqSeq.current) return
      // Allow the same CEP to be retried automatically after a network error.
      lastLookup.current = ""
      setError("Erro ao buscar CEP. Tente novamente.")
    } finally {
      if (reqId === reqSeq.current) setLoading(false)
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
            onChange={(e) => {
              const formatted = formatCep(e.target.value)
              setCep(formatted)
              // Look the CEP up as soon as the 8th digit lands: on mobile the
              // keyboard's confirm key submits the form (Enter keydown is not
              // reliable on Android/IME keyboards), so the lookup can't depend
              // on any key press. Covers typing, paste and browser autofill.
              if (onlyDigits(formatted).length === 8) {
                lookupCep(formatted, { auto: true })
              } else if (error) {
                setError("")
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                lookupCep(cep)
              }
            }}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            enterKeyHint="search"
            placeholder="00000-000"
            maxLength={9}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => lookupCep(cep)}
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
