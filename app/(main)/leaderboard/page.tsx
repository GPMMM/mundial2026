import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TabelaLeaderboard } from '@/components/leaderboard/TabelaLeaderboard'

async function getFullLeaderboard() {
  const previsoes = await prisma.previsao.groupBy({
    by: ['userId'],
    _sum: { pontos: true },
    _count: { id: true },
    where: { calculado: true },
    orderBy: { _sum: { pontos: 'desc' } },
  })

  const userIds = previsoes.map(p => p.userId)
  const users = await prisma.user.findMany({ where: { id: { in: userIds } } })
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const result = await Promise.all(
    previsoes.map(async p => {
      const acertos = await prisma.previsao.count({
        where: { userId: p.userId, calculado: true, pontos: { gt: 0 } },
      })
      return {
        userId: p.userId,
        nome: userMap[p.userId]?.nome ?? 'Utilizador',
        imagem: userMap[p.userId]?.imagem ?? null,
        totalPontos: p._sum.pontos ?? 0,
        totalPrevisoes: p._count.id,
        acertos,
      }
    })
  )
  return result
}

export default async function LeaderboardPage() {
  const session = await auth()
  const entradas = await getFullLeaderboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">🏅 Classificação Geral</h1>
        <p className="text-muted text-sm mt-1">{entradas.length} participantes</p>
      </div>

      <TabelaLeaderboard entradas={entradas} destaqueUserId={session?.user?.id} />
    </div>
  )
}
