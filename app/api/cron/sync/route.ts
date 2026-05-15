import { prisma } from '@/lib/prisma'
import { getFixtures, getFixtureEvents, getFixtureLineups, parseFase, parseGrupo } from '@/lib/api-football'
import { calcularPontuacaoJogo, acertouResultado } from '@/lib/pontuacao'
import type { ApiFixture } from '@/lib/api-football'
import type { Fase } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await getFixtures()
    const fixtures: ApiFixture[] = data.response ?? []

    for (const f of fixtures) {
      const fase = parseFase(f.league.round) as Fase
      const grupo = f.league.group
        ? f.league.group.replace(/^Group\s*/i, '').toUpperCase()
        : parseGrupo(f.league.round)

      await prisma.jogo.upsert({
        where: { fixtureId: f.fixture.id },
        update: {
          data: new Date(f.fixture.date),
          fase,
          grupo,
          golosCasa: f.goals.home,
          golosFora: f.goals.away,
          encerrado: f.fixture.status.short === 'FT' || f.fixture.status.short === 'AET' || f.fixture.status.short === 'PEN',
        },
        create: {
          fixtureId: f.fixture.id,
          equipaCasa: f.teams.home.name,
          equipaFora: f.teams.away.name,
          equipaCasaId: f.teams.home.id,
          equipaForaId: f.teams.away.id,
          paisCasa: f.teams.home.name,
          paisFora: f.teams.away.name,
          data: new Date(f.fixture.date),
          fase,
          grupo,
          golosCasa: f.goals.home,
          golosFora: f.goals.away,
          encerrado: f.fixture.status.short === 'FT',
        },
      })
    }

    // For finished games, fetch events & calculate points
    const jogosFechados = await prisma.jogo.findMany({
      where: { encerrado: true },
      include: { previsoes: { where: { calculado: false } } },
    })

    for (const jogo of jogosFechados) {
      if (jogo.previsoes.length === 0) continue

      // Fetch scorers if not stored yet
      let marcadoresCasa = jogo.marcadoresCasa
      let marcadoresFora = jogo.marcadoresFora
      if (marcadoresCasa.length === 0 && marcadoresFora.length === 0) {
        try {
          const eventsData = await getFixtureEvents(jogo.fixtureId)
          const events = eventsData.response ?? []
          const lineupData = await getFixtureLineups(jogo.fixtureId)
          const lineups = lineupData.response ?? []

          const homeTeamId = lineups[0]?.team?.id
          for (const evt of events) {
            if (evt.type === 'Goal' && evt.detail !== 'Missed Penalty') {
              const name = evt.player?.name ?? ''
              if (evt.team?.id === homeTeamId) marcadoresCasa.push(name)
              else marcadoresFora.push(name)
            }
          }
          await prisma.jogo.update({
            where: { id: jogo.id },
            data: { marcadoresCasa, marcadoresFora },
          })
        } catch { /* ignore event fetch errors */ }
      }

      const jogoComMarcadores = { ...jogo, marcadoresCasa, marcadoresFora }

      for (const previsao of jogo.previsoes) {
        if (jogo.golosCasa == null || jogo.golosFora == null) continue
        const jogoFinal = {
          ...jogoComMarcadores,
          golosCasa: jogo.golosCasa!,
          golosFora: jogo.golosFora!,
        }
        const pontos = calcularPontuacaoJogo(previsao, jogoFinal)
        await prisma.previsao.update({
          where: { id: previsao.id },
          data: { pontos, calculado: true },
        })
      }
    }

    // Bonus: full group stage for a user (+5 if all 3 games correct in same group)
    await calcularBonusGrupo()

    return Response.json({ ok: true, fixtures: fixtures.length })
  } catch (err) {
    console.error('[cron/sync]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
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
      let todosAcertados = true
      for (const jogo of jogosGrupo) {
        const prev = jogo.previsoes.find(p => p.userId === userId)
        if (!prev || jogo.golosCasa == null || jogo.golosFora == null) { todosAcertados = false; break }
        if (!acertouResultado(prev, { golosCasa: jogo.golosCasa!, golosFora: jogo.golosFora! })) {
          todosAcertados = false
          break
        }
      }
      if (todosAcertados) {
        for (const jogo of jogosGrupo) {
          const prev = jogo.previsoes.find(p => p.userId === userId)
          if (prev && prev.pontos != null) {
            await prisma.previsao.update({
              where: { id: prev.id },
              data: { pontos: prev.pontos + Math.round(5 / 3) },
            })
          }
        }
      }
    }
  }
}
