'use server'

import { auth } from '../auth'
import { prisma } from '../prisma'
import { revalidatePath } from 'next/cache'

export async function guardarPrevisao(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Não autenticado.' }

  const jogoId = formData.get('jogoId') as string
  const golosCasa = parseInt(formData.get('golosCasa') as string)
  const golosFora = parseInt(formData.get('golosFora') as string)
  const marcadorCasa = (formData.get('marcadorCasa') as string) || null
  const marcadorFora = (formData.get('marcadorFora') as string) || null

  if (!jogoId || isNaN(golosCasa) || isNaN(golosFora)) return { error: 'Dados inválidos.' }
  if (golosCasa < 0 || golosFora < 0) return { error: 'Golos não podem ser negativos.' }

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo) return { error: 'Jogo não encontrado.' }
  if (jogo.encerrado || new Date() >= jogo.data) return { error: 'Previsões fechadas para este jogo.' }

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
  if (!session?.user?.id) return { error: 'Não autenticado.' }

  const campeao = (formData.get('campeao') as string) || null
  const campeaoId = formData.get('campeaoId') ? parseInt(formData.get('campeaoId') as string) : null

  await prisma.user.update({
    where: { id: session.user.id },
    data: { campeao, campeaoId },
  })

  revalidatePath('/perfil')
  return { success: true }
}
