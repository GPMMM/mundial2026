'use server'

import { auth } from '../auth'
import { revalidatePath } from 'next/cache'
import { runSync } from '../sync'

export async function forceSyncAction() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Permission denied.' }

  try {
    const result = await runSync()
    revalidatePath('/')
    return { success: true, ...result }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function alterarRole(userId: string, role: 'USER' | 'ADMIN') {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Permission denied.' }

  const { prisma } = await import('../prisma')
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin')
  return { success: true }
}
