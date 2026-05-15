'use server'

import { auth } from '../auth'
import { prisma } from '../prisma'
import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'
import { redirect } from 'next/navigation'

const gerarCodigo = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

export async function criarLiga(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const nome = formData.get('nome') as string
  const descricao = (formData.get('descricao') as string) || null
  if (!nome?.trim()) return { error: 'Name is required.' }

  const codigoConvite = gerarCodigo()
  const liga = await prisma.liga.create({
    data: {
      nome: nome.trim(),
      descricao,
      codigoConvite,
      criadorId: session.user.id,
      membros: { create: { userId: session.user.id } },
    },
  })

  revalidatePath('/ligas')
  redirect(`/ligas/${liga.id}`)
}

export async function entrarLiga(codigo: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const liga = await prisma.liga.findUnique({ where: { codigoConvite: codigo.toUpperCase() } })
  if (!liga) return { error: 'Invalid code.' }

  const jaeMembro = await prisma.membroLiga.findUnique({
    where: { userId_ligaId: { userId: session.user.id, ligaId: liga.id } },
  })
  if (jaeMembro) return { error: 'You are already a member of this league.' }

  await prisma.membroLiga.create({ data: { userId: session.user.id, ligaId: liga.id } })
  revalidatePath('/ligas')
  redirect(`/ligas/${liga.id}`)
}

export async function removerMembro(ligaId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
  if (!liga || liga.criadorId !== session.user.id) return { error: 'Permission denied.' }
  if (userId === session.user.id) return { error: 'You cannot remove yourself.' }

  await prisma.membroLiga.delete({ where: { userId_ligaId: { userId, ligaId } } })
  revalidatePath(`/ligas/${ligaId}`)
  return { success: true }
}

export async function entrarLigaViaForm(formData: FormData) {
  const codigo = formData.get('codigo') as string
  if (!codigo?.trim()) return { error: 'Code is required.' }
  return entrarLiga(codigo.trim())
}
