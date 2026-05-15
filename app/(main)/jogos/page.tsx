import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CardJogo } from '@/components/jogos/CardJogo'
import type { Fase } from '@prisma/client'

const FASE_LABEL: Record<Fase, string> = {
  GRUPOS: 'Fase de Grupos',
  OITAVOS: 'Oitavos de Final',
  QUARTOS: 'Quartos de Final',
  MEIAS: 'Meias-Finais',
  FINAL: 'Final',
}

const FASE_ORDER: Fase[] = ['GRUPOS', 'OITAVOS', 'QUARTOS', 'MEIAS', 'FINAL']

export default async function JogosPage() {
  const session = await auth()
  const jogos = await prisma.jogo.findMany({ orderBy: { data: 'asc' } })

  let previsaoMap: Record<string, NonNullable<Awaited<ReturnType<typeof prisma.previsao.findFirst>>>> = {}
  if (session?.user?.id) {
    const previsoes = await prisma.previsao.findMany({
      where: { userId: session.user.id },
    })
    previsaoMap = Object.fromEntries(previsoes.map(p => [p.jogoId, p]))
  }

  // Group by fase, then by grupo
  const byFase: Record<Fase, typeof jogos> = { GRUPOS: [], OITAVOS: [], QUARTOS: [], MEIAS: [], FINAL: [] }
  for (const j of jogos) byFase[j.fase].push(j)

  const agora = new Date()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">⚽ Jogos</h1>

      {FASE_ORDER.map(fase => {
        const jogosFase = byFase[fase]
        if (jogosFase.length === 0) return null

        if (fase === 'GRUPOS') {
          const byGrupo: Record<string, typeof jogos> = {}
          for (const j of jogosFase) {
            const g = j.grupo ?? 'Sem Grupo'
            if (!byGrupo[g]) byGrupo[g] = []
            byGrupo[g].push(j)
          }
          return (
            <section key={fase}>
              <h2 className="text-xl font-bold mb-4 text-gold">{FASE_LABEL[fase]}</h2>
              <div className="space-y-6">
                {Object.entries(byGrupo).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, gs]) => (
                  <div key={grupo}>
                    <h3 className="text-sm font-semibold text-muted uppercase mb-2">Grupo {grupo}</h3>
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

        return (
          <section key={fase}>
            <h2 className="text-xl font-bold mb-4 text-gold">{FASE_LABEL[fase]}</h2>
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
          <p>Os jogos serão sincronizados em breve.</p>
        </div>
      )}
    </div>
  )
}
