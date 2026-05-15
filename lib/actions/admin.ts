'use server'

import { auth } from '../auth'
import { revalidatePath } from 'next/cache'

export async function forceSyncAction() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Permission denied.' }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/cron/sync`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  })

  if (!res.ok) return { error: 'Sync error.' }
  revalidatePath('/')
  return { success: true }
}

export async function alterarRole(userId: string, role: 'USER' | 'ADMIN') {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Permission denied.' }

  const { prisma } = await import('../prisma')
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin')
  return { success: true }
}
