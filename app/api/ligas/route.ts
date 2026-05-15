import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json([], { status: 401 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (userId !== session.user.id) return Response.json([], { status: 403 })

  const membros = await prisma.membroLiga.findMany({
    where: { userId: session.user.id },
    include: { liga: { include: { _count: { select: { membros: true } } } } },
    orderBy: { criadoEm: 'desc' },
  })

  return Response.json(membros.map(m => m.liga))
}
