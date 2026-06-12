'use client'

import { useState, useTransition } from 'react'

export function CalcPontosBtn({ action }: { action: () => Promise<{ error?: string; success?: boolean; calculadas?: number }> }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  function handle() {
    setResult(null)
    startTransition(async () => {
      const res = await action()
      setResult(res.error ? `❌ ${res.error}` : `✅ ${res.calculadas} predictions calculated`)
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handle} disabled={isPending}
        className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-500 transition-colors disabled:opacity-50"
      >
        {isPending ? '⏳ Calculating…' : '🧮 Calculate points'}
      </button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}
