import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { generateMilitaryApprovalEmail } from '@/lib/emails/generateMilitaryApprovalEmail';
import { generateMilitaryRejectionEmail } from '@/lib/emails/generateMilitaryRejectionEmail';
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action');

    if (!token || !action) {
      return new NextResponse('Missing token or action', { status: 400 });
    }

    if (!process.env.PAYLOAD_SECRET) {
      console.error('PAYLOAD_SECRET is not set — refusing to verify military discount token')
      return new NextResponse('Internal server error', { status: 500 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.PAYLOAD_SECRET);
    } catch (err) {
      return new NextResponse('Invalid or expired token', { status: 400 });
    }

    const { name, requestId } = decoded;
    // Normalize defensively — tokens signed before this fix may still carry a non-lowercased email.
    const email = ((decoded.email as string) || '').trim().toLowerCase();
    const payload = await getPayload({ config: configPromise });

    if (!requestId) {
      return new NextResponse('This approval link is from before the request-tracking system was added and can no longer be processed automatically. Please handle it manually in the admin panel.', { status: 400 });
    }

    const requestDoc = await payload.findByID({
      collection: 'military-discount-requests',
      id: requestId,
      overrideAccess: true,
    }).catch(() => null)

    if (!requestDoc) {
      return new NextResponse('This request no longer exists.', { status: 404 });
    }

    // Each request can only be approved or rejected once — this is what stops double-clicking
    // (or a stale duplicate email) from generating a second coupon for the same request. It does
    // NOT stop the same person from being approved again in the future via a separate request;
    // that's the intended behavior — verified military members can request a fresh one-time code
    // more than once, just no more than once per day (enforced at submission).
    if (requestDoc.status !== 'pending') {
      return new NextResponse(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #f59e0b;">Already Processed</h2>
          <p>This request was already marked <strong>${requestDoc.status}</strong>${requestDoc.couponCode ? ` (coupon: <strong>${requestDoc.couponCode}</strong>)` : ''}.</p>
          <p>You may now close this window.</p>
        </div>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    if (action === 'approve') {
      const couponCode = `MIL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await payload.create({
        collection: 'coupons',
        data: {
          code: couponCode,
          type: 'percentage',
          value: 30, // 30% discount
          usageLimit: 1, // One-time use — a repeat request generates its own separate coupon
          lockedEmails: [{ email }],
          appliesTo: 'all',
          applicableProductTypes: 'normal_only',
          freeShipping: false,
          stackable: false,
          excludeSaleItems: false,
          autoApply: false,
        },
        overrideAccess: true,
      });

      await payload.update({
        collection: 'military-discount-requests',
        id: requestId,
        data: { status: 'approved', couponCode, reviewedAt: new Date().toISOString() },
        overrideAccess: true,
      })

      // Send Approval Email
      const emailHtml = generateMilitaryApprovalEmail(name, couponCode);
      await sendTrackedEmail(payload, {
        from: 'Support | Certified Aminos <support@certifiedaminos.com>',
        to: email,
        subject: 'Military Discount Verified - Here is your code!',
        html: emailHtml,
      });

      return new NextResponse(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #10b981;">Verification Approved</h2>
          <p>The 30% coupon (<strong>${couponCode}</strong>) has been generated and emailed to ${email}.</p>
          <p>You may now close this window.</p>
        </div>
      `, { headers: { 'Content-Type': 'text/html' } });

    } else if (action === 'reject') {
      await payload.update({
        collection: 'military-discount-requests',
        id: requestId,
        data: { status: 'rejected', reviewedAt: new Date().toISOString() },
        overrideAccess: true,
      })

      // Send Rejection Email
      const emailHtml = generateMilitaryRejectionEmail(name);
      await sendTrackedEmail(payload, {
        from: 'Support | Certified Aminos <support@certifiedaminos.com>',
        to: email,
        subject: 'Update on your Military Discount Request',
        html: emailHtml,
      });

      return new NextResponse(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #ef4444;">Verification Denied</h2>
          <p>A rejection email has been sent to ${email}.</p>
          <p>You may now close this window.</p>
        </div>
      `, { headers: { 'Content-Type': 'text/html' } });
    } else {
      return new NextResponse('Invalid action', { status: 400 });
    }
  } catch (error) {
    console.error('Error processing military action:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
