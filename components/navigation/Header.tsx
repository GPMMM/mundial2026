'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 bg-dark-2/90 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-gold text-lg tracking-wide">
          🏆 World Cup 2026
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/jogos" className="text-slate-300 hover:text-white transition-colors">Matches</Link>
          <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">Standings</Link>
          <Link href="/ligas" className="text-slate-300 hover:text-white transition-colors">Leagues</Link>
          {session ? (
            <>
              <Link href="/perfil" className="text-slate-300 hover:text-white transition-colors">Profile</Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-gold hover:text-gold/80 transition-colors">Admin</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-muted hover:text-red transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-gold text-dark font-semibold px-4 py-1.5 rounded-lg hover:bg-gold/90 transition-colors text-sm"
            >
              Sign in
            </Link>
          )}
        </nav>
        {session?.user && (
          <Link href="/perfil" className="md:hidden flex items-center gap-2">
            {session.user.image ? (
              <Image src={session.user.image} alt="Avatar" width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  )
}
