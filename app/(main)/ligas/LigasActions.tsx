'use client'

import { useState, useTransition } from 'react'
import { criarLiga, entrarLigaViaForm } from '@/lib/actions/ligas'

export function LigasActions() {
  const [show, setShow] = useState<'criar' | 'entrar' | null>(null)
  const [errorCriar, setErrorCriar] = useState('')
  const [errorEntrar, setErrorEntrar] = useState('')
  const [pendingCriar, startCriar] = useTransition()
  const [pendingEntrar, startEntrar] = useTransition()

  function handleCriar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorCriar('')
    const fd = new FormData(e.currentTarget)
    startCriar(async () => {
      const res = await criarLiga(fd)
      if (res?.error) setErrorCriar(res.error)
    })
  }

  function handleEntrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorEntrar('')
    const fd = new FormData(e.currentTarget)
    startEntrar(async () => {
      const res = await entrarLigaViaForm(fd)
      if (res?.error) setErrorEntrar(res.error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setShow(v => v === 'entrar' ? null : 'entrar')}
          className="text-sm border border-border px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
        >
          Entrar com código
        </button>
        <button
          onClick={() => setShow(v => v === 'criar' ? null : 'criar')}
          className="text-sm bg-gold text-dark font-semibold px-3 py-2 rounded-lg hover:bg-gold/90 transition-colors"
        >
          + Criar liga
        </button>
      </div>

      {show === 'criar' && (
        <form onSubmit={handleCriar} className="bg-surface rounded-xl border border-gold/40 p-4 space-y-3">
          <h3 className="font-semibold">Nova liga</h3>
          <input name="nome" placeholder="Nome da liga" required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          <textarea name="descricao" placeholder="Descrição (opcional)" rows={2}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none" />
          {errorCriar && <p className="text-red text-xs">{errorCriar}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(null)}
              className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-surface-2">Cancelar</button>
            <button type="submit" disabled={pendingCriar}
              className="flex-1 py-2 text-sm bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50">
              {pendingCriar ? 'A criar…' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {show === 'entrar' && (
        <form onSubmit={handleEntrar} className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-semibold">Entrar com código</h3>
          <input name="codigo" placeholder="Código de convite (ex: AB3XY7)" required maxLength={6}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-gold" />
          {errorEntrar && <p className="text-red text-xs">{errorEntrar}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(null)}
              className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-surface-2">Cancelar</button>
            <button type="submit" disabled={pendingEntrar}
              className="flex-1 py-2 text-sm bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50">
              {pendingEntrar ? 'A entrar…' : 'Entrar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
