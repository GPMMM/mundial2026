import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json([], { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const ligaId = searchParams.get('ligaId')?.trim() ?? ''

  if (q.length < 2) return Response.json([])

  const existingIds = ligaId
    ? (await prisma.membroLiga.findMany({ where: { ligaId }, select: { userId: true } })).map(m => m.userId)
    : []

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: existingIds },
      OR: [
        { nome: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, nome: true, email: true, imagem: true },
    take: 8,
  })

  return Response.json(users)
}
