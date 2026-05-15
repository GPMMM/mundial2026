import Image from 'next/image'

export interface EntradaLeaderboard {
  userId: string
  nome: string
  imagem: string | null
  totalPontos: number
  totalPrevisoes: number
  acertos: number
}

interface Props {
  entradas: EntradaLeaderboard[]
  destaqueUserId?: string
}

const MEDALHAS = ['🥇', '🥈', '🥉']

export function TabelaLeaderboard({ entradas, destaqueUserId }: Props) {
  if (entradas.length === 0) {
    return <p className="text-muted text-center py-8">No standings yet.</p>
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-2 text-xs text-muted uppercase">
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right">Predictions</th>
            <th className="px-4 py-3 text-right">Correct</th>
            <th className="px-4 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((e, i) => {
            const isMe = e.userId === destaqueUserId
            return (
              <tr
                key={e.userId}
                className={`border-t border-border transition-colors ${
                  isMe ? 'bg-gold/10' : 'hover:bg-surface-2'
                }`}
              >
                <td className="px-4 py-3 text-sm font-bold">
                  {MEDALHAS[i] ?? <span className="text-muted">{i + 1}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {e.imagem ? (
                      <Image src={e.imagem} alt={e.nome} width={32} height={32} className="rounded-full" unoptimized />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold">
                        {e.nome[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`font-medium ${isMe ? 'text-gold' : ''}`}>
                      {e.nome} {isMe && <span className="text-xs text-muted">(you)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-muted">{e.totalPrevisoes}</td>
                <td className="px-4 py-3 text-right text-sm text-muted">{e.acertos}</td>
                <td className="px-4 py-3 text-right font-black text-gold">{e.totalPontos}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
