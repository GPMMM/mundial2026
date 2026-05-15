import Link from 'next/link'
import Image from 'next/image'
import type { Jogo, Previsao } from '@prisma/client'

interface Props {
  jogo: Jogo
  previsao?: Previsao | null
  isLive?: boolean
}

function TeamLogo({ id, name }: { id: number | null; name: string }) {
  if (!id) return <span className="text-3xl">🏳️</span>
  return (
    <Image
      src={`https://media.api-sports.io/football/teams/${id}.png`}
      alt={name}
      width={40}
      height={40}
      className="object-contain drop-shadow"
      unoptimized
    />
  )
}

export function CardJogo({ jogo, previsao, isLive }: Props) {
  const dataFormatada = new Date(jogo.data).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Link href={`/jogos/${jogo.id}`}>
      <div className={`relative bg-surface rounded-xl p-4 border transition-all hover:border-gold/40 hover:bg-surface-2 ${
        isLive ? 'border-green glow-gold' : 'border-border'
      }`}>
        {isLive && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-green font-semibold">
            <span className="w-2 h-2 rounded-full bg-green pulse-live" />
            LIVE
          </span>
        )}
        {jogo.grupo && (
          <div className="text-xs text-muted mb-2">Group {jogo.grupo}</div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <TeamLogo id={jogo.equipaCasaId} name={jogo.equipaCasa} />
            <span className="font-semibold text-sm truncate">{jogo.equipaCasa}</span>
          </div>

          <div className="flex flex-col items-center min-w-[72px]">
            {jogo.encerrado || jogo.golosCasa != null ? (
              <div className="text-2xl font-black text-gold tabular-nums">
                {jogo.golosCasa ?? '–'} – {jogo.golosFora ?? '–'}
              </div>
            ) : (
              <div className="text-xs text-muted text-center">{dataFormatada}</div>
            )}
            {jogo.encerrado && <div className="text-[10px] text-muted mt-0.5">FINAL</div>}
          </div>

          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="font-semibold text-sm truncate text-right">{jogo.equipaFora}</span>
            <TeamLogo id={jogo.equipaForaId} name={jogo.equipaFora} />
          </div>
        </div>

        {previsao && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">
              Your prediction: <span className="text-white font-semibold">{previsao.golosCasa} – {previsao.golosFora}</span>
            </span>
            {previsao.pontos != null && (
              <span className={`font-bold ${previsao.pontos > 0 ? 'text-green' : 'text-muted'}`}>
                +{previsao.pontos} pts
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
