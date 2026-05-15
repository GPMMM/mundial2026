import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CardLiga } from '@/components/ligas/CardLiga'
import { LigasActions } from './LigasActions'
import { redirect } from 'next/navigation'

export default async function LigasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const membros = await prisma.membroLiga.findMany({
    where: { userId: session.user.id },
    include: { liga: { include: { _count: { select: { membros: true } } } } },
    orderBy: { criadoEm: 'desc' },
  })

  const ligas = membros.map(m => ({ ...m.liga, isCriador: m.liga.criadorId === session.user.id }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">🏆 As minhas ligas</h1>
      </div>

      <LigasActions />

      {ligas.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p className="text-3xl mb-2">🏆</p>
          <p>Ainda não tens ligas. Cria uma ou entra com um código!</p>
        </div>
      )}

      <div className="space-y-3">
        {ligas.map(liga => (
          <CardLiga key={liga.id} liga={liga} isCriador={liga.isCriador} />
        ))}
      </div>
    </div>
  )
}
