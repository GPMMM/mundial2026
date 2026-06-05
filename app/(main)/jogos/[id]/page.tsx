import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getSquad } from '@/lib/api-football'
import { FormPrevisao } from '@/components/jogos/FormPrevisao'
import Image from 'next/image'
import { urlBandeira } from '@/lib/flags'
import type { ApiSquad } from '@/lib/api-football'

interface Props {
  params: Promise<{ id: string }>
}

const FASE_LABEL: Record<string, string> = {
  GRUPOS: 'Group Stage', TRINTA_E_DOIS: 'Round of 32', OITAVOS: 'Round of 16', QUARTOS: 'Quarter-finals', MEIAS: 'Semi-finals', FINAL: 'Final',
}

function TeamLogo({ name }: { id: number | null; name: string; size?: number }) {
  const src = urlBandeira(name, 80)
  if (!src) return <span className="text-5xl">🏳️</span>
  return (
    <Image src={src} alt={name} width={80} height={54} className="rounded object-cover shadow-md" unoptimized />
  )
}

export default async function JogoDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const jogo = await prisma.jogo.findUnique({
    where: { id },
    include: { previsoes: { include: { user: true }, take: 50 } },
  })
  if (!jogo) notFound()

  const agora = new Date()
  const jogoComecou = agora >= jogo.data
  const previsaoAtual = session?.user?.id
    ? jogo.previsoes.find(p => p.userId === session.user.id) ?? null
    : null

  // Load squad lists for scorer prediction (uses convocatória, not match lineup)
  let jogadoresCasa: { id: number; name: string; pos: string; number: number }[] = []
  let jogadoresFora: { id: number; name: string; pos: string; number: number }[] = []
  if (!jogoComecou) {
    try {
      const [casaData, foraData] = await Promise.allSettled([
        jogo.equipaCasaId ? getSquad(jogo.equipaCasaId) : Promise.resolve(null),
        jogo.equipaForaId ? getSquad(jogo.equipaForaId) : Promise.resolve(null),
      ])
      if (casaData.status === 'fulfilled' && casaData.value) {
        const squads: ApiSquad[] = casaData.value.response ?? []
        const squad = squads[0]
        if (squad) {
          jogadoresCasa = squad.players.map(p => ({
            id: p.id, name: p.name, pos: p.position, number: p.number ?? 0,
          }))
        }
      }
      if (foraData.status === 'fulfilled' && foraData.value) {
        const squads: ApiSquad[] = foraData.value.response ?? []
        const squad = squads[0]
        if (squad) {
          jogadoresFora = squad.players.map(p => ({
            id: p.id, name: p.name, pos: p.position, number: p.number ?? 0,
          }))
        }
      }
    } catch {
      // Squad fetch failed — predictions still work, just no goalscorer dropdown
    }
  }

  const outrasPrevisoes = jogoComecou
    ? jogo.previsoes.filter(p => p.userId !== session?.user?.id)
    : []

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header do jogo */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between text-xs text-muted mb-4">
          <span>{FASE_LABEL[jogo.fase]}{jogo.grupo ? ` — Group ${jogo.grupo}` : ''}</span>
          <span>{new Date(jogo.data).toLocaleString('en-GB', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamLogo id={jogo.equipaCasaId} name={jogo.equipaCasa} />
            <span className="font-bold text-center">{jogo.equipaCasa}</span>
          </div>

          <div className="flex flex-col items-center min-w-[100px]">
            {jogo.golosCasa != null ? (
              <div className="text-4xl font-black text-gold tabular-nums">
                {jogo.golosCasa} – {jogo.golosFora}
              </div>
            ) : (
              <div className="text-xl font-bold text-muted">vs</div>
            )}
            {jogo.encerrado && <span className="text-xs text-muted mt-1">FINAL</span>}
            {jogoComecou && !jogo.encerrado && (
              <span className="text-xs text-green font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green pulse-live" />
                LIVE
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamLogo id={jogo.equipaForaId} name={jogo.equipaFora} />
            <span className="font-bold text-center">{jogo.equipaFora}</span>
          </div>
        </div>

        {/* Marcadores */}
        {(jogo.marcadoresCasa.length > 0 || jogo.marcadoresFora.length > 0) && (
          <div className="mt-4 flex justify-between text-sm text-muted pt-4 border-t border-border">
            <div className="space-y-0.5">
              {jogo.marcadoresCasa.map((m, i) => <div key={i}>⚽ {m}</div>)}
            </div>
            <div className="space-y-0.5 text-right">
              {jogo.marcadoresFora.map((m, i) => <div key={i}>{m} ⚽</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Prediction form */}
      {session?.user ? (
        <FormPrevisao
          jogoId={jogo.id}
          equipaCasa={jogo.equipaCasa}
          equipaFora={jogo.equipaFora}
          previsaoAtual={previsaoAtual}
          jogadoresCasa={jogadoresCasa}
          jogadoresFora={jogadoresFora}
          fechado={jogoComecou}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <p className="text-muted text-sm">
            <a href="/login" className="text-gold hover:underline">Sign in</a> to make your prediction.
          </p>
        </div>
      )}

      {/* Other predictions (after match starts) */}
      {jogoComecou && outrasPrevisoes.length > 0 && (
        <section>
          <h3 className="font-bold mb-3">Participants&apos; predictions</h3>
          <div className="space-y-2">
            {outrasPrevisoes.map(p => (
              <div key={p.id} className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {p.user.imagem ? (
                    <Image src={p.user.imagem} alt={p.user.nome} width={32} height={32} className="rounded-full" unoptimized />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold">
                      {p.user.nome[0]}
                    </div>
                  )}
                  <span className="text-sm">{p.user.nome}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold tabular-nums">{p.golosCasa} – {p.golosFora}</span>
                  {p.pontos != null && (
                    <span className={`text-sm font-bold ${p.pontos > 0 ? 'text-green' : 'text-muted'}`}>
                      +{p.pontos}pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
