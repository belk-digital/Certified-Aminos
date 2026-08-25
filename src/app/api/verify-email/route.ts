import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const locale = url.searchParams.get('locale') === 'es' ? '/es' : ''
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

  if (!token) {
    return NextResponse.redirect(`${base}${locale}/login?verifyError=missing_token`)
  }

  if (!process.env.PAYLOAD_SECRET) {
    console.error('PAYLOAD_SECRET is not set — refusing to verify email token')
    return NextResponse.redirect(`${base}${locale}/login?verifyError=server`)
  }

  let decoded: any
  try {
    decoded = jwt.verify(token, process.env.PAYLOAD_SECRET)
    if (decoded.purpose !== 'verify-email' || !decoded.userId) throw new Error('bad token')
  } catch {
    return NextResponse.redirect(`${base}${locale}/login?verifyError=invalid_token`)
  }

  const payload = await getPayload({ config: configPromise })
  try {
    await payload.update({
      collection: 'users',
      id: decoded.userId,
      data: { emailVerified: true },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('Failed to mark email verified:', err)
    return NextResponse.redirect(`${base}${locale}/login?verifyError=server`)
  }

  return NextResponse.redirect(`${base}${locale}/login?verified=1`)
}
