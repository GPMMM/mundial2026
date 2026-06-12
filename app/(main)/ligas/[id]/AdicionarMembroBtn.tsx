'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import { adicionarMembro } from '@/lib/actions/ligas'

interface User {
  id: string
  nome: string
  email: string
  imagem: string | null
}

export function AdicionarMembroBtn({ ligaId }: { ligaId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const controller = new AbortController()
    fetch(`/api/users/search?q=${encodeURIComponent(query)}&ligaId=${ligaId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setResults)
      .catch(() => {})
    return () => controller.abort()
  }, [query, ligaId])

  function handleAdd(userId: string) {
    setError('')
    startTransition(async () => {
      const res = await adicionarMembro(ligaId, userId)
      if (res?.error) {
        setError(res.error)
      } else {
        setQuery('')
        setResults([])
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm border border-border px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
      >
        + Add member
      </button>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-gold/40 p-4 space-y-3">
      <h3 className="font-semibold text-sm">Add member</h3>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
      />
      {error && <p className="text-red text-xs">{error}</p>}
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map(u => (
            <button
              key={u.id}
              onClick={() => handleAdd(u.id)}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors text-left disabled:opacity-50"
            >
              {u.imagem ? (
                <Image src={u.imagem} alt={u.nome} width={28} height={28} className="rounded-full" unoptimized />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                  {u.nome[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.nome}</p>
                <p className="text-xs text-muted truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {query.length >= 2 && results.length === 0 && (
        <p className="text-xs text-muted">No users found.</p>
      )}
      <button
        onClick={() => { setOpen(false); setQuery(''); setResults([]); setError('') }}
        className="text-xs text-muted hover:text-white transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
