'use server'

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { sendPasswordResetEmail } from '../email'

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required.' }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.password) return { success: true }

  await prisma.passwordResetToken.deleteMany({ where: { email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({ data: { email, token, expiresAt } })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  await sendPasswordResetEmail(email, `${baseUrl}/reset-password?token=${token}`)

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string

  if (!token || !password) return { error: 'All fields are required.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken) return { error: 'Invalid or expired reset link.' }
  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return { error: 'This reset link has expired. Please request a new one.' }
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email: resetToken.email }, data: { password: hash } })
  await prisma.passwordResetToken.delete({ where: { token } })

  return { success: true }
}
