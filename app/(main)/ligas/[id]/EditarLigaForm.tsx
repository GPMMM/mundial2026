'use client'

import { useState, useTransition } from 'react'
import { renomearLiga } from '@/lib/actions/ligas'

interface Props {
  ligaId: string
  nomeInicial: string
  descricaoInicial: string | null
}

export function EditarLigaForm({ ligaId, nomeInicial, descricaoInicial }: Props) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(nomeInicial)
  const [descricao, setDescricao] = useState(descricaoInicial ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await renomearLiga(ligaId, nome, descricao || null)
      if (res?.error) setError(res.error)
      else setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm border border-border px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
      >
        Edit
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <h3 className="font-semibold text-sm">Edit league</h3>
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="League name"
        required
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
      />
      <textarea
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none"
      />
      {error && <p className="text-red text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setNome(nomeInicial); setDescricao(descricaoInicial ?? '') }}
          className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-surface-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 text-sm bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
