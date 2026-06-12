import { prisma } from './prisma'
import { calcularPontuacaoJogo, acertouResultado } from './pontuacao'
import {
  getEspnFixturesByDate,
  getEspnScorers,
  toPT,
  dateRange,
} from './espn'

// WC2026 starts June 11 2026
const TORNEIO_INICIO = new Date('2026-06-11T00:00:00Z')

export async function runSync(fullSync = false): Promise<{ fixtures: number }> {
  const hoje = new Date()
  const startDate = fullSync ? TORNEIO_INICIO : (() => {
    // Fetch yesterday + today to catch late finishes
    const d = new Date(hoje)
    d.setUTCDate(d.getUTCDate() - 1)
    return d
  })()

  const dates = dateRange(startDate, hoje)
  let fichasProcessadas = 0

  for (const dateStr of dates) {
    const events = await getEspnFixturesByDate(dateStr)
    for (const event of events) {
      const comp = event.competitions[0]
      if (!comp) continue

      const isFinished = comp.status.type.completed
      const home = comp.competitors.find(c => c.homeAway === 'home')
      const away = comp.competitors.find(c => c.homeAway === 'away')
      if (!home || !away) continue

      const equipaCasa = toPT(home.team.displayName)
      const equipaFora = toPT(away.team.displayName)
      const golosCasa = parseInt(home.score) || 0
      const golosFora = parseInt(away.score) || 0

      // Find matching fixture in DB by team names (seed uses PT names)
      const jogo = await prisma.jogo.findFirst({
        where: { equipaCasa, equipaFora },
      })
      if (!jogo) continue

      fichasProcessadas++

      if (!isFinished && jogo.golosCasa == null) continue

      // Get scorers if match finished and we don't have them yet
      let marcadoresCasa = [...jogo.marcadoresCasa]
      let marcadoresFora = [...jogo.marcadoresFora]

      if (isFinished && marcadoresCasa.length === 0 && marcadoresFora.length === 0) {
        try {
          const keyEvents = await getEspnScorers(event.id)
          for (const ke of keyEvents) {
            if (!ke.scoringPlay || !ke.type.type.startsWith('goal')) continue
            const scorer = ke.participants?.[0]?.athlete?.displayName
            if (!scorer) continue
            const teamName = ke.team?.displayName ?? ''
            if (toPT(teamName) === equipaCasa) marcadoresCasa.push(scorer)
            else marcadoresFora.push(scorer)
          }
        } catch { /* ignore */ }
      }

      await prisma.jogo.update({
        where: { id: jogo.id },
        data: {
          golosCasa,
          golosFora,
          encerrado: isFinished,
          marcadoresCasa,
          marcadoresFora,
        },
      })
    }
  }

  await calcularPontosPendentes()
  await calcularBonusGrupo()

  return { fixtures: fichasProcessadas }
}

export async function calcularPontosLocalmente(): Promise<{ calculadas: number }> {
  const calculadas = await calcularPontosPendentes()
  await calcularBonusGrupo()
  return { calculadas }
}

async function calcularPontosPendentes(): Promise<number> {
  const jogosFechados = await prisma.jogo.findMany({
    where: { encerrado: true },
    include: { previsoes: { where: { calculado: false } } },
  })

  let total = 0
  for (const jogo of jogosFechados) {
    if (jogo.previsoes.length === 0) continue
    if (jogo.golosCasa == null || jogo.golosFora == null) continue

    for (const previsao of jogo.previsoes) {
      const pontos = calcularPontuacaoJogo(previsao, {
        ...jogo,
        golosCasa: jogo.golosCasa!,
        golosFora: jogo.golosFora!,
      })
      await prisma.previsao.update({
        where: { id: previsao.id },
        data: { pontos, calculado: true },
      })
      total++
    }
  }
  return total
}

async function calcularBonusGrupo() {
  const grupos = await prisma.jogo.groupBy({
    by: ['grupo'],
    where: { fase: 'GRUPOS', grupo: { not: null }, encerrado: true },
  })

  for (const { grupo } of grupos) {
    if (!grupo) continue
    const jogosGrupo = await prisma.jogo.findMany({
      where: { fase: 'GRUPOS', grupo, encerrado: true },
      include: { previsoes: { where: { calculado: true } } },
    })
    if (jogosGrupo.length < 3) continue

    const userIds = [...new Set(jogosGrupo.flatMap(j => j.previsoes.map(p => p.userId)))]
    for (const userId of userIds) {
      const jaAplicado = jogosGrupo.every(j =>
        j.previsoes.find(p => p.userId === userId)?.bonusGrupo === true
      )
      if (jaAplicado) continue

      let todosAcertados = true
      for (const jogo of jogosGrupo) {
        const prev = jogo.previsoes.find(p => p.userId === userId)
        if (!prev || jogo.golosCasa == null || jogo.golosFora == null) { todosAcertados = false; break }
        if (!acertouResultado(prev, { golosCasa: jogo.golosCasa!, golosFora: jogo.golosFora! })) {
          todosAcertados = false; break
        }
      }

      if (todosAcertados) {
        for (const jogo of jogosGrupo) {
          const prev = jogo.previsoes.find(p => p.userId === userId)
          if (prev && prev.pontos != null && !prev.bonusGrupo) {
            await prisma.previsao.update({
              where: { id: prev.id },
              data: { pontos: prev.pontos + Math.round(5 / 3), bonusGrupo: true },
            })
          }
        }
      }
    }
  }
}
