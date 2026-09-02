import { describe, it, expect } from "vitest"
import { resolverCidade, cidadeSlug, slugDaCidade, CIDADES_CONHECIDAS } from "@/lib/cidades"

const doBanco = [
  { city: "Brasília", state: "DF" },
  { city: "Águas Claras", state: "DF" },
]

describe("cidadeSlug", () => {
  it("remove acentos e espacos", () => {
    expect(cidadeSlug("Brasília")).toBe("brasilia")
    expect(cidadeSlug("São Paulo")).toBe("sao-paulo")
    expect(cidadeSlug("Águas Claras")).toBe("aguas-claras")
  })
})

describe("resolverCidade", () => {
  it("prefere a grafia do banco quando existe anuncio na cidade", () => {
    expect(resolverCidade("brasilia", doBanco)).toEqual({ nome: "Brasília", uf: "DF" })
    // Cidade fora da lista fixa, mas com anuncio: tambem resolve.
    expect(resolverCidade("aguas-claras", doBanco)).toEqual({ nome: "Águas Claras", uf: "DF" })
  })

  it("cai na lista fixa para cidade sem oferta ainda", () => {
    expect(resolverCidade("sao-paulo", doBanco)).toEqual({ nome: "São Paulo", uf: "SP" })
  })

  it("slug desconhecido devolve undefined (vira 404, nao pagina inventada)", () => {
    expect(resolverCidade("cidade-que-nao-existe", doBanco)).toBeUndefined()
  })

  it("homonimas de UFs diferentes ganham slug com sufixo e nao se misturam", () => {
    const comHomonimas = [
      { city: "Palmas", state: "TO" },
      { city: "Palmas", state: "PR" },
      { city: "Brasília", state: "DF" },
    ]
    expect(slugDaCidade(comHomonimas[0], comHomonimas)).toBe("palmas-to")
    expect(slugDaCidade(comHomonimas[1], comHomonimas)).toBe("palmas-pr")
    // Nome unico continua com slug curto.
    expect(slugDaCidade(comHomonimas[2], comHomonimas)).toBe("brasilia")

    expect(resolverCidade("palmas-pr", comHomonimas)).toEqual({ nome: "Palmas", uf: "PR" })
    expect(resolverCidade("palmas-to", comHomonimas)).toEqual({ nome: "Palmas", uf: "TO" })
    // O slug curto em disputa cai na lista fixa (a capital conhecida), que
    // filtra por UF na pagina; nada se mistura.
    expect(resolverCidade("palmas", comHomonimas)).toEqual({ nome: "Palmas", uf: "TO" })
  })

  it("toda cidade da lista fixa tem slug canonico igual a chave", () => {
    // Se a chave nao bater com o slug do nome, o link interno gerado a partir
    // do nome nunca encontraria a pagina.
    for (const [slug, c] of Object.entries(CIDADES_CONHECIDAS)) {
      expect(cidadeSlug(c.nome)).toBe(slug)
    }
  })
})
