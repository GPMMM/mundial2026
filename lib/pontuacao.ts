import { Fase } from '@prisma/client'

const MULTIPLICADORES: Record<Fase, number> = {
  GRUPOS: 1,
  OITAVOS: 1.5,
  QUARTOS: 2,
  MEIAS: 3,
  FINAL: 4,
}

export function calcularPontuacaoJogo(
  previsao: { golosCasa: number; golosFora: number; marcadorCasa?: string | null; marcadorFora?: string | null },
  jogo: { golosCasa: number; golosFora: number; fase: Fase; marcadoresCasa: string[]; marcadoresFora: string[] }
): number {
  const { golosCasa: gC, golosFora: gF } = jogo
  const { golosCasa: pC, golosFora: pF } = previsao
  const diffJogo = gC - gF
  const diffPrev = pC - pF

  let pontos = 0

  if (gC === pC && gF === pF) {
    pontos = 5
  } else if (diffJogo === diffPrev) {
    pontos = 2
  } else if (Math.sign(diffJogo) === Math.sign(diffPrev)) {
    pontos = 1
  }

  if (previsao.marcadorCasa && jogo.marcadoresCasa.includes(previsao.marcadorCasa)) pontos += 2
  if (previsao.marcadorFora && jogo.marcadoresFora.includes(previsao.marcadorFora)) pontos += 2

  return Math.round(pontos * MULTIPLICADORES[jogo.fase])
}

export function acertouResultado(
  previsao: { golosCasa: number; golosFora: number },
  jogo: { golosCasa: number; golosFora: number }
): boolean {
  return (
    Math.sign(previsao.golosCasa - previsao.golosFora) ===
    Math.sign(jogo.golosCasa - jogo.golosFora)
  )
}
