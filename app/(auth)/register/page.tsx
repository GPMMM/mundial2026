'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { registar } from '@/lib/actions/auth'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await registar(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-xl">Criar conta</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="nome" type="text" placeholder="Nome" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        <input
          name="email" type="email" placeholder="Email" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        <input
          name="password" type="password" placeholder="Password (mín. 6 caracteres)" required minLength={6}
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        {error && <p className="text-red text-sm">{error}</p>}
        <button
          type="submit" disabled={isPending}
          className="w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'A criar…' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        Já tens conta?{' '}
        <Link href="/login" className="text-gold hover:underline">Iniciar sessão</Link>
      </p>
    </div>
  )
}
