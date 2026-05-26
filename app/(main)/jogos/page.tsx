import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CardJogo } from '@/components/jogos/CardJogo'
import type { Fase } from '@prisma/client'

const FASE_LABEL: Record<Fase, string> = {
  GRUPOS: 'Group Stage',
  TRINTA_E_DOIS: 'Round of 32',
  OITAVOS: 'Round of 16',
  QUARTOS: 'Quarter-finals',
  MEIAS: 'Semi-finals',
  FINAL: 'Final',
}

const FASE_SHORT: Record<Fase, string> = {
  GRUPOS: 'Groups',
  TRINTA_E_DOIS: 'R32',
  OITAVOS: 'R16',
  QUARTOS: 'QF',
  MEIAS: 'SF',
  FINAL: 'Final',
}

const FASE_ORDER: Fase[] = ['GRUPOS', 'TRINTA_E_DOIS', 'OITAVOS', 'QUARTOS', 'MEIAS', 'FINAL']

interface Props {
  searchParams: Promise<{ fase?: string }>
}

export default async function JogosPage({ searchParams }: Props) {
  const { fase: faseParam } = await searchParams
  const faseFiltro: Fase | null = FASE_ORDER.includes(faseParam as Fase) ? (faseParam as Fase) : null

  const session = await auth()

  const [jogos, faseCountRows] = await Promise.all([
    prisma.jogo.findMany({
      where: faseFiltro ? { fase: faseFiltro } : undefined,
      orderBy: { data: 'asc' },
    }),
    prisma.jogo.groupBy({ by: ['fase'], _count: { id: true } }),
  ])

  const faseCount: Partial<Record<Fase, number>> = {}
  for (const r of faseCountRows) faseCount[r.fase] = r._count.id

  let previsaoMap: Record<string, NonNullable<Awaited<ReturnType<typeof prisma.previsao.findFirst>>>> = {}
  let semCampeao = false
  if (session?.user?.id) {
    const [previsoes, user] = await Promise.all([
      prisma.previsao.findMany({ where: { userId: session.user.id } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { campeao: true } }),
    ])
    previsaoMap = Object.fromEntries(previsoes.map(p => [p.jogoId, p]))
    semCampeao = !user?.campeao
  }

  const byFase: Record<Fase, typeof jogos> = { GRUPOS: [], TRINTA_E_DOIS: [], OITAVOS: [], QUARTOS: [], MEIAS: [], FINAL: [] }
  for (const j of jogos) byFase[j.fase].push(j)

  const agora = new Date()

  // Phases that have at least one game in DB
  const fasesComJogos = FASE_ORDER.filter(f => (faseCount[f] ?? 0) > 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">⚽ Matches</h1>

      {semCampeao && (
        <a href="/perfil" className="flex items-center gap-3 bg-gold/10 border border-gold/40 rounded-xl px-4 py-3 hover:bg-gold/20 transition-colors">
          <span className="text-2xl">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gold text-sm">Champion prediction missing!</p>
            <p className="text-xs text-muted mt-0.5">Pick your World Cup winner and earn +20 bonus points.</p>
          </div>
          <span className="text-gold text-sm font-bold shrink-0">Pick now →</span>
        </a>
      )}

      {/* Phase filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <a
          href="/jogos"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !faseFiltro
              ? 'bg-gold text-dark'
              : 'bg-surface border border-border text-muted hover:text-foreground hover:border-gold/50'
          }`}
        >
          All
        </a>
        {fasesComJogos.map(f => (
          <a
            key={f}
            href={`/jogos?fase=${f}`}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              faseFiltro === f
                ? 'bg-gold text-dark'
                : 'bg-surface border border-border text-muted hover:text-foreground hover:border-gold/50'
            }`}
          >
            {FASE_SHORT[f]}
          </a>
        ))}
      </div>

      {/* Games list */}
      {FASE_ORDER.map(fase => {
        const jogosFase = byFase[fase]
        if (jogosFase.length === 0) return null

        if (fase === 'GRUPOS') {
          const byGrupo: Record<string, typeof jogos> = {}
          for (const j of jogosFase) {
            const g = j.grupo ?? 'No Group'
            if (!byGrupo[g]) byGrupo[g] = []
            byGrupo[g].push(j)
          }
          return (
            <section key={fase}>
              {!faseFiltro && <h2 className="text-xl font-bold mb-4 text-gold">{FASE_LABEL[fase]}</h2>}
              <div className="space-y-6">
                {Object.entries(byGrupo).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, gs]) => (
                  <div key={grupo}>
                    <h3 className="text-sm font-semibold text-muted uppercase mb-2">Group {grupo}</h3>
                    <div className="space-y-2">
                      {gs.map(j => (
                        <CardJogo
                          key={j.id} jogo={j}
                          previsao={previsaoMap[j.id]}
                          isLive={j.data <= agora && !j.encerrado}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        // Knockout phases — show bracket label as section heading
        return (
          <section key={fase}>
            {!faseFiltro && <h2 className="text-xl font-bold mb-4 text-gold">{FASE_LABEL[fase]}</h2>}
            <div className="space-y-2">
              {jogosFase.map(j => (
                <CardJogo
                  key={j.id} jogo={j}
                  previsao={previsaoMap[j.id]}
                  isLive={j.data <= agora && !j.encerrado}
                />
              ))}
            </div>
          </section>
        )
      })}

      {jogos.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">⚽</p>
          <p>No matches for this phase yet.</p>
        </div>
      )}
    </div>
  )
}
