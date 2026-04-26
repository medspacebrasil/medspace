"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function AdminListingsSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("q", value.trim())
    } else {
      params.delete("q")
    }
    params.delete("page")
    startTransition(() => {
      router.push(`/admin/anuncios?${params.toString()}`)
    })
  }

  function clear() {
    setValue("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("page")
    startTransition(() => {
      router.push(`/admin/anuncios?${params.toString()}`)
    })
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-md items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar por título, clínica ou cidade..."
          className="pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Limpar busca"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        Buscar
      </Button>
    </form>
  )
}
