import Link from 'next/link'

interface Props {
  liga: {
    id: string
    nome: string
    descricao: string | null
    codigoConvite: string
    _count?: { membros: number }
  }
  isCriador?: boolean
}

export function CardLiga({ liga, isCriador }: Props) {
  return (
    <Link href={`/ligas/${liga.id}`}>
      <div className="bg-surface rounded-xl border border-border p-4 hover:border-gold/40 hover:bg-surface-2 transition-all">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg">{liga.nome}</h3>
            {liga.descricao && <p className="text-sm text-muted mt-1">{liga.descricao}</p>}
          </div>
          {isCriador && (
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full shrink-0">Owner</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span>👥 {liga._count?.membros ?? 0} members</span>
          <span>Code: <span className="font-mono text-white">{liga.codigoConvite}</span></span>
        </div>
      </div>
    </Link>
  )
}
