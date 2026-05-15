'use client'

import { useState, useTransition } from 'react'

export function SyncButton({ action }: { action: () => Promise<{ error?: string; success?: boolean }> }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      const res = await action()
      setResult(res.error ? `❌ ${res.error}` : '✅ Sync complete!')
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSync} disabled={isPending}
        className="bg-gold text-dark font-bold px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {isPending ? '⏳ Syncing…' : '🔄 Sync now'}
      </button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}
