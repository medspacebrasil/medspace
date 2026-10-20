import { describe, it, expect, afterEach } from "vitest"
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
