'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { entrar } from '@/lib/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await entrar(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-xl">Sign in</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email" type="email" placeholder="Email" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        <input
          name="password" type="password" placeholder="Password" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        {error && <p className="text-red text-sm">{error}</p>}
        <button
          type="submit" disabled={isPending}
          className="w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-muted hover:text-gold transition-colors">
          Forgot your password?
        </Link>
      </div>

      <p className="text-center text-sm text-muted">
        No account?{' '}
        <Link href="/register" className="text-gold hover:underline">Create one</Link>
      </p>
    </div>
  )
}
