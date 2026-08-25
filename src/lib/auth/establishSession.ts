import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // NextAuth's default session length (30 days)

/**
 * Manually issues a NextAuth session cookie for a user we just created server-side
 * (e.g. auto-created from a guest checkout), bypassing the normal signIn() flow since
 * there's no password for them to authenticate with yet.
 *
 * SECURITY: only call this for an account created in the same request — never for an
 * email that matched a pre-existing account, or any authenticated visitor could hijack
 * another customer's account just by typing their email at guest checkout.
 */
export async function establishSessionForNewUser(user: {
  id: number | string
  email: string
  role: string
  firstName?: string | null
  lastName?: string | null
}) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return

  const token = await encode({
    token: {
      sub: String(user.id),
      email: user.email,
      payloadUserId: String(user.id),
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    },
    secret,
    maxAge: SESSION_MAX_AGE,
  })

  const isSecure = (process.env.NEXTAUTH_URL || '').startsWith('https://') || process.env.NODE_ENV === 'production'
  const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

  const cookieStore = await cookies()
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}
