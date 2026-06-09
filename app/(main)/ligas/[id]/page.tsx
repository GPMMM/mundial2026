import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TabelaLeaderboard } from '@/components/leaderboard/TabelaLeaderboard'
import { RemoverMembroBtn } from './RemoverMembroBtn'
import { CopyButton } from './CopyButton'
import Image from 'next/image'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LigaDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const liga = await prisma.liga.findUnique({
    where: { id },
    include: {
      membros: { include: { user: true }, orderBy: { criadoEm: 'asc' } },
      criador: true,
    },
  })
  if (!liga) notFound()

  const isMembro = liga.membros.some(m => m.userId === session.user.id)
  if (!isMembro) redirect(`/ligas/entrar/${liga.codigoConvite}`)

  const isCriador = liga.criadorId === session.user.id
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const linkConvite = `${baseUrl}/ligas/entrar/${liga.codigoConvite}`

  // Leaderboard da liga
  const userIds = liga.membros.map(m => m.userId)

  const [pontosPorUser, totalPrevisoesPorUser] = await Promise.all([
    prisma.previsao.groupBy({
      by: ['userId'],
      _sum: { pontos: true },
      where: { userId: { in: userIds }, calculado: true },
      orderBy: { _sum: { pontos: 'desc' } },
    }),
    prisma.previsao.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { userId: { in: userIds } },
    }),
  ])

  const totalPrevisaoMap = Object.fromEntries(
    totalPrevisoesPorUser.map(p => [p.userId, p._count.id])
  )

  const acertosMap: Record<string, number> = {}
  for (const p of pontosPorUser) {
    acertosMap[p.userId] = await prisma.previsao.count({
      where: { userId: p.userId, calculado: true, pontos: { gt: 0 } },
    })
  }

  const userMap = Object.fromEntries(liga.membros.map(m => [m.userId, m.user]))

  const pontosMap = Object.fromEntries(pontosPorUser.map(p => [p.userId, p._sum.pontos ?? 0]))

  const leaderboard = userIds
    .map(uid => ({
      userId: uid,
      nome: userMap[uid]?.nome ?? 'User',
      imagem: userMap[uid]?.imagem ?? null,
      totalPontos: pontosMap[uid] ?? 0,
      totalPrevisoes: totalPrevisaoMap[uid] ?? 0,
      acertos: acertosMap[uid] ?? 0,
    }))
    .sort((a, b) => b.totalPontos - a.totalPontos)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black">{liga.nome}</h1>
        {liga.descricao && <p className="text-muted mt-1">{liga.descricao}</p>}
        <p className="text-xs text-muted mt-1">Created by {liga.criador.nome}</p>
      </div>

      {/* Link de convite */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-xs text-muted mb-2">Invite link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-surface-2 rounded-lg px-3 py-2 text-sm font-mono break-all">
            {linkConvite}
          </code>
          <CopyButton text={linkConvite} />
        </div>

        <p className="text-xs text-muted mt-1">
          Code: <span className="font-mono text-white font-bold">{liga.codigoConvite}</span>
        </p>
      </div>

      {/* Leaderboard */}
      <section>
        <h2 className="font-bold text-lg mb-3">Standings</h2>
        <TabelaLeaderboard entradas={leaderboard} destaqueUserId={session.user.id} />
      </section>

      {/* Membros (admin view) */}
      {isCriador && (
        <section>
          <h2 className="font-bold text-lg mb-3">Members ({liga.membros.length})</h2>
          <div className="space-y-2">
            {liga.membros.map(m => (
              <div key={m.id} className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {m.user.imagem ? (
                    <Image src={m.user.imagem} alt={m.user.nome} width={32} height={32} className="rounded-full" unoptimized />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold">
                      {m.user.nome[0]}
                    </div>
                  )}
                  <span className="text-sm">{m.user.nome}</span>
                  {m.userId === liga.criadorId && (
                    <span className="text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">Owner</span>
                  )}
                </div>
                {m.userId !== liga.criadorId && m.userId !== session.user.id && (
                  <RemoverMembroBtn ligaId={liga.id} userId={m.userId} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

