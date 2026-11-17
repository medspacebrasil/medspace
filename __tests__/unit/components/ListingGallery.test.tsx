import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react"
import { ListingGallery } from "@/components/anuncios/ListingGallery"

/**
 * Regressão: a cliente relatou que, mesmo enviando 10 fotos, só algumas
 * apareciam, e não dava para ver em tamanho maior. A página antiga mostrava
 * `images.slice(1, 5)` (capa + 4 = 5 no máximo) e as miniaturas não abriam.
 */

const fazerImagens = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `img-${i}`, url: `https://x/${i}.jpg` }))

describe("ListingGallery", () => {
  afterEach(() => cleanup())

  it("mostra uma miniatura para CADA foto, não apenas as 5 primeiras", () => {
    render(<ListingGallery images={fazerImagens(10)} title="Sala" />)
    // Uma miniatura clicável por foto. Com o bug do slice(1,5) seriam só 5.
    const miniaturas = screen.getAllByRole("button", {
      name: /Abrir foto \d+ em tamanho maior/,
    })
    expect(miniaturas).toHaveLength(10)
  })

  it("clicar numa foto abre a visualização ampliada com a imagem inteira", () => {
    render(<ListingGallery images={fazerImagens(10)} title="Sala" />)
    expect(screen.queryByRole("dialog")).toBeNull()

    fireEvent.click(
      screen.getByRole("button", { name: "Abrir foto 3 em tamanho maior" })
    )

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText("3 / 10")).toBeInTheDocument()
    // A foto grande usa object-contain (não corta a imagem).
    const grande = within(dialog).getByAltText("Sala - foto 3")
    expect(grande.className).toContain("object-contain")
  })

  it("navega entre as fotos pelas setas, em ciclo", () => {
    render(<ListingGallery images={fazerImagens(3)} title="Sala" />)
    fireEvent.click(screen.getByRole("button", { name: "Abrir foto 1 em tamanho maior" }))

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Foto anterior" }))
    // Volta da 1 para a 3 (ciclo).
    expect(within(dialog).getByText("3 / 3")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Próxima foto" }))
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument()
  })

  it("foto única não mostra setas nem contador de várias", () => {
    render(<ListingGallery images={fazerImagens(1)} title="Sala" />)
    // Sem miniaturas (só a capa) e sem erro.
    expect(screen.queryByRole("button", { name: /Abrir foto \d+/ })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Abrir galeria de fotos" }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).queryByRole("button", { name: "Próxima foto" })).toBeNull()
  })
})

/**
 * Lupa (pedido da Cejana de 17/11/2026): ampliar a foto no modal como nas
 * lojas grandes. A matemática está testada em __tests__/unit/lib/gallery-zoom.test.ts;
 * aqui fica o comportamento do componente: mouse, teclado, botões, toque,
 * alta resolução e foco.
 */
describe("ListingGallery: lupa no modal", () => {
  // jsdom não tem layout: o palco mede 0x0. Damos 1000x600 ao palco para que
  // o deslocamento da foto ampliada possa acontecer de verdade.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const palco = this.dataset?.testid === "palco-zoom"
      const w = palco ? 1000 : 0
      const h = palco ? 600 : 0
      return { left: 0, top: 0, x: 0, y: 0, width: w, height: h, right: w, bottom: h, toJSON() {} } as DOMRect
    })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  function abrirModal(n = 3) {
    render(<ListingGallery images={fazerImagens(n)} title="Sala" />)
    fireEvent.click(screen.getByRole("button", { name: "Abrir galeria de fotos" }))
    const dialog = screen.getByRole("dialog")
    return {
      dialog,
      palco: within(dialog).getByTestId("palco-zoom"),
      foto: () => within(dialog).getByTestId("foto-transformada"),
      zoom: () => within(dialog).getByRole("status").textContent,
    }
  }

  it("a foto principal mostra o indicador de lupa", () => {
    render(<ListingGallery images={fazerImagens(4)} title="Sala" />)
    const indicador = screen.getByTestId("indicador-lupa")
    expect(indicador).toHaveTextContent("Ampliar fotos (4)")
    expect(indicador.querySelector("svg")).not.toBeNull()
  })

  it("computador: o cursor vira lupa e o clique alterna entre ajustada e ampliada", () => {
    const { palco, foto, zoom } = abrirModal()
    expect(palco.className).toContain("cursor-zoom-in")
    expect(zoom()).toBe("100%")

    fireEvent.click(palco, { detail: 1, clientX: 500, clientY: 300 })
    expect(zoom()).toBe("250%")
    expect(foto().style.transform).toContain("scale(2.5)")
    expect(palco.className).toContain("cursor-zoom-out")

    fireEvent.click(palco, { detail: 1, clientX: 500, clientY: 300 })
    expect(zoom()).toBe("100%")
    expect(foto().style.transform).toContain("scale(1)")
  })

  it("computador: com zoom, a área ampliada segue o mouse", () => {
    const { palco, foto } = abrirModal()
    fireEvent.click(palco, { detail: 1, clientX: 500, clientY: 300 })
    // Mouse na borda esquerda e no topo: mostra o canto superior esquerdo.
    fireEvent.pointerMove(palco, { pointerType: "mouse", clientX: 0, clientY: 0 })
    // 2,5x de 1000x600 = 2500x1500 -> anda até 750 e 450.
    expect(foto().style.transform).toBe("translate3d(750px, 450px, 0) scale(2.5)")
    fireEvent.pointerMove(palco, { pointerType: "mouse", clientX: 1000, clientY: 600 })
    expect(foto().style.transform).toBe("translate3d(-750px, -450px, 0) scale(2.5)")
  })

  it("computador: duplo clique e roda do mouse ampliam", () => {
    const { palco, zoom } = abrirModal()
    // O navegador manda click(1), click(2) e dblclick.
    fireEvent.click(palco, { detail: 1 })
    fireEvent.click(palco, { detail: 2 })
    fireEvent.doubleClick(palco, { detail: 2 })
    expect(zoom()).toBe("300%")

    fireEvent.click(palco, { detail: 1 })
    expect(zoom()).toBe("100%")
    fireEvent.wheel(palco, { deltaY: -300, clientX: 500, clientY: 300 })
    expect(Number.parseInt(zoom() ?? "0")).toBeGreaterThan(100)
  })

  it("botões de mais, menos e voltar", () => {
    const { dialog, zoom } = abrirModal()
    const menos = within(dialog).getByRole("button", { name: "Reduzir zoom" })
    const mais = within(dialog).getByRole("button", { name: "Ampliar zoom" })
    const voltar = within(dialog).getByRole("button", { name: "Voltar ao tamanho ajustado" })
    expect(menos).toBeDisabled()
    expect(voltar).toBeDisabled()

    fireEvent.click(mais)
    fireEvent.click(mais)
    expect(zoom()).toBe("200%")
    expect(menos).toBeEnabled()
    fireEvent.click(mais)
    fireEvent.click(mais)
    expect(zoom()).toBe("300%")
    expect(mais).toBeDisabled()
    fireEvent.click(menos)
    expect(zoom()).toBe("250%")
    fireEvent.click(voltar)
    expect(zoom()).toBe("100%")
    // Os botões da barra não fecham o modal (o clique no fundo fecha).
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("teclas +, -, 0 e setas (com zoom as setas movem a foto, sem zoom trocam)", () => {
    const { dialog, foto, zoom } = abrirModal()
    fireEvent.keyDown(window, { key: "+" })
    expect(zoom()).toBe("150%")
    fireEvent.keyDown(window, { key: "+" })
    fireEvent.keyDown(window, { key: "-" })
    expect(zoom()).toBe("150%")

    fireEvent.keyDown(window, { key: "ArrowRight" })
    // Continua na foto 1, mas a foto andou para mostrar a direita.
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument()
    expect(foto().style.transform).toBe("translate3d(-100px, 0px, 0) scale(1.5)")

    fireEvent.keyDown(window, { key: "0" })
    expect(zoom()).toBe("100%")
    fireEvent.keyDown(window, { key: "ArrowRight" })
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument()
  })

  it("Ctrl + mais fica com o zoom do navegador", () => {
    const { zoom } = abrirModal()
    fireEvent.keyDown(window, { key: "+", ctrlKey: true })
    expect(zoom()).toBe("100%")
  })

  it("trocar de foto zera o zoom (setas, miniaturas)", () => {
    const { dialog, zoom } = abrirModal()
    fireEvent.keyDown(window, { key: "+" })
    fireEvent.click(within(dialog).getByRole("button", { name: "Próxima foto" }))
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument()
    expect(zoom()).toBe("100%")

    fireEvent.keyDown(window, { key: "+" })
    fireEvent.click(within(dialog).getByRole("button", { name: "Ir para a foto 3" }))
    expect(within(dialog).getByText("3 / 3")).toBeInTheDocument()
    expect(zoom()).toBe("100%")
  })

  it("a foto ampliada usa a imagem em resolução maior, não a miniatura esticada", () => {
    const { dialog, palco } = abrirModal()
    const base = within(dialog).getByAltText("Sala - foto 1")
    expect(base.getAttribute("sizes")).toBe("100vw")
    // Antes do zoom não baixa a versão grande.
    expect(dialog.querySelector('[data-camada="alta-resolucao"]')).toBeNull()

    fireEvent.click(palco, { detail: 1 })
    const alta = dialog.querySelector('[data-camada="alta-resolucao"]')
    expect(alta).not.toBeNull()
    expect(alta?.getAttribute("sizes")).toBe("300vw")
    // O srcset oferece a largura máxima do next/image (3840px).
    expect(alta?.getAttribute("srcset")).toContain("w=3840")
  })

  it("celular: duplo toque amplia, toque simples não", () => {
    const { palco, zoom } = abrirModal()
    const toque = (x: number, y: number) => {
      fireEvent.pointerDown(palco, { pointerType: "touch", pointerId: 1, clientX: x, clientY: y })
      fireEvent.pointerUp(palco, { pointerType: "touch", pointerId: 1, clientX: x, clientY: y })
      // O navegador também manda um click depois do toque: deve ser ignorado.
      fireEvent.click(palco, { detail: 1, clientX: x, clientY: y })
    }
    toque(500, 300)
    expect(zoom()).toBe("100%")
    toque(502, 301)
    expect(zoom()).toBe("250%")
  })

  it("celular: pinça amplia", () => {
    const { palco, zoom } = abrirModal()
    fireEvent.pointerDown(palco, { pointerType: "touch", pointerId: 1, clientX: 450, clientY: 300 })
    fireEvent.pointerDown(palco, { pointerType: "touch", pointerId: 2, clientX: 550, clientY: 300 })
    fireEvent.pointerMove(palco, { pointerType: "touch", pointerId: 1, clientX: 400, clientY: 300 })
    fireEvent.pointerMove(palco, { pointerType: "touch", pointerId: 2, clientX: 600, clientY: 300 })
    expect(zoom()).toBe("200%")
    fireEvent.pointerUp(palco, { pointerType: "touch", pointerId: 1, clientX: 400, clientY: 300 })
    fireEvent.pointerUp(palco, { pointerType: "touch", pointerId: 2, clientX: 600, clientY: 300 })
    expect(zoom()).toBe("200%")
  })

  it("celular: deslize troca de foto só sem zoom; com zoom, arrastar move a foto", () => {
    const { dialog, palco, foto } = abrirModal()
    const deslizar = (de: number, para: number) => {
      fireEvent.pointerDown(palco, { pointerType: "touch", pointerId: 7, clientX: de, clientY: 300 })
      fireEvent.pointerMove(palco, { pointerType: "touch", pointerId: 7, clientX: para, clientY: 300 })
      fireEvent.pointerUp(palco, { pointerType: "touch", pointerId: 7, clientX: para, clientY: 300 })
    }
    deslizar(600, 450)
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument()

    fireEvent.keyDown(window, { key: "+" }) // 150%
    deslizar(600, 450)
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument()
    expect(foto().style.transform).toBe("translate3d(-150px, 0px, 0) scale(1.5)")
  })

  it("Esc fecha e o foco volta para quem abriu", () => {
    render(<ListingGallery images={fazerImagens(3)} title="Sala" />)
    const capa = screen.getByRole("button", { name: "Abrir galeria de fotos" })
    capa.focus()
    fireEvent.click(capa)
    const dialog = screen.getByRole("dialog")
    expect(dialog.contains(document.activeElement)).toBe(true)

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.activeElement).toBe(capa)
  })

  it("o foco fica preso dentro do modal (Tab e Shift+Tab dão a volta)", () => {
    const { dialog } = abrirModal()
    const focaveis = Array.from(
      dialog.querySelectorAll<HTMLElement>("button:not([disabled])")
    )
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]

    ultimo.focus()
    fireEvent.keyDown(window, { key: "Tab" })
    expect(document.activeElement).toBe(primeiro)

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true })
    expect(document.activeElement).toBe(ultimo)
  })

  it("rótulos e movimento reduzido", () => {
    const { dialog, foto, palco } = abrirModal()
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveAccessibleDescription(/teclas mais e menos/)
    // Transições só com motion-safe: quem pediu menos movimento não vê animação.
    fireEvent.click(palco, { detail: 1 })
    const classes = foto().className.split(/\s+/)
    expect(classes.some((c) => c.startsWith("transition"))).toBe(false)
    expect(classes).toContain("motion-safe:transition-transform")
  })
})
