"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import {
  SIZES_AMPLIADA,
  ZOOM_CLIQUE,
  ZOOM_INICIAL,
  ZOOM_MAX,
  alternarZoom,
  direcaoDoDeslize,
  escalaDuploClique,
  estaAmpliado,
  limitarDeslocamento,
  mover,
  moverPorTeclado,
  passoZoom,
  pinca,
  seguirPonteiro,
  tamanhoAjustado,
  transformCss,
  type EstadoZoom,
  type InicioPinca,
  type Ponto,
  type Tamanho,
} from "@/lib/gallery/zoom"

export interface GalleryImage {
  id: string
  url: string
}

/** Toque curto (sem arrastar) e janela do duplo toque. */
const TOQUE_MAX_MS = 300
const TOQUE_MAX_PX = 10
const DUPLO_TOQUE_MS = 300
const DUPLO_TOQUE_PX = 40

const FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Gesto =
  | { tipo: "pinca"; inicio: InicioPinca }
  | { tipo: "arrasto"; inicio: Ponto; estado: EstadoZoom; em: number }
  | null

/**
 * Galeria do anúncio com visualização ampliada e lupa.
 *
 * Histórico dos pedidos da cliente:
 * 1. (20/10) a página antiga mostrava só `images.slice(1, 5)`: no máximo 5
 *    fotos, mesmo com as 10 enviadas. Aqui TODA imagem vira miniatura.
 * 2. (20/10) não havia como ver a foto grande: o clique abre um modal em tela
 *    cheia com a foto inteira (object-contain).
 * 3. (17/11) ampliar "como nas lojas grandes": no modal a foto tem lupa. No
 *    computador o clique alterna ajustada/ampliada e a área ampliada segue o
 *    mouse; roda e duplo clique ampliam. No celular, pinça e duplo toque; com
 *    zoom, arrastar move a foto (o deslize de trocar de foto só vale sem zoom).
 *    A matemática está em `src/lib/gallery/zoom.ts`.
 *
 * Resolução: com zoom, uma segunda camada da MESMA foto é montada com
 * `sizes={SIZES_AMPLIADA}` (300vw), o que faz o next/image buscar a largura
 * maior do srcset (até 3840px). Sem isso a foto ampliada seria a de 100vw
 * esticada, borrada.
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

  // --- Estado da lupa ------------------------------------------------------
  const [zoom, setZoom] = useState<EstadoZoom>(ZOOM_INICIAL)
  // Transição só em mudanças "de uma vez" (clique, botões, teclas). Seguindo o
  // mouse, na pinça ou no arrasto ela atrasaria a foto em relação ao dedo.
  const [animar, setAnimar] = useState(true)
  // A camada em alta resolução só é montada depois do primeiro zoom da foto
  // (não baixa a foto grande de quem só olha).
  const [usarAlta, setUsarAlta] = useState(false)
  const [altaCarregada, setAltaCarregada] = useState(false)

  // Refs espelham o estado para os handlers nativos (roda) e os gestos, que
  // não podem depender de closures antigas.
  const zoomRef = useRef<EstadoZoom>(ZOOM_INICIAL)
  const naturalRef = useRef<Tamanho>({ w: 0, h: 0 })
  const palcoRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const fecharRef = useRef<HTMLButtonElement>(null)
  const gatilhoRef = useRef<HTMLElement | null>(null)
  const ponteiros = useRef(new Map<number, Ponto>())
  const gesto = useRef<Gesto>(null)
  const ultimoToque = useRef<{ em: number; p: Ponto } | null>(null)
  const ultimoTipo = useRef<string>("mouse")

  const ampliado = estaAmpliado(zoom)

  const aplicar = useCallback((novo: EstadoZoom, animado: boolean) => {
    zoomRef.current = novo
    setAnimar(animado)
    setZoom(novo)
    if (estaAmpliado(novo)) setUsarAlta(true)
  }, [])

  const zerarZoom = useCallback(() => {
    zoomRef.current = ZOOM_INICIAL
    naturalRef.current = { w: 0, h: 0 }
    gesto.current = null
    ponteiros.current.clear()
    ultimoToque.current = null
    setZoom(ZOOM_INICIAL)
    setAnimar(false)
    setUsarAlta(false)
    setAltaCarregada(false)
  }, [])

  /** Troca de foto SEMPRE zera o zoom. */
  const irPara = useCallback(
    (i: number) => {
      zerarZoom()
      setAtual(((i % total) + total) % total)
    },
    [total, zerarZoom]
  )

  const abrir = useCallback(
    (i: number) => {
      gatilhoRef.current =
        typeof document !== "undefined" ? (document.activeElement as HTMLElement) : null
      zerarZoom()
      setAtual(i)
      setAberto(true)
    },
    [zerarZoom]
  )
  const fechar = useCallback(() => setAberto(false), [])
  const anterior = useCallback(() => irPara(atual - 1), [atual, irPara])
  const proxima = useCallback(() => irPara(atual + 1), [atual, irPara])

  /** Palco e foto ajustada medidos na hora (não precisa de ResizeObserver). */
  const medir = useCallback(() => {
    const r = palcoRef.current?.getBoundingClientRect()
    const palco = { w: r?.width ?? 0, h: r?.height ?? 0 }
    return {
      palco,
      ajustado: tamanhoAjustado(naturalRef.current, palco),
      esquerda: r?.left ?? 0,
      topo: r?.top ?? 0,
    }
  }, [])

  /** Ponto do evento relativo ao CENTRO do palco. */
  const relativo = useCallback(
    (clientX: number, clientY: number): Ponto => {
      const m = medir()
      return {
        x: clientX - m.esquerda - m.palco.w / 2,
        y: clientY - m.topo - m.palco.h / 2,
      }
    },
    [medir]
  )

  const zoomPasso = useCallback(
    (direcao: 1 | -1) => {
      const { ajustado, palco } = medir()
      aplicar(passoZoom(zoomRef.current, direcao, ajustado, palco), true)
    },
    [aplicar, medir]
  )
  const voltarAjustada = useCallback(() => aplicar(ZOOM_INICIAL, true), [aplicar])

  // --- Teclado, foco preso e scroll travado, enquanto aberto ---------------
  useEffect(() => {
    if (!aberto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Tab") {
        prenderFoco(e)
        return
      }
      // Ctrl/Cmd + "+" é o zoom do navegador: não interfere.
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const { ajustado, palco } = medir()
      const z = zoomRef.current
      const amp = estaAmpliado(z)
      const setas: Record<string, Ponto> = {
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
      }
      if (e.key === "Escape") {
        fechar()
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        aplicar(passoZoom(z, 1, ajustado, palco), true)
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        aplicar(passoZoom(z, -1, ajustado, palco), true)
      } else if (e.key === "0") {
        e.preventDefault()
        aplicar(ZOOM_INICIAL, true)
      } else if (e.key in setas) {
        if (amp) {
          // Com zoom, as setas passeiam pela foto ampliada.
          e.preventDefault()
          aplicar(moverPorTeclado(z, setas[e.key], ajustado, palco), true)
        } else if (e.key === "ArrowLeft") {
          anterior()
        } else if (e.key === "ArrowRight") {
          proxima()
        }
      }
    }
    function prenderFoco(e: KeyboardEvent) {
      const dialog = dialogRef.current
      if (!dialog) return
      const itens = Array.from(dialog.querySelectorAll<HTMLElement>(FOCAVEIS))
      if (itens.length === 0) {
        e.preventDefault()
        return
      }
      const primeiro = itens[0]
      const ultimo = itens[itens.length - 1]
      const ativo = document.activeElement
      if (!dialog.contains(ativo)) {
        e.preventDefault()
        primeiro.focus()
      } else if (e.shiftKey && ativo === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && ativo === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    function onResize() {
      const { ajustado, palco } = medir()
      aplicar(limitarDeslocamento(zoomRef.current, ajustado, palco), false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    const anteriorOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
      document.body.style.overflow = anteriorOverflow
    }
  }, [aberto, fechar, anterior, proxima, aplicar, medir])

  // Foco: entra no modal ao abrir e volta para quem abriu ao fechar.
  useEffect(() => {
    if (!aberto || !montado) return
    fecharRef.current?.focus()
    return () => {
      const g = gatilhoRef.current
      if (g && document.contains(g)) g.focus()
    }
  }, [aberto, montado])

  // Roda do mouse: listener nativo, porque o onWheel do React é passivo e não
  // deixa impedir a rolagem da página.
  useEffect(() => {
    if (!aberto || !montado) return
    const el = palcoRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const linhas = e.deltaMode === 1 ? 16 : 1
      const fator = Math.exp(-e.deltaY * linhas * 0.0015)
      const { ajustado, palco } = medir()
      const p = relativo(e.clientX, e.clientY)
      aplicar(seguirPonteiro(zoomRef.current.escala * fator, p, ajustado, palco), false)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [aberto, montado, aplicar, medir, relativo])

  // --- Gestos no palco -----------------------------------------------------
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    ultimoTipo.current = e.pointerType || "mouse"
    if (ultimoTipo.current === "mouse") return // mouse: clique e movimento
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      // jsdom e navegadores antigos: segue sem captura.
    }
    const p = relativo(e.clientX, e.clientY)
    ponteiros.current.set(e.pointerId, p)
    const pts = Array.from(ponteiros.current.values())
    if (pts.length >= 2) {
      gesto.current = {
        tipo: "pinca",
        inicio: { estado: zoomRef.current, a: pts[0], b: pts[1] },
      }
      ultimoToque.current = null
    } else {
      gesto.current = {
        tipo: "arrasto",
        inicio: p,
        estado: zoomRef.current,
        em: Date.now(),
      }
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const p = relativo(e.clientX, e.clientY)
    if ((e.pointerType || "mouse") === "mouse") {
      // Computador: com zoom, a área ampliada segue o mouse.
      if (estaAmpliado(zoomRef.current)) {
        const { ajustado, palco } = medir()
        aplicar(seguirPonteiro(zoomRef.current.escala, p, ajustado, palco), false)
      }
      return
    }
    if (!ponteiros.current.has(e.pointerId)) return
    ponteiros.current.set(e.pointerId, p)
    const g = gesto.current
    const { ajustado, palco } = medir()
    if (g?.tipo === "pinca") {
      const pts = Array.from(ponteiros.current.values())
      if (pts.length >= 2) aplicar(pinca(g.inicio, pts[0], pts[1], ajustado, palco), false)
    } else if (g?.tipo === "arrasto" && estaAmpliado(g.estado)) {
      aplicar(
        mover(g.estado, { x: p.x - g.inicio.x, y: p.y - g.inicio.y }, ajustado, palco),
        false
      )
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.pointerType || "mouse") === "mouse") return
    if (!ponteiros.current.has(e.pointerId)) return
    const p = relativo(e.clientX, e.clientY)
    ponteiros.current.delete(e.pointerId)
    const g = gesto.current
    gesto.current = null
    if (!g || e.type === "pointercancel") return

    if (g.tipo === "pinca") {
      // Sobrou um dedo: continua como arrasto a partir dele.
      const resto = Array.from(ponteiros.current.values())
      if (resto.length === 1) {
        gesto.current = {
          tipo: "arrasto",
          inicio: resto[0],
          estado: zoomRef.current,
          em: Date.now(),
        }
      }
      return
    }

    const delta = { x: p.x - g.inicio.x, y: p.y - g.inicio.y }
    const agora = Date.now()
    const foiToque =
      Math.hypot(delta.x, delta.y) < TOQUE_MAX_PX && agora - g.em < TOQUE_MAX_MS
    if (foiToque) {
      const ant = ultimoToque.current
      if (
        ant &&
        agora - ant.em < DUPLO_TOQUE_MS &&
        Math.hypot(p.x - ant.p.x, p.y - ant.p.y) < DUPLO_TOQUE_PX
      ) {
        ultimoToque.current = null
        const { ajustado, palco } = medir()
        aplicar(alternarZoom(zoomRef.current, p, ajustado, palco), true)
      } else {
        ultimoToque.current = { em: agora, p }
      }
      return
    }
    ultimoToque.current = null
    const direcao = direcaoDoDeslize(delta, g.estado)
    if (direcao === 1) proxima()
    else if (direcao === -1) anterior()
  }

  function onClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    // No celular o toque também gera "click": lá quem amplia é o duplo toque.
    if (ultimoTipo.current !== "mouse") return
    // O segundo clique de um duplo clique fica com o onDoubleClick.
    if (e.detail > 1) return
    const { ajustado, palco } = medir()
    const z = zoomRef.current
    if (estaAmpliado(z)) {
      aplicar(ZOOM_INICIAL, true)
    } else {
      const p = relativo(e.clientX, e.clientY)
      aplicar(seguirPonteiro(ZOOM_CLIQUE, p, ajustado, palco), true)
    }
  }

  function onDoubleClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    if (ultimoTipo.current !== "mouse") return
    const { ajustado, palco } = medir()
    const p = relativo(e.clientX, e.clientY)
    aplicar(
      seguirPonteiro(escalaDuploClique(zoomRef.current.escala), p, ajustado, palco),
      true
    )
  }

  if (total === 0) return null

  const foto = images[Math.min(atual, total - 1)]
  const porcentagem = Math.round(zoom.escala * 100)
  const naMaxima = zoom.escala >= ZOOM_MAX - 0.001
  const botaoBarra =
    "inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"

  return (
    <div className="grid gap-2">
      {/* Foto de capa, grande e clicável, com indicador de lupa */}
      <button
        type="button"
        onClick={() => abrir(0)}
        aria-label="Abrir galeria de fotos"
        className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <Image
          src={images[0].url}
          alt={`${title} - foto 1`}
          fill
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <span
          data-testid="indicador-lupa"
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
        >
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          {total > 1 ? `Ampliar fotos (${total})` : "Ampliar foto"}
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
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-md ring-offset-2 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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

      {/* Modal: num portal no body, senão o cabeçalho fixo, o card lateral
          sticky e o banner de cookies (cada um com seu contexto de empilhamento)
          aparecem por cima do overlay. z-[100] fica acima de todos eles. */}
      {aberto && montado && createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${atual + 1} de ${total} do anúncio ${title}`}
          aria-describedby="galeria-instrucoes"
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={fechar}
        >
          <p id="galeria-instrucoes" className="sr-only">
            Use as teclas mais e menos para ampliar e reduzir, zero para voltar ao
            tamanho ajustado, as setas para trocar de foto ou, com a foto ampliada,
            para mover a foto, e Esc para fechar.
          </p>

          <div className="flex items-center justify-between gap-2 p-3 text-white sm:p-4">
            <span className="text-sm tabular-nums">
              {atual + 1} / {total}
            </span>

            <span className="hidden text-xs text-white/70 sm:inline">
              {ampliado ? (
                <>
                  <span className="pointer-coarse:hidden">Mova o mouse para ver os detalhes. Clique para voltar.</span>
                  <span className="hidden pointer-coarse:inline">Arraste para ver os detalhes.</span>
                </>
              ) : (
                <>
                  <span className="pointer-coarse:hidden">Clique na foto ou use a roda do mouse para ampliar.</span>
                  <span className="hidden pointer-coarse:inline">Toque duas vezes ou use dois dedos para ampliar.</span>
                </>
              )}
            </span>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => zoomPasso(-1)}
                disabled={!ampliado}
                aria-label="Reduzir zoom"
                className={botaoBarra}
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <span
                role="status"
                aria-live="polite"
                aria-label={`Zoom ${porcentagem}%`}
                className="w-12 text-center text-sm tabular-nums"
              >
                {porcentagem}%
              </span>
              <button
                type="button"
                onClick={() => zoomPasso(1)}
                disabled={naMaxima}
                aria-label="Ampliar zoom"
                className={botaoBarra}
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={voltarAjustada}
                disabled={!ampliado}
                aria-label="Voltar ao tamanho ajustado"
                className={botaoBarra}
              >
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                ref={fecharRef}
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                className={`${botaoBarra} ml-1`}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="relative min-h-0 flex-1 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Palco: recebe os gestos. touch-none desliga o zoom nativo do
                navegador, que ampliaria a página inteira em vez da foto. */}
            <div
              ref={palcoRef}
              data-testid="palco-zoom"
              className={`absolute inset-0 touch-none select-none ${
                ampliado ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
            >
              <div
                key={foto.id}
                data-testid="foto-transformada"
                className={`absolute inset-0 will-change-transform ${
                  animar
                    ? "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
                    : ""
                }`}
                style={{ transform: transformCss(zoom), transformOrigin: "center" }}
              >
                {/* A imagem inteira, sem corte: object-contain. */}
                <Image
                  src={foto.url}
                  alt={`${title} - foto ${atual + 1}`}
                  fill
                  className="pointer-events-none object-contain"
                  sizes="100vw"
                  priority
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    naturalRef.current = { w: img.naturalWidth, h: img.naturalHeight }
                  }}
                />
                {usarAlta && (
                  <Image
                    src={foto.url}
                    alt=""
                    aria-hidden="true"
                    data-camada="alta-resolucao"
                    fill
                    className={`pointer-events-none object-contain motion-safe:transition-opacity motion-safe:duration-200 ${
                      altaCarregada ? "opacity-100" : "opacity-0"
                    }`}
                    sizes={SIZES_AMPLIADA}
                    draggable={false}
                    onLoad={() => setAltaCarregada(true)}
                  />
                )}
              </div>
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={proxima}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* Tira de miniaturas dentro do modal, para pular direto */}
          {total > 1 && (
            <div
              className="flex gap-2 overflow-x-auto p-3 sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => irPara(i)}
                  aria-label={`Ir para a foto ${i + 1}`}
                  aria-current={i === atual}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
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
