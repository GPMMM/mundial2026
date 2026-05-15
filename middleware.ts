import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/ligas/entrar']
const API_PATHS = ['/api/']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic =
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p)) ||
    API_PATHS.some(p => pathname.startsWith(p))

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url))
  }

  if (req.auth && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
