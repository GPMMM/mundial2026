import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { forceSyncAction, alterarRole } from '@/lib/actions/admin'
import { SyncButton } from './SyncButton'
import Image from 'next/image'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/')

  const [users, totalJogos, totalPrevisoes] = await Promise.all([
    prisma.user.findMany({ orderBy: { criadoEm: 'desc' } }),
    prisma.jogo.count(),
    prisma.previsao.count(),
  ])

  const jogosSincronizados = await prisma.jogo.count({ where: { encerrado: true } })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">⚙️ Administração</h1>
        <p className="text-muted text-sm mt-1">Painel de controlo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Utilizadores', value: users.length },
          { label: 'Jogos', value: totalJogos },
          { label: 'Encerrados', value: jogosSincronizados },
          { label: 'Previsões', value: totalPrevisoes },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-black text-gold">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sync */}
      <section className="bg-surface rounded-xl border border-border p-5">
        <h2 className="font-bold mb-1">Sincronização manual</h2>
        <p className="text-muted text-xs mb-4">Força sincronização de jogos e cálculo de pontos via API-Football.</p>
        <SyncButton action={forceSyncAction} />
      </section>

      {/* Users */}
      <section>
        <h2 className="font-bold text-lg mb-3">Utilizadores ({users.length})</h2>
        <div className="rounded-xl overflow-hidden border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2 text-xs text-muted uppercase">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Desde</th>
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
                    {new Date(u.criadoEm).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== session.user.id && (
                      <form action={async () => {
                        'use server'
                        await alterarRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')
                      }}>
                        <button type="submit" className="text-xs text-muted hover:text-white transition-colors">
                          {u.role === 'ADMIN' ? 'Remover ADMIN' : 'Tornar ADMIN'}
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
