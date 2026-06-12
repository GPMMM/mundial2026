'use client'

import { useTransition } from 'react'
import { apagarLiga } from '@/lib/actions/ligas'

export function ApagarLigaBtn({ ligaId, nomeLiga }: { ligaId: string; nomeLiga: string }) {
  const [isPending, startTransition] = useTransition()

  function handleApagar() {
    if (!confirm(`Delete league "${nomeLiga}"? This cannot be undone.`)) return
    startTransition(async () => {
      await apagarLiga(ligaId)
    })
  }

  return (
    <button
      onClick={handleApagar}
      disabled={isPending}
      className="text-sm border border-red/40 text-red px-3 py-2 rounded-lg hover:bg-red/10 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete league'}
    </button>
  )
}
