import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require login
const PROTECTED = ['/perfil', '/ligas', '/admin', '/jogos']
// Routes only for guests
const AUTH_ONLY = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // NextAuth v5 session cookie (http = dev, __Secure = prod)
  const sessionCookie =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token')
  const isLoggedIn = !!sessionCookie

  if (!isLoggedIn && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isLoggedIn && AUTH_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
