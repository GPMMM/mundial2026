interface Props {
  semId: string[]
  duplicados: { id: number; teams: string[] }[]
}

export function SquadStatusList({ semId, duplicados }: Props) {
  return (
    <section className="border border-amber-500/40 bg-amber-500/5 rounded-xl p-4 space-y-4">
      <h2 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
        ⚠️ Squad Status (Admin)
        <span className="text-xs font-normal text-muted">— teams needing attention before group stage</span>
      </h2>

      {duplicados.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-300 mb-2 uppercase tracking-wide">
            Duplicate API IDs — wrong squad will be shown
          </p>
          <div className="space-y-1">
            {duplicados.map(({ id, teams }) => (
              <div key={id} className="flex items-start gap-3 text-xs bg-surface rounded-lg px-3 py-2">
                <span className="text-muted shrink-0">ID {id}</span>
                <span className="text-amber-300">
                  {teams.join(' & ')}
                </span>
                <span className="text-muted ml-auto shrink-0">— fix in seed-jogos.ts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {semId.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
            No API ID — squad dropdown will be empty
          </p>
          <div className="flex flex-wrap gap-1.5">
            {semId.map(name => (
              <span key={name} className="text-xs bg-red-500/10 border border-red-500/30 text-red-300 rounded px-2 py-0.5">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        Run <code className="bg-surface px-1 rounded">npx tsx prisma/check-team-ids.ts</code> to get correct IDs, then update <code className="bg-surface px-1 rounded">prisma/seed-jogos.ts</code> and re-seed.
      </p>
    </section>
  )
}
