import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CardJogo } from '@/components/jogos/CardJogo'
import { CampeaoForm } from './CampeaoForm'
import Image from 'next/image'
import { signOut } from '@/lib/auth'

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [user, previsoes, totalPontos] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.previsao.findMany({
      where: { userId: session.user.id },
      include: { jogo: true },
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.previsao.aggregate({
      where: { userId: session.user.id, calculado: true },
      _sum: { pontos: true },
    }),
  ])

  if (!user) redirect('/login')

  const pontos = totalPontos._sum.pontos ?? 0
  const previsoesFaitas = previsoes.length
  const acertos = previsoes.filter(p => p.calculado && (p.pontos ?? 0) > 0).length
  const percentagem = previsoesFaitas > 0 ? Math.round((acertos / previsoesFaitas) * 100) : 0

  // All WC teams for the champion form (fetched from our stored games)
  const equipas = await prisma.jogo.findMany({
    select: { equipaCasa: true, equipaCasaId: true, equipaFora: true, equipaForaId: true },
    distinct: ['equipaCasa'],
    orderBy: { equipaCasa: 'asc' },
  })
  const allEquipas = [
    ...equipas.map(e => ({ nome: e.equipaCasa, id: e.equipaCasaId })),
    ...equipas.map(e => ({ nome: e.equipaFora, id: e.equipaForaId })),
  ]
  const uniqueEquipas = Array.from(new Map(allEquipas.map(e => [e.nome, e])).values())
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        {user.imagem ? (
          <Image src={user.imagem} alt={user.nome} width={64} height={64} className="rounded-full" unoptimized />
        ) : (
          <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center text-2xl font-black text-gold">
            {user.nome[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black">{user.nome}</h1>
          <p className="text-muted text-sm">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pontos', value: pontos, color: 'text-gold' },
          { label: 'Previsões', value: previsoesFaitas, color: 'text-white' },
          { label: 'Precisão', value: `${percentagem}%`, color: 'text-green' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campeão */}
      <CampeaoForm
        campeaoAtual={user.campeao}
        campeaoIdAtual={user.campeaoId}
        equipas={uniqueEquipas}
      />

      {/* Histórico */}
      <section>
        <h2 className="font-bold text-lg mb-3">Histórico de previsões</h2>
        {previsoes.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">Ainda não fizeste nenhuma previsão.</p>
        ) : (
          <div className="space-y-2">
            {previsoes.map(p => (
              <div key={p.id} className="bg-surface rounded-xl border border-border p-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{p.jogo.equipaCasa} vs {p.jogo.equipaFora}</span>
                  {p.pontos != null && (
                    <span className={`font-bold ${p.pontos > 0 ? 'text-green' : 'text-muted'}`}>
                      +{p.pontos} pts
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    Previsão: <span className="text-white">{p.golosCasa} – {p.golosFora}</span>
                    {p.jogo.golosCasa != null && (
                      <> · Real: <span className="text-white">{p.jogo.golosCasa} – {p.jogo.golosFora}</span></>
                    )}
                  </span>
                  <span>{new Date(p.jogo.data).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <form action={async () => {
        'use server'
        await signOut({ redirectTo: '/' })
      }}>
        <button
          type="submit"
          className="w-full py-3 text-sm border border-border rounded-xl hover:bg-surface-2 transition-colors text-muted"
        >
          Terminar sessão
        </button>
      </form>
    </div>
  )
}
