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

export async function adicionarMembro(ligaId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
  if (!liga || liga.criadorId !== session.user.id) return { error: 'Permission denied.' }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: 'User not found.' }

  const jaeMembro = await prisma.membroLiga.findUnique({
    where: { userId_ligaId: { userId, ligaId } },
  })
  if (jaeMembro) return { error: 'User is already a member.' }

  await prisma.membroLiga.create({ data: { userId, ligaId } })
  revalidatePath(`/ligas/${ligaId}`)
  return { success: true }
}

export async function renomearLiga(ligaId: string, nome: string, descricao: string | null) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
  if (!liga || liga.criadorId !== session.user.id) return { error: 'Permission denied.' }
  if (!nome?.trim()) return { error: 'Name is required.' }

  await prisma.liga.update({
    where: { id: ligaId },
    data: { nome: nome.trim(), descricao: descricao?.trim() || null },
  })
  revalidatePath(`/ligas/${ligaId}`)
  return { success: true }
}

export async function apagarLiga(ligaId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
  if (!liga || liga.criadorId !== session.user.id) return { error: 'Permission denied.' }

  await prisma.membroLiga.deleteMany({ where: { ligaId } })
  await prisma.liga.delete({ where: { id: ligaId } })
  revalidatePath('/ligas')
  redirect('/ligas')
}
