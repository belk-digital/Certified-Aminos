import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { generateMilitaryAdminEmail } from '@/lib/emails/generateMilitaryAdminEmail';
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('fullName') as string;
    // Normalized so the same person can't get a second coupon by resubmitting with different
    // email casing — the approval-time dedup check below matches on this exact string.
    const email = ((formData.get('email') as string) || '').trim().toLowerCase();
    const branch = formData.get('branch') as string;
    const idPhoto = formData.get('idPhoto') as File;

    if (!name || !email || !branch || !idPhoto) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const MAX_PHOTO_BYTES = 8 * 1024 * 1024 // 8MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (idPhoto.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'ID photo is too large (max 8MB)' }, { status: 400 });
    }
    if (idPhoto.type && !ALLOWED_TYPES.includes(idPhoto.type)) {
      return NextResponse.json({ error: 'ID photo must be a JPEG, PNG, WEBP, or HEIC image' }, { status: 400 });
    }

    // IP-based rate limit is a soft extra layer (no-ops if Upstash isn't configured) — the
    // authoritative "once per day" rule below is enforced against the database instead, so it
    // works regardless of whether Redis is set up.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = await checkRateLimit(`military-submit:${ip}`, 5, 24 * 60 * 60)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    if (!process.env.PAYLOAD_SECRET) {
      console.error('PAYLOAD_SECRET is not set — refusing to sign military discount token')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const payload = await getPayload({ config: configPromise });

    // A verified military member can request (and be granted) a fresh one-time coupon more
    // than once over time — but only one form submission per email per rolling 24h, regardless
    // of that prior request's outcome, so the admin's inbox can't be spammed with duplicates.
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recentRequests = await payload.find({
      collection: 'military-discount-requests',
      where: {
        and: [
          { email: { equals: email } },
          { createdAt: { greater_than: oneDayAgo } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })
    if (recentRequests.totalDocs > 0) {
      return NextResponse.json({ error: 'You can only submit this form once per day. Please wait for a response to your previous request.' }, { status: 429 });
    }

    const requestDoc = await payload.create({
      collection: 'military-discount-requests',
      data: { fullName: name, email, branch, status: 'pending' },
      overrideAccess: true,
    })

    // Generate JWT token
    const token = jwt.sign(
      { name, email, branch, requestId: requestDoc.id },
      process.env.PAYLOAD_SECRET,
      { expiresIn: '7d' } // Admin has 7 days to approve
    );

    // Prepare ID photo attachment
    const arrayBuffer = await idPhoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate Email HTML
    const emailHtml = generateMilitaryAdminEmail(name, email, branch, token);

    // Send to Support Email with Attachment
    await sendTrackedEmail(payload, {
      from: `"${name} (Military)" <forms@certifiedaminos.com>`,
      replyTo: email,
      to: 'support@helixbiochem.com',
      subject: `[Military Discount] Verification Request: ${name}`,
      html: emailHtml,
      attachments: [
        {
          filename: idPhoto.name || 'id-photo.jpg',
          content: buffer,
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting military discount:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
