import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const PROTECTED_PREFIXES = ['/account', '/affiliates/dashboard']
const PUBLIC_AUTH_PREFIXES = ['/login', '/register']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin') || path.startsWith('/the-upside-down') || path.startsWith('/api') || path.startsWith('/ref/')) {
    return NextResponse.next()
  }

  if (PUBLIC_AUTH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next()
  }

  if (PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|webm|mp4|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
