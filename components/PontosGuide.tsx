'use client'

import { useState } from 'react'

const BASE_POINTS = [
  { label: 'Exact score', pts: 5 },
  { label: 'Correct goal difference', pts: 2 },
  { label: 'Correct winner', pts: 1 },
  { label: 'Correct top scorer (per team)', pts: '+2' },
]

const MULTIPLIERS = [
  { phase: 'Group stage', mult: '×1' },
  { phase: 'Round of 32', mult: '×1.5' },
  { phase: 'Round of 16', mult: '×2' },
  { phase: 'Quarter-finals', mult: '×2.5' },
  { phase: 'Semi-finals', mult: '×3' },
  { phase: 'Final', mult: '×4' },
]

export function PontosGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📊</span> How are points calculated?
        </span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">Base points per match</p>
            <div className="space-y-1.5">
              {BASE_POINTS.map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-muted">{r.label}</span>
                  <span className="font-bold text-gold">{r.pts} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">Phase multipliers</p>
            <div className="space-y-1.5">
              {MULTIPLIERS.map(r => (
                <div key={r.phase} className="flex items-center justify-between">
                  <span className="text-muted">{r.phase}</span>
                  <span className="font-bold text-white">{r.mult}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-2 rounded-lg px-3 py-2 flex items-center justify-between border border-gold/30">
            <span className="text-muted">Champion prediction (bonus)</span>
            <span className="font-bold text-gold">+20 pts</span>
          </div>

          <p className="text-xs text-muted">
            Example: exact score in the Final = 5 × 4 = <span className="text-white font-semibold">20 pts</span>.
            Add both top scorers correct = 5 + 2 + 2 = 9 × 4 = <span className="text-white font-semibold">36 pts</span>.
          </p>
        </div>
      )}
    </div>
  )
}
