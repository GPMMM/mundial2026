'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/jogos', label: 'Jogos', icon: '⚽' },
  { href: '/leaderboard', label: 'Ranking', icon: '🏅' },
  { href: '/ligas', label: 'Ligas', icon: '🏆' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-dark-2/95 backdrop-blur border-t border-border safe-area-pb">
      <div className="flex">
        {LINKS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                active ? 'text-gold' : 'text-muted hover:text-slate-300'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
