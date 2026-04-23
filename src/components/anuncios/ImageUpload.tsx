"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Star } from "lucide-react"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MAX_IMAGES = 10

interface ListingImage {
  id: string
  url: string
  order: number
  isCover: boolean
}

interface ImageUploadProps {
  listingId: string
  initialImages: ListingImage[]
}

export function ImageUpload({ listingId, initialImages }: ImageUploadProps) {
  const [images, setImages] = useState<ListingImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [settingCover, setSettingCover] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation for faster feedback
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        "Formato não aceito. Envie um arquivo JPEG, PNG ou WebP."
      )
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / 1024 / 1024).toFixed(1)
      setError(
        `Arquivo muito grande (${sizeMb}MB). O tamanho máximo é 5MB.`
      )
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("listingId", listingId)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Erro ao fazer upload")
        return
      }

      const data = await res.json()
      setImages((prev) => [
        ...prev,
        { id: data.id, url: data.url, order: prev.length, isCover: false },
      ])
    } catch {
      setError("Erro de conexão ao fazer upload")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleRemove(imageId: string) {
    if (!confirm("Remover esta foto?")) return

    setRemoving(imageId)
    setError(null)
    try {
      const res = await fetch(`/api/images/${imageId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Erro ao remover foto")
        return
      }
      setImages((prev) => {
        const removed = prev.find((i) => i.id === imageId)
        const next = prev.filter((img) => img.id !== imageId)
        // Mirror the server-side cover promotion
        if (removed?.isCover && next.length > 0) {
          const first = [...next].sort((a, b) => a.order - b.order)[0]
          return next.map((i) => ({ ...i, isCover: i.id === first.id }))
        }
        return next
      })
    } catch {
      setError("Erro de conexão ao remover foto")
    } finally {
      setRemoving(null)
    }
  }

  async function handleSetCover(imageId: string) {
    setSettingCover(imageId)
    setError(null)
    try {
      const res = await fetch("/api/images/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Erro ao definir capa")
        return
      }
      setImages((prev) =>
        prev.map((img) => ({ ...img, isCover: img.id === imageId }))
      )
    } catch {
      setError("Erro de conexão ao definir capa")
    } finally {
      setSettingCover(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">
            Fotos ({images.length}/{MAX_IMAGES})
          </h3>
          <p className="text-xs text-muted-foreground">
            Formatos: JPEG, PNG ou WebP · Máximo 5MB por foto
          </p>
          {images.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Clique na estrela para definir a foto de capa
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_IMAGES}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Enviando..." : "Adicionar Foto"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                img.isCover ? "border-gold" : "border-border"
              }`}
            >
              <Image
                src={img.url}
                alt="Foto do anúncio"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {img.isCover && (
                <div className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-navy shadow">
                  <Star className="h-3 w-3 fill-current" />
                  Capa
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleSetCover(img.id)}
                  disabled={img.isCover || settingCover === img.id}
                  title="Definir como capa"
                  className="rounded-full bg-white/90 p-1.5 text-navy shadow hover:bg-white disabled:opacity-50"
                >
                  {settingCover === img.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Star
                      className={`h-3.5 w-3.5 ${
                        img.isCover ? "fill-gold text-gold" : ""
                      }`}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  disabled={removing === img.id}
                  title="Remover"
                  className="rounded-full bg-white/90 p-1.5 text-destructive shadow hover:bg-white disabled:opacity-50"
                >
                  {removing === img.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md border border-dashed text-muted-foreground">
          <p className="text-sm">Nenhuma foto adicionada</p>
        </div>
      )}
    </div>
  )
}
