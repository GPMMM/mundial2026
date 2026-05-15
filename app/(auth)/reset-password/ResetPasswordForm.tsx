'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/actions/reset-password'

export function ResetPasswordForm({ token }: { token?: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 text-center space-y-4">
        <h2 className="font-bold text-xl">Invalid link</h2>
        <p className="text-muted text-sm">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-gold hover:underline text-sm">Request a new one</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h2 className="font-bold text-xl">Password updated</h2>
        <p className="text-muted text-sm">Your password has been reset successfully.</p>
        <Link
          href="/login"
          className="block bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors text-center"
        >
          Sign in
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const pw = fd.get('password') as string
    const confirm = fd.get('confirmPassword') as string
    if (pw !== confirm) {
      setError('Passwords do not match.')
      return
    }
    fd.set('token', token!)
    startTransition(async () => {
      const res = await resetPassword(fd)
      if (res?.error) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-xl">Choose a new password</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="password" type="password" placeholder="New password (min. 6 characters)" required minLength={6}
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        <input
          name="confirmPassword" type="password" placeholder="Confirm new password" required
          className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
        />
        {error && <p className="text-red text-sm">{error}</p>}
        <button
          type="submit" disabled={isPending}
          className="w-full bg-gold text-dark font-bold py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}
