import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getFixtureLineups } from '@/lib/api-football'
import { FormPrevisao } from '@/components/jogos/FormPrevisao'
import Image from 'next/image'
import type { ApiLineup } from '@/lib/api-football'

interface Props {
  params: Promise<{ id: string }>
}

const FASE_LABEL: Record<string, string> = {
  GRUPOS: 'Fase de Grupos', OITAVOS: 'Oitavos', QUARTOS: 'Quartos', MEIAS: 'Meias-Finais', FINAL: 'Final',
}

function TeamLogo({ id, name, size = 64 }: { id: number | null; name: string; size?: number }) {
  if (!id) return <div className="text-5xl">🏳️</div>
  return (
    <Image
      src={`https://media.api-sports.io/football/teams/${id}.png`}
      alt={name} width={size} height={size}
      className="object-contain drop-shadow-lg"
      unoptimized
    />
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

  // Load lineups if game hasn't started yet (to allow scorer selection)
  let jogadoresCasa: { id: number; name: string; pos: string; number: number }[] = []
  let jogadoresFora: { id: number; name: string; pos: string; number: number }[] = []
  if (!jogoComecou) {
    try {
      const lineupData = await getFixtureLineups(jogo.fixtureId)
      const lineups: ApiLineup[] = lineupData.response ?? []
      const [casaLineup, foraLineup] = lineups
      if (casaLineup) {
        jogadoresCasa = [...casaLineup.startXI, ...casaLineup.substitutes].map(p => ({
          id: p.player.id, name: p.player.name, pos: p.player.pos, number: p.player.number,
        }))
      }
      if (foraLineup) {
        jogadoresFora = [...foraLineup.startXI, ...foraLineup.substitutes].map(p => ({
          id: p.player.id, name: p.player.name, pos: p.player.pos, number: p.player.number,
        }))
      }
    } catch { /* lineups not available yet */ }
  }

  const outrasPrevisoes = jogoComecou
    ? jogo.previsoes.filter(p => p.userId !== session?.user?.id)
    : []

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header do jogo */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between text-xs text-muted mb-4">
          <span>{FASE_LABEL[jogo.fase]}{jogo.grupo ? ` — Grupo ${jogo.grupo}` : ''}</span>
          <span>{new Date(jogo.data).toLocaleString('pt-PT', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
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
                AO VIVO
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

      {/* Formulário de previsão */}
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
            <a href="/login" className="text-gold hover:underline">Inicia sessão</a> para fazer a tua previsão
          </p>
        </div>
      )}

      {/* Previsões dos outros (após início do jogo) */}
      {jogoComecou && outrasPrevisoes.length > 0 && (
        <section>
          <h3 className="font-bold mb-3">Previsões dos participantes</h3>
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
