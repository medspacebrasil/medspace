import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { WhatsAppButton } from "@/components/anuncios/WhatsAppButton"

describe("WhatsAppButton", () => {
  afterEach(() => cleanup())

  it("renders with correct WhatsApp link", () => {
    render(<WhatsAppButton phone="11999998888" message="Olá!" />)

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute(
      "href",
      "https://wa.me/5511999998888?text=Ol%C3%A1!"
    )
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders button text", () => {
    render(<WhatsAppButton phone="11999998888" />)

    expect(
      screen.getByText("Entrar em Contato via WhatsApp")
    ).toBeInTheDocument()
  })
})
