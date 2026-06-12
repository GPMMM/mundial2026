import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { forceSyncAction, alterarRole, calcularPontosAction } from '@/lib/actions/admin'
import { SyncButton } from './SyncButton'
import { ResultadoForm } from './ResultadoForm'
import { CalcPontosBtn } from './CalcPontosBtn'
import Image from 'next/image'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/')

  const [users, totalJogos, totalPrevisoes, jogos] = await Promise.all([
    prisma.user.findMany({ orderBy: { criadoEm: 'desc' } }),
    prisma.jogo.count(),
    prisma.previsao.count(),
    prisma.jogo.findMany({ orderBy: { data: 'asc' } }),
  ])

  const jogosSincronizados = jogos.filter(j => j.encerrado).length
  const naoCalculadas = await prisma.previsao.count({ where: { calculado: false } })

  const jogosPorGrupo = jogos.reduce<Record<string, typeof jogos>>((acc, j) => {
    const key = j.grupo ? `Group ${j.grupo}` : j.fase
    acc[key] = acc[key] ?? []
    acc[key].push(j)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">⚙️ Administration</h1>
        <p className="text-muted text-sm mt-1">Control panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Users', value: users.length },
          { label: 'Matches', value: totalJogos },
          { label: 'Finished', value: jogosSincronizados },
          { label: 'Predictions', value: totalPrevisoes },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-black text-gold">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calculate points */}
      <section className="bg-surface rounded-xl border border-border p-5">
        <h2 className="font-bold mb-1">Calculate points</h2>
        <p className="text-muted text-xs mb-4">
          Process all finished matches and calculate points for uncalculated predictions.
          {naoCalculadas > 0 && <span className="ml-1 text-gold font-bold">{naoCalculadas} pending</span>}
        </p>
        <CalcPontosBtn action={calcularPontosAction} />
      </section>

      {/* Match results */}
      <section className="bg-surface rounded-xl border border-border p-5">
        <h2 className="font-bold mb-4">Match results</h2>
        <div className="space-y-6">
          {Object.entries(jogosPorGrupo).map(([grupo, matches]) => (
            <div key={grupo}>
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{grupo}</h3>
              <div className="space-y-2">
                {matches.map(j => (
                  <div key={j.id} className="border-b border-border pb-2">
                    <div className="text-xs text-muted mb-1">
                      {new Date(j.data).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <ResultadoForm jogo={j} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sync */}
      <section className="bg-surface rounded-xl border border-border p-5">
        <h2 className="font-bold mb-1">API sync</h2>
        <p className="text-muted text-xs mb-4">Force match sync via API-Football (requires paid plan for 2026 season).</p>
        <SyncButton action={forceSyncAction} />
      </section>

      {/* Users */}
      <section>
        <h2 className="font-bold text-lg mb-3">Users ({users.length})</h2>
        <div className="rounded-xl overflow-hidden border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 text-xs text-muted uppercase">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Since</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.imagem ? (
                        <Image src={u.imagem} alt={u.nome} width={28} height={28} className="rounded-full" unoptimized />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold">
                          {u.nome[0]}
                        </div>
                      )}
                      <span className="text-sm">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-gold/20 text-gold' : 'bg-surface-3 text-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(u.criadoEm).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== session.user.id && (
                      <form action={async () => {
                        'use server'
                        await alterarRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')
                      }}>
                        <button type="submit" className="text-xs text-muted hover:text-white transition-colors">
                          {u.role === 'ADMIN' ? 'Remove ADMIN' : 'Make ADMIN'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
