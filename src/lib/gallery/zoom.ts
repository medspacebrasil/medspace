/**
 * Matemática da lupa da galeria (ListingGallery), separada do componente para
 * poder ser testada sem navegador.
 *
 * Modelo: a foto é desenhada "ajustada" (object-contain) dentro do palco e, por
 * cima disso, recebe `translate(x, y) scale(escala)` com origem no CENTRO do
 * palco. Todos os pontos aqui são relativos ao centro do palco, em pixels de
 * tela. Um ponto q da foto (relativo ao centro, na escala 1) aparece na tela em
 * `t + escala * q`.
 */

export const ZOOM_MIN = 1
/** Clique, duplo toque e duplo clique levam a este zoom. */
export const ZOOM_CLIQUE = 2.5
export const ZOOM_MAX = 3
/** Passo dos botões de mais/menos e das teclas + e -. */
export const ZOOM_PASSO = 0.5
/** Quanto as setas movem a foto ampliada, em fração do palco. */
export const PASSO_TECLADO = 0.1
/** Deslize horizontal mínimo, em px, para trocar de foto (só sem zoom). */
export const DESLIZE_MINIMO = 50

export interface Tamanho {
  w: number
  h: number
}
export interface Ponto {
  x: number
  y: number
}
export interface EstadoZoom {
  escala: number
  x: number
  y: number
}

export const ZOOM_INICIAL: EstadoZoom = { escala: 1, x: 0, y: 0 }

const arred = (n: number) => Math.round(n * 1000) / 1000
const limitar = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))
const valido = (t: Tamanho) => t.w > 0 && t.h > 0

export function estaAmpliado(estado: EstadoZoom): boolean {
  return estado.escala > ZOOM_MIN + 0.001
}

export function limitarEscala(escala: number): number {
  if (!Number.isFinite(escala)) return ZOOM_MIN
  return arred(limitar(escala, ZOOM_MIN, ZOOM_MAX))
}

/**
 * Tamanho da foto desenhada com object-contain no palco (escala 1). Sem as
 * dimensões naturais (foto ainda carregando), assume o palco inteiro.
 */
export function tamanhoAjustado(natural: Tamanho, palco: Tamanho): Tamanho {
  if (!valido(palco)) return { w: 0, h: 0 }
  if (!valido(natural)) return { ...palco }
  const fator = Math.min(palco.w / natural.w, palco.h / natural.h)
  return { w: natural.w * fator, h: natural.h * fator }
}

/**
 * Quanto a foto ampliada pode andar para cada lado sem mostrar fundo preto
 * além da borda. Se a foto ampliada ainda cabe no palco numa direção, ela fica
 * centralizada nela (0).
 */
export function deslocamentoMaximo(
  escala: number,
  ajustado: Tamanho,
  palco: Tamanho
): Ponto {
  return {
    x: Math.max(0, (escala * ajustado.w - palco.w) / 2),
    y: Math.max(0, (escala * ajustado.h - palco.h) / 2),
  }
}

export function limitarDeslocamento(
  estado: EstadoZoom,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  const escala = limitarEscala(estado.escala)
  const max = deslocamentoMaximo(escala, ajustado, palco)
  return {
    escala,
    // `+ 0` evita -0 (que atrapalha comparações nos testes e no CSS).
    x: arred(limitar(estado.x, -max.x, max.x)) + 0,
    y: arred(limitar(estado.y, -max.y, max.y)) + 0,
  }
}

/**
 * Muda o zoom mantendo parado o ponto da foto que está sob `ponto` (o cursor,
 * o meio da pinça, o centro do palco para os botões).
 */
export function ampliarNoPonto(
  estado: EstadoZoom,
  novaEscala: number,
  ponto: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  const s = limitarEscala(novaEscala)
  const qx = (ponto.x - estado.x) / estado.escala
  const qy = (ponto.y - estado.y) / estado.escala
  return limitarDeslocamento(
    { escala: s, x: ponto.x - s * qx, y: ponto.y - s * qy },
    ajustado,
    palco
  )
}

/**
 * Computador: a área ampliada segue o mouse, como nas lojas grandes. O mouse
 * na borda esquerda da foto mostra a borda esquerda da foto ampliada, no meio
 * mostra o meio, e assim por diante.
 */
export function seguirPonteiro(
  escala: number,
  ponteiro: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  const s = limitarEscala(escala)
  const max = deslocamentoMaximo(s, ajustado, palco)
  // Posição do mouse sobre a foto ajustada, de 0 (borda esquerda/topo) a 1.
  const fracao = (p: number, lado: number) =>
    lado > 0 ? limitar((p + lado / 2) / lado, 0, 1) : 0.5
  const fx = fracao(ponteiro.x, ajustado.w)
  const fy = fracao(ponteiro.y, ajustado.h)
  return limitarDeslocamento(
    { escala: s, x: max.x * (1 - 2 * fx), y: max.y * (1 - 2 * fy) },
    ajustado,
    palco
  )
}

/** Clique (computador) e duplo toque (celular): ajustada <-> ampliada. */
export function alternarZoom(
  estado: EstadoZoom,
  ponto: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  if (estaAmpliado(estado)) return ZOOM_INICIAL
  return ampliarNoPonto(estado, ZOOM_CLIQUE, ponto, ajustado, palco)
}

/** Duplo clique sempre amplia: da ajustada vai ao zoom do clique, e de lá ao máximo. */
export function escalaDuploClique(escalaAtual: number): number {
  return escalaAtual > ZOOM_MIN + 0.001 ? ZOOM_MAX : ZOOM_CLIQUE
}

/** Botões de mais/menos e teclas + e -: um passo, mantendo o centro do palco. */
export function passoZoom(
  estado: EstadoZoom,
  direcao: 1 | -1,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  return ampliarNoPonto(
    estado,
    estado.escala + direcao * ZOOM_PASSO,
    { x: 0, y: 0 },
    ajustado,
    palco
  )
}

/** Arrastar (celular) e setas do teclado: move a foto ampliada. */
export function mover(
  estado: EstadoZoom,
  delta: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  return limitarDeslocamento(
    { ...estado, x: estado.x + delta.x, y: estado.y + delta.y },
    ajustado,
    palco
  )
}

/**
 * Seta do teclado com a foto ampliada. A seta para a direita mostra o que está
 * à direita (a foto anda para a esquerda).
 */
export function moverPorTeclado(
  estado: EstadoZoom,
  direcao: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  return mover(
    estado,
    {
      x: -direcao.x * palco.w * PASSO_TECLADO,
      y: -direcao.y * palco.h * PASSO_TECLADO,
    },
    ajustado,
    palco
  )
}

export interface InicioPinca {
  estado: EstadoZoom
  a: Ponto
  b: Ponto
}

const distancia = (a: Ponto, b: Ponto) => Math.hypot(a.x - b.x, a.y - b.y)
const meio = (a: Ponto, b: Ponto): Ponto => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

/**
 * Pinça de dois dedos: a escala acompanha a abertura dos dedos e o ponto da
 * foto que estava entre eles continua entre eles (inclusive se os dedos andam).
 */
export function pinca(
  inicio: InicioPinca,
  a: Ponto,
  b: Ponto,
  ajustado: Tamanho,
  palco: Tamanho
): EstadoZoom {
  const d0 = distancia(inicio.a, inicio.b)
  if (d0 < 1) return inicio.estado
  const s0 = inicio.estado.escala
  const s = limitarEscala(s0 * (distancia(a, b) / d0))
  const m0 = meio(inicio.a, inicio.b)
  const m = meio(a, b)
  const qx = (m0.x - inicio.estado.x) / s0
  const qy = (m0.y - inicio.estado.y) / s0
  return limitarDeslocamento(
    { escala: s, x: m.x - s * qx, y: m.y - s * qy },
    ajustado,
    palco
  )
}

/**
 * Deslize para trocar de foto. Só vale SEM zoom (com zoom, arrastar move a
 * foto) e só se o gesto for mais horizontal do que vertical.
 * Retorna 1 (próxima), -1 (anterior) ou 0 (nada).
 */
export function direcaoDoDeslize(
  delta: Ponto,
  estado: EstadoZoom
): -1 | 0 | 1 {
  if (estaAmpliado(estado)) return 0
  if (Math.abs(delta.x) < DESLIZE_MINIMO) return 0
  if (Math.abs(delta.x) <= Math.abs(delta.y)) return 0
  return delta.x < 0 ? 1 : -1
}

/**
 * `sizes` da camada em alta resolução. O next/image escolhe no srcset a
 * largura que cobre `sizes` x densidade da tela; com 100vw a foto ampliada 3x
 * seria a de 1920px esticada (borrada). Pedindo ZOOM_MAX x 100vw o navegador
 * busca a maior (até 3840px, ou o tamanho original se a foto for menor).
 */
export const SIZES_AMPLIADA = `${ZOOM_MAX * 100}vw`

export function transformCss(estado: EstadoZoom): string {
  return `translate3d(${estado.x}px, ${estado.y}px, 0) scale(${estado.escala})`
}
