import crypto from 'crypto'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'
import { checkRateLimit } from '@/lib/rateLimit'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { allowed } = await checkRateLimit(`login:${credentials.email.toLowerCase()}`, 10, 10 * 60)
        if (!allowed) {
          throw new Error('TOO_MANY_ATTEMPTS')
        }

        const payload = await getPayload({ config })
        try {
          const result = await payload.login({
            collection: 'users',
            data: { email: credentials.email, password: credentials.password },
            overrideAccess: true,
          })
          if (!result.user) return null
          const user = result.user as User
          // Credentials accounts must verify their email before logging in — existing
          // accounts were grandfathered in via a migration when this was introduced, so
          // this only affects new signups. Google accounts are verified at signup time.
          if (user.authProvider !== 'google' && !user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED')
          }
          return { id: String(user.id), email: user.email, role: user.role ?? 'customer' }
        } catch (err) {
          if (err instanceof Error && (err.message === 'EMAIL_NOT_VERIFIED' || err.message === 'TOO_MANY_ATTEMPTS')) throw err
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true

      const payload = await getPayload({ config })
      const googleId = account.providerAccountId
      const email = profile?.email || user.email
      if (!email) return false
      // Google self-reports whether it has verified this address — only trust it, and only
      // auto-link/auto-create an account, when that flag is true.
      if ((profile as any)?.email_verified === false) return false

      const byGoogleId = await payload.find({
        collection: 'users',
        where: { googleId: { equals: googleId } },
        limit: 1,
        overrideAccess: true,
      })

      if (byGoogleId.docs.length > 0) {
        user.id = String(byGoogleId.docs[0].id)
        user.role = byGoogleId.docs[0].role ?? 'customer'
        return true
      }

      const byEmail = await payload.find({
        collection: 'users',
        where: { email: { equals: email.toLowerCase() } },
        limit: 1,
        overrideAccess: true,
      })

      if (byEmail.docs.length > 0) {
        const linked = await payload.update({
          collection: 'users',
          id: byEmail.docs[0].id,
          data: { googleId },
          overrideAccess: true,
        })
        user.id = String(linked.id)
        user.role = linked.role ?? 'customer'
        // Let the account owner know a new sign-in method was just linked, in case it
        // wasn't them.
        try {
          const { sendTrackedEmail } = await import('@/lib/emails/sendTrackedEmail')
          await sendTrackedEmail(payload, {
            from: 'Support | Certified Aminos <support@certifiedaminos.com>',
            to: linked.email,
            subject: 'A new sign-in method was added to your account',
            html: `<p>Google sign-in was just linked to your Certified Aminos account (${linked.email}). If this wasn't you, please contact support immediately.</p>`,
          })
        } catch (err) {
          console.error('Failed to send Google-link notice email:', err)
        }
        return true
      }

      const nameParts = (profile?.name || '').split(' ')
      const created = await payload.create({
        collection: 'users',
        data: {
          email,
          googleId,
          role: 'customer',
          authProvider: 'google',
          emailVerified: true,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          password: crypto.randomBytes(32).toString('hex'),
        },
        overrideAccess: true,
      })
      user.id = String(created.id)
      user.role = created.role ?? 'customer'
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.payloadUserId = user.id
        token.role = user.role ?? 'customer'

        const payload = await getPayload({ config })
        const parsedId = isNaN(Number(user.id)) ? user.id : Number(user.id)
        const fullUser = await payload.findByID({
          collection: 'users',
          id: parsedId,
          overrideAccess: true,
        }).catch((err) => {
          console.error("JWT fetch error on Vercel:", err)
          return null
        })
        if (fullUser) {
          token.firstName = fullUser.firstName || undefined
          token.lastName = fullUser.lastName || undefined
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.payloadUserId as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string | undefined
        session.user.lastName = token.lastName as string | undefined
      }
      return session
    },
  },
}
