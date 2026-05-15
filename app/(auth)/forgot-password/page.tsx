'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/reset-password'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await requestPasswordReset(fd)
      if (res?.error) setError(res.error)
      else setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 text-center space-y-4">
        <div className="text-4xl">📧</div>
        <h2 className="font-bold text-xl">Check your inbox</h2>
        <p className="text-muted text-sm">
          If that email is registered, we&apos;ve sent you a password reset link.
          Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/login" className="block text-gold hover:underline text-sm">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-xl">Reset your password</h2>
      <p className="text-muted text-sm">Enter your email address and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email" type="email" placeholder="Email" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        {error && <p className="text-red text-sm">{error}</p>}
        <button
          type="submit" disabled={isPending}
          className="w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-gold hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
