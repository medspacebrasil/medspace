import { describe, it, expect } from "vitest"
import {
  ZOOM_CLIQUE,
  ZOOM_INICIAL,
  ZOOM_MAX,
  SIZES_AMPLIADA,
  alternarZoom,
  ampliarNoPonto,
  deslocamentoMaximo,
  direcaoDoDeslize,
  escalaDuploClique,
  estaAmpliado,
  limitarDeslocamento,
  limitarEscala,
  mover,
  moverPorTeclado,
  passoZoom,
  pinca,
  seguirPonteiro,
  tamanhoAjustado,
  transformCss,
} from "@/lib/gallery/zoom"

// Palco de 1000x600 com uma foto paisagem 4000x2000: ajustada fica 1000x500.
const palco = { w: 1000, h: 600 }
const ajustado = tamanhoAjustado({ w: 4000, h: 2000 }, palco)

describe("tamanhoAjustado (object-contain)", () => {
  it("encaixa a foto pelo lado que limita", () => {
    expect(ajustado).toEqual({ w: 1000, h: 500 })
    // Retrato num palco largo: limita pela altura.
    expect(tamanhoAjustado({ w: 1000, h: 2000 }, palco)).toEqual({ w: 300, h: 600 })
  })

  it("sem as dimensões naturais (carregando), usa o palco", () => {
    expect(tamanhoAjustado({ w: 0, h: 0 }, palco)).toEqual(palco)
  })

  it("palco sem medida (jsdom, aba oculta) não quebra", () => {
    expect(tamanhoAjustado({ w: 4000, h: 2000 }, { w: 0, h: 0 })).toEqual({ w: 0, h: 0 })
  })
})

describe("limites de escala e de deslocamento", () => {
  it("escala fica entre 1x e o máximo, e lixo vira 1x", () => {
    expect(limitarEscala(0.2)).toBe(1)
    expect(limitarEscala(99)).toBe(ZOOM_MAX)
    expect(limitarEscala(Number.NaN)).toBe(1)
    expect(limitarEscala(2.0000001)).toBe(2)
  })

  it("o clique amplia entre 2x e 3x, como pedido", () => {
    expect(ZOOM_CLIQUE).toBeGreaterThanOrEqual(2)
    expect(ZOOM_CLIQUE).toBeLessThanOrEqual(3)
    expect(ZOOM_MAX).toBeLessThanOrEqual(3)
  })

  it("sem zoom não há para onde mover", () => {
    expect(deslocamentoMaximo(1, ajustado, palco)).toEqual({ x: 0, y: 0 })
    expect(limitarDeslocamento({ escala: 1, x: 300, y: -200 }, ajustado, palco)).toEqual(
      ZOOM_INICIAL
    )
  })

  it("com zoom, a foto não sai além da borda (nada de fundo preto sobrando)", () => {
    // 2x: foto 2000x1000 num palco 1000x600 -> anda 500 na horizontal e 200 na vertical.
    expect(deslocamentoMaximo(2, ajustado, palco)).toEqual({ x: 500, y: 200 })
    expect(limitarDeslocamento({ escala: 2, x: 9999, y: -9999 }, ajustado, palco)).toEqual({
      escala: 2,
      x: 500,
      y: -200,
    })
  })
})

describe("ampliarNoPonto", () => {
  it("o ponto da foto sob o cursor continua sob o cursor", () => {
    const cursor = { x: 200, y: 100 }
    const r = ampliarNoPonto(ZOOM_INICIAL, 2, cursor, ajustado, palco)
    // Ponto da foto sob o cursor antes: q = cursor (escala 1, sem deslocamento).
    // Depois: t + 2q tem de ser o cursor de novo.
    expect(r.x + 2 * cursor.x).toBeCloseTo(cursor.x)
    expect(r.y + 2 * cursor.y).toBeCloseTo(cursor.y)
  })

  it("no centro, só amplia (sem deslocar)", () => {
    expect(ampliarNoPonto(ZOOM_INICIAL, 2, { x: 0, y: 0 }, ajustado, palco)).toEqual({
      escala: 2,
      x: 0,
      y: 0,
    })
  })

  it("voltar para 1x sempre recentraliza", () => {
    const ampliado = { escala: 3, x: 400, y: -150 }
    expect(ampliarNoPonto(ampliado, 1, { x: 300, y: 300 }, ajustado, palco)).toEqual(
      ZOOM_INICIAL
    )
  })
})

describe("seguirPonteiro (computador: a área ampliada segue o mouse)", () => {
  it("mouse no meio mostra o meio", () => {
    expect(seguirPonteiro(2, { x: 0, y: 0 }, ajustado, palco)).toEqual({
      escala: 2,
      x: 0,
      y: 0,
    })
  })

  it("mouse na borda esquerda/topo da foto mostra a borda esquerda/topo", () => {
    // Borda esquerda da foto ajustada = -500; topo = -250.
    const r = seguirPonteiro(2, { x: -500, y: -250 }, ajustado, palco)
    expect(r).toEqual({ escala: 2, x: 500, y: 200 })
  })

  it("mouse na borda direita/base mostra a borda direita/base, e fora da foto não passa do limite", () => {
    expect(seguirPonteiro(2, { x: 500, y: 250 }, ajustado, palco)).toEqual({
      escala: 2,
      x: -500,
      y: -200,
    })
    expect(seguirPonteiro(2, { x: 5000, y: 5000 }, ajustado, palco)).toEqual({
      escala: 2,
      x: -500,
      y: -200,
    })
  })

  it("foto retrato: o mouse percorre a foto inteira, não o palco", () => {
    const retrato = tamanhoAjustado({ w: 1000, h: 2000 }, palco) // 300x600
    // Borda direita da foto (x=150), não a do palco (x=500).
    const r = seguirPonteiro(3, { x: 150, y: 0 }, retrato, palco)
    // 3x: 900 de largura num palco de 1000 ainda cabe -> x fica 0. Altura 1800 -> anda.
    expect(r.x).toBe(0)
    expect(r.y).toBe(0)
  })
})

describe("clique, duplo clique e botões", () => {
  it("clique alterna entre ajustada e ampliada", () => {
    const ampliada = alternarZoom(ZOOM_INICIAL, { x: 0, y: 0 }, ajustado, palco)
    expect(ampliada.escala).toBe(ZOOM_CLIQUE)
    expect(estaAmpliado(ampliada)).toBe(true)
    expect(alternarZoom(ampliada, { x: 0, y: 0 }, ajustado, palco)).toEqual(ZOOM_INICIAL)
  })

  it("duplo clique sempre amplia", () => {
    expect(escalaDuploClique(1)).toBe(ZOOM_CLIQUE)
    expect(escalaDuploClique(ZOOM_CLIQUE)).toBe(ZOOM_MAX)
  })

  it("mais e menos andam um passo e respeitam os limites", () => {
    const um = passoZoom(ZOOM_INICIAL, 1, ajustado, palco)
    expect(um.escala).toBe(1.5)
    expect(passoZoom(um, -1, ajustado, palco)).toEqual(ZOOM_INICIAL)
    expect(passoZoom(ZOOM_INICIAL, -1, ajustado, palco)).toEqual(ZOOM_INICIAL)
    expect(passoZoom({ escala: ZOOM_MAX, x: 0, y: 0 }, 1, ajustado, palco).escala).toBe(ZOOM_MAX)
  })
})

describe("arrastar e setas (foto ampliada)", () => {
  it("arrastar move e para na borda", () => {
    const r = mover({ escala: 2, x: 0, y: 0 }, { x: 100, y: -50 }, ajustado, palco)
    expect(r).toEqual({ escala: 2, x: 100, y: -50 })
    expect(mover(r, { x: 10000, y: 0 }, ajustado, palco).x).toBe(500)
  })

  it("seta para a direita mostra o que está à direita", () => {
    const r = moverPorTeclado({ escala: 2, x: 0, y: 0 }, { x: 1, y: 0 }, ajustado, palco)
    expect(r.x).toBe(-100) // 10% do palco de 1000
    const baixo = moverPorTeclado({ escala: 2, x: 0, y: 0 }, { x: 0, y: 1 }, ajustado, palco)
    expect(baixo.y).toBe(-60)
  })

  it("sem zoom as setas não movem nada", () => {
    expect(moverPorTeclado(ZOOM_INICIAL, { x: 1, y: 0 }, ajustado, palco)).toEqual(ZOOM_INICIAL)
  })
})

describe("pinça (celular)", () => {
  it("abrir os dedos para o dobro dobra o zoom no ponto entre eles", () => {
    const inicio = { estado: ZOOM_INICIAL, a: { x: 90, y: 0 }, b: { x: 110, y: 0 } }
    const r = pinca(inicio, { x: 80, y: 0 }, { x: 120, y: 0 }, ajustado, palco)
    expect(r.escala).toBe(2)
    // O ponto da foto sob o meio dos dedos (x=100) continua lá.
    expect(r.x + 2 * 100).toBeCloseTo(100)
  })

  it("fechar os dedos abaixo de 1x para em 1x, e abrir demais para no máximo", () => {
    const inicio = { estado: { escala: 2, x: 0, y: 0 }, a: { x: -100, y: 0 }, b: { x: 100, y: 0 } }
    expect(pinca(inicio, { x: -10, y: 0 }, { x: 10, y: 0 }, ajustado, palco)).toEqual(
      ZOOM_INICIAL
    )
    expect(pinca(inicio, { x: -1000, y: 0 }, { x: 1000, y: 0 }, ajustado, palco).escala).toBe(
      ZOOM_MAX
    )
  })

  it("dedos colados no início não dividem por zero", () => {
    const inicio = { estado: ZOOM_INICIAL, a: { x: 5, y: 5 }, b: { x: 5, y: 5 } }
    expect(pinca(inicio, { x: 0, y: 0 }, { x: 100, y: 0 }, ajustado, palco)).toEqual(ZOOM_INICIAL)
  })
})

describe("deslize para trocar de foto", () => {
  it("sem zoom, deslize para a esquerda vai para a próxima e para a direita volta", () => {
    expect(direcaoDoDeslize({ x: -80, y: 5 }, ZOOM_INICIAL)).toBe(1)
    expect(direcaoDoDeslize({ x: 80, y: -5 }, ZOOM_INICIAL)).toBe(-1)
  })

  it("COM zoom o deslize não troca de foto (arrastar move a foto)", () => {
    expect(direcaoDoDeslize({ x: -300, y: 0 }, { escala: 2, x: 0, y: 0 })).toBe(0)
  })

  it("gesto curto ou vertical não troca", () => {
    expect(direcaoDoDeslize({ x: -20, y: 0 }, ZOOM_INICIAL)).toBe(0)
    expect(direcaoDoDeslize({ x: -80, y: 120 }, ZOOM_INICIAL)).toBe(0)
  })
})

describe("alta resolução e CSS", () => {
  it("a camada ampliada pede ao next/image a largura do zoom máximo", () => {
    expect(SIZES_AMPLIADA).toBe(`${ZOOM_MAX * 100}vw`)
  })

  it("transform usa translate + scale", () => {
    expect(transformCss({ escala: 2, x: 10, y: -5 })).toBe(
      "translate3d(10px, -5px, 0) scale(2)"
    )
  })
})
