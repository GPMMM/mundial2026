'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { signIn } from '../auth'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

export async function registar(formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!nome || !email || !password) return { error: 'Preenche todos os campos.' }
  if (password.length < 6) return { error: 'Password com mínimo 6 caracteres.' }

  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) return { error: 'Email já registado.' }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { nome, email, password: hash } })

  await signIn('credentials', { email, password, redirectTo: '/' })
}

export async function entrar(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'Credenciais inválidas.' }
    throw e
  }
}
