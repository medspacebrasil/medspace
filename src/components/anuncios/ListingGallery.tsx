"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"

export interface GalleryImage {
  id: string
  url: string
}

/**
 * Galeria do anúncio com visualização ampliada.
 *
 * Dois problemas que isto resolve, relatados pela cliente:
 * 1. a página antiga mostrava só `images.slice(1, 5)` — no máximo 5 fotos, mesmo
 *    com as 10 enviadas. Aqui TODA imagem vira uma miniatura clicável.
 * 2. não havia como ver a foto em tamanho grande. O clique abre um lightbox em
 *    tela cheia, com navegação (setas, teclado) e a imagem inteira (object-contain,
 *    sem cortar).
 */
export function ListingGallery({
  images,
  title,
}: {
  images: GalleryImage[]
  title: string
}) {
  const total = images.length
  const [aberto, setAberto] = useState(false)
  const [atual, setAtual] = useState(0)
  // Portal só depois de montar (o body não existe no SSR).
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const abrir = useCallback((i: number) => {
    setAtual(i)
    setAberto(true)
  }, [])
  const fechar = useCallback(() => setAberto(false), [])
  const anterior = useCallback(
    () => setAtual((i) => (i - 1 + total) % total),
    [total]
  )
  const proxima = useCallback(() => setAtual((i) => (i + 1) % total), [total])

  // Teclado no lightbox: Esc fecha, setas navegam. Só enquanto aberto.
  useEffect(() => {
    if (!aberto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar()
      else if (e.key === "ArrowLeft") anterior()
      else if (e.key === "ArrowRight") proxima()
    }
    window.addEventListener("keydown", onKey)
    // Trava o scroll do fundo enquanto o lightbox está aberto.
    const anteriorOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = anteriorOverflow
    }
  }, [aberto, fechar, anterior, proxima])

  if (total === 0) return null

  return (
    <div className="grid gap-2">
      {/* Foto de capa, grande e clicável */}
      <button
        type="button"
        onClick={() => abrir(0)}
        aria-label="Abrir galeria de fotos"
        className="group relative aspect-video overflow-hidden rounded-lg"
      >
        <Image
          src={images[0].url}
          alt={`${title} - foto 1`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Expand className="h-3.5 w-3.5" />
          Ver fotos{total > 1 ? ` (${total})` : ""}
        </span>
      </button>

      {/* Miniaturas: TODAS as imagens, não apenas as primeiras */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => abrir(i)}
              aria-label={`Abrir foto ${i + 1} em tamanho maior`}
              className="relative aspect-square overflow-hidden rounded-md ring-offset-2 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Image
                src={img.url}
                alt={`${title} - foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 20vw, 120px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox: num portal no body, senão o cabeçalho fixo, o card lateral
          sticky e o banner de cookies (cada um com seu contexto de empilhamento)
          aparecem por cima do overlay. z-[100] fica acima de todos eles. */}
      {aberto && montado && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${atual + 1} de ${total} do anúncio ${title}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={fechar}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm tabular-nums">
              {atual + 1} / {total}
            </span>
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* A imagem inteira, sem corte: object-contain. */}
            <div className="relative h-full w-full">
              <Image
                src={images[atual].url}
                alt={`${title} - foto ${atual + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className="absolute left-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={proxima}
                  aria-label="Próxima foto"
                  className="absolute right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Tira de miniaturas dentro do lightbox, para pular direto */}
          {total > 1 && (
            <div
              className="flex gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setAtual(i)}
                  aria-label={`Ir para a foto ${i + 1}`}
                  aria-current={i === atual}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded ${
                    i === atual ? "ring-2 ring-gold" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${title} - miniatura ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
