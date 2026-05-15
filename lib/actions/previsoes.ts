'use server'

import { auth } from '../auth'
import { prisma } from '../prisma'
import { revalidatePath } from 'next/cache'

export async function guardarPrevisao(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const jogoId = formData.get('jogoId') as string
  const golosCasa = parseInt(formData.get('golosCasa') as string)
  const golosFora = parseInt(formData.get('golosFora') as string)
  const marcadorCasa = (formData.get('marcadorCasa') as string) || null
  const marcadorFora = (formData.get('marcadorFora') as string) || null

  if (!jogoId || isNaN(golosCasa) || isNaN(golosFora)) return { error: 'Invalid data.' }
  if (golosCasa < 0 || golosFora < 0) return { error: 'Goals cannot be negative.' }

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo) return { error: 'Match not found.' }
  if (jogo.encerrado || new Date() >= jogo.data) return { error: 'Predictions are closed for this match.' }

  await prisma.previsao.upsert({
    where: { userId_jogoId: { userId: session.user.id, jogoId } },
    update: { golosCasa, golosFora, marcadorCasa, marcadorFora, calculado: false, pontos: null },
    create: { userId: session.user.id, jogoId, golosCasa, golosFora, marcadorCasa, marcadorFora },
  })

  revalidatePath(`/jogos/${jogoId}`)
  return { success: true }
}

export async function guardarCampeao(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const campeao = (formData.get('campeao') as string) || null
  const campeaoId = formData.get('campeaoId') ? parseInt(formData.get('campeaoId') as string) : null

  await prisma.user.update({
    where: { id: session.user.id },
    data: { campeao, campeaoId },
  })

  revalidatePath('/perfil')
  return { success: true }
}
