import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CardJogo } from '@/components/jogos/CardJogo'
import { TabelaLeaderboard } from '@/components/leaderboard/TabelaLeaderboard'
import { SquadStatusList } from '@/components/admin/SquadStatusList'
import Link from 'next/link'

async function getSquadStatus() {
  // Get all teams from upcoming fixtures
  const jogos = await prisma.jogo.findMany({
    where: { encerrado: false, fase: 'GRUPOS' },
    select: { equipaCasa: true, equipaCasaId: true, equipaFora: true, equipaForaId: true },
  })

  // Collect all (name, id) pairs
  const teamMap = new Map<string, number | null>()
  for (const j of jogos) {
    teamMap.set(j.equipaCasa, j.equipaCasaId)
    teamMap.set(j.equipaFora, j.equipaForaId)
  }

  // Find teams with null IDs
  const semId = [...teamMap.entries()]
    .filter(([, id]) => id === null)
    .map(([name]) => name)
    .sort()

  // Find teams sharing the same API ID (duplicates)
  const idToTeams = new Map<number, string[]>()
  for (const [name, id] of teamMap.entries()) {
    if (id === null) continue
    const existing = idToTeams.get(id) ?? []
    idToTeams.set(id, [...existing, name])
  }
  const duplicados = [...idToTeams.entries()]
    .filter(([, teams]) => teams.length > 1)
    .map(([id, teams]) => ({ id, teams: teams.sort() }))
    .sort((a, b) => a.id - b.id)

  return { semId, duplicados }
}

async function getLeaderboard(limit = 10) {
  const previsoes = await prisma.previsao.groupBy({
    by: ['userId'],
    _sum: { pontos: true },
    _count: { id: true },
    where: { calculado: true },
    orderBy: { _sum: { pontos: 'desc' } },
    take: limit,
  })

  const userIds = previsoes.map(p => p.userId)
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } })
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const acertosMap: Record<string, number> = {}
  for (const p of previsoes) {
    const count = await prisma.previsao.count({
      where: { userId: p.userId, calculado: true, pontos: { gt: 0 } },
    })
    acertosMap[p.userId] = count
  }

  return previsoes.map(p => ({
    userId: p.userId,
    nome: userMap[p.userId]?.nome ?? 'User',
    imagem: userMap[p.userId]?.imagem ?? null,
    totalPontos: p._sum.pontos ?? 0,
    totalPrevisoes: p._count.id,
    acertos: acertosMap[p.userId] ?? 0,
  }))
}

export default async function HomePage() {
  const session = await auth()

  const agora = new Date()
  const [proximosJogos, jogosAoVivo, leaderboard, squadStatus] = await Promise.all([
    prisma.jogo.findMany({
      where: { data: { gte: agora }, encerrado: false },
      orderBy: { data: 'asc' },
      take: 5,
    }),
    prisma.jogo.findMany({
      where: { data: { lte: agora }, encerrado: false },
      orderBy: { data: 'asc' },
    }),
    getLeaderboard(10),
    getSquadStatus(),
  ])

  let previsaoMap: Record<string, NonNullable<Awaited<ReturnType<typeof prisma.previsao.findFirst>>>> = {}
  if (session?.user?.id) {
    const jogosIds = [...proximosJogos, ...jogosAoVivo].map(j => j.id)
    const previsoes = await prisma.previsao.findMany({
      where: { userId: session.user.id, jogoId: { in: jogosIds } },
    })
    previsaoMap = Object.fromEntries(previsoes.map(p => [p.jogoId, p]))
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <h1 className="text-3xl font-black text-gold">🏆 World Cup 2026</h1>
        <p className="text-muted mt-1">Predict, compete, win!</p>
      </div>

      {jogosAoVivo.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green pulse-live" />
            LIVE
          </h2>
          <div className="space-y-3">
            {jogosAoVivo.map(j => (
              <CardJogo key={j.id} jogo={j} previsao={previsaoMap[j.id]} isLive />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Upcoming matches</h2>
          <Link href="/jogos" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        {proximosJogos.length > 0 ? (
          <div className="space-y-3">
            {proximosJogos.map(j => (
              <CardJogo key={j.id} jogo={j} previsao={previsaoMap[j.id]} />
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm text-center py-4">No matches scheduled.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Top 10</h2>
          <Link href="/leaderboard" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <TabelaLeaderboard entradas={leaderboard} destaqueUserId={session?.user?.id} />
      </section>

      {session?.user?.role === 'ADMIN' && (squadStatus.semId.length > 0 || squadStatus.duplicados.length > 0) && (
        <SquadStatusList semId={squadStatus.semId} duplicados={squadStatus.duplicados} />
      )}
    </div>
  )
}
