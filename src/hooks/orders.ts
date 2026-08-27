import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { appendOrderToSheet } from '@/lib/google/sheets'
import { sql } from '@payloadcms/db-postgres'
import { validateStatusTransition } from '@/lib/orders/state'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { releaseStock, releaseCouponUsage, releasePoints } from '@/lib/orders/reserve'
import { emailLayout } from '@/lib/emails/emailLayout'
import { escapeHtml } from '@/lib/emails/escapeHtml'

export const beforeOrderChange: CollectionBeforeChangeHook = async ({ operation, originalDoc, data, req }) => {
  if (operation === 'create') {
    if (!data.orderNumber) {
      const db = req.payload.db as any
      const counterRes: any = await db.drizzle.execute(sql`INSERT INTO "order_counters" ("id", "counter", "created_at", "updated_at") VALUES (1, 1000, now(), now())
                  ON CONFLICT ("id") DO UPDATE SET "counter" = "order_counters"."counter" + 1, "updated_at" = now()
                  RETURNING "counter"`)
      const counter = (counterRes.rows ? counterRes.rows[0].counter : counterRes[0].counter)
      data.orderNumber = String(counter)
    }

    if (Array.isArray(data.items)) {
      const snapshotItems = await Promise.all(
        data.items.map(async (item: any) => {
          const product = await req.payload.find({
            collection: 'products',
            where: { id: { equals: item.product } },
            depth: 0,
          })
          return { ...item, productSnapshot: product?.docs?.[0] ?? null }
        }),
      )
      data.items = snapshotItems
    }

    if (data.shippingAddress) data.shippingAddress = { ...data.shippingAddress }
    if (data.billingAddress && data.billingAddress.line1) {
      data.billingAddress = { ...data.billingAddress }
    } else if (data.shippingAddress) {
      data.billingAddress = { ...data.shippingAddress }
    }
  }

  if (operation === 'update' && originalDoc) {
    const oldStatus = originalDoc.status as any
    const newStatus = data.status as any
    if (oldStatus && newStatus && oldStatus !== newStatus) {
      validateStatusTransition(oldStatus, newStatus)
    }
  }

  if (data.sendTrackingEmail) {
    req.context.queueTrackingEmail = true
    data.sendTrackingEmail = null
  }

  // Handle notes processing
  if (data.notes && Array.isArray(data.notes)) {
    const queuedCustomerNotes: string[] = []
    
    data.notes = data.notes.map((note: any) => {
      // Auto-stamp the date for new notes
      if (!note.date) {
        note.date = new Date().toISOString()
      }
      
      // Queue customer notes to be emailed if they haven't been sent yet
      if (note.type === 'customer' && !note.isEmailed) {
        queuedCustomerNotes.push(note.note)
        note.isEmailed = true // Mark as emailed so it doesn't get sent again
      }
      
      return note
    })

    if (queuedCustomerNotes.length > 0) {
      req.context.queuedCustomerNotes = queuedCustomerNotes
    }
  }

  return data
}

export const afterOrderChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  // Sync to Google Sheets if it became paid, captured, or completed
  const becamePaid = doc.paymentStatus === 'captured' && previousDoc?.paymentStatus !== 'captured'
  const becameCompleted = doc.status === 'completed' && previousDoc?.status !== 'completed'

  if (becamePaid || becameCompleted) {
    try {
      await appendOrderToSheet(doc as any)
      req.payload.logger.info(`Synced Order ${doc.id} to Google Sheets from hook`)
    } catch (err) {
      req.payload.logger.error({ err }, `Failed to sync Order ${doc.id} to Google Sheets`)
    }
  }

  // Trigger finalizeOrder if the admin marks it as paid, shipped, fulfilled, or completed,
  // or if payment is captured, AND it hasn't been finalized yet.
  const statusImpliesPaid = ['paid', 'shipped', 'fulfilled', 'completed'].includes(doc.status)
  const previousStatusImpliesPaid = previousDoc?.status ? ['paid', 'shipped', 'fulfilled', 'completed'].includes(previousDoc.status) : false
  const becameStatusPaid = statusImpliesPaid && !previousStatusImpliesPaid

  if ((becamePaid || becameStatusPaid) && !doc.isFinalized) {
    try {
      const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
      // Running it asynchronously so it doesn't block the UI response
      finalizeOrder(doc.id).catch(err => {
        req.payload.logger.error({ err }, `Failed to finalize Order ${doc.id} in background`)
      })
    } catch (err) {
      req.payload.logger.error({ err }, `Failed to import finalizeOrder for Order ${doc.id}`)
    }
  }

  if (operation === 'update') {
    const isNowVoid = doc.status === 'refunded' || doc.status === 'cancelled'
    const wasVoidBefore = previousDoc?.status === 'refunded' || previousDoc?.status === 'cancelled'

    // Reverse affiliate conversions if transitioning to a void state (refunded/cancelled)
    if (isNowVoid && !wasVoidBefore) {
      const conversions = await req.payload.find({
        collection: 'affiliate-conversions',
        where: { order: { equals: doc.id } },
        overrideAccess: true,
      })

      for (const conv of conversions.docs) {
        if (conv.status !== 'voided' && conv.status !== 'reversed') {
          await req.payload.update({
            collection: 'affiliate-conversions',
            id: conv.id,
            data: {
              status: 'reversed',
              reversedAt: new Date().toISOString(),
              reversedReason: doc.status === 'refunded' ? 'order_refunded' : 'order_cancelled',
            },
            overrideAccess: true,
          })
        }
      }

      // Refund the used HB Points back to the user
      if (doc.redeemedPoints && doc.redeemedPoints > 0 && doc.owner) {
        try {
          const userId = typeof doc.owner === 'object' ? doc.owner.id : doc.owner
          await releasePoints(req.payload, userId, doc.redeemedPoints)
          req.payload.logger.info(`Refunded ${doc.redeemedPoints} HB points to user ${userId} for voided order ${doc.id}`)
        } catch (err) {
          req.payload.logger.error({ err }, `Failed to refund HB points for order ${doc.id}`)
        }
      }

      // Release the reserved stock back to inventory
      if (Array.isArray(doc.items) && doc.items.length > 0) {
        try {
          await releaseStock(
            req.payload,
            doc.items.map((item: any) => ({
              productId: typeof item.product === 'object' ? item.product?.id : item.product,
              quantity: item.quantity || 1,
            })).filter((i: any) => i.productId),
          )
        } catch (err) {
          req.payload.logger.error({ err }, `Failed to release reserved stock for order ${doc.id}`)
        }
      }

      // Release the coupon's usage slot / store credit balance
      if (doc.couponCode) {
        try {
          const coupons = await req.payload.find({
            collection: 'coupons',
            where: { code: { equals: doc.couponCode } },
            overrideAccess: true,
            limit: 1,
          })
          const coupon = coupons.docs[0]
          if (coupon) {
            await releaseCouponUsage(req.payload, coupon.id, doc.discountTotal || 0, coupon.type === 'store_credit')
          }
        } catch (err) {
          req.payload.logger.error({ err }, `Failed to release coupon usage for order ${doc.id}`)
        }
      }

      // Notify the customer their order was cancelled/refunded/failed. A payment-failure
      // auto-cancel (see webhooks/circoflows, webhooks/stripe, checkout/circoflowsActions —
      // they set context.paymentFailed on the triggering payload.update call) reads as
      // "failed" here rather than "cancelled", since the customer never chose to cancel.
      try {
        let customerEmail = doc.guestEmail
        if (!customerEmail && doc.owner) {
          const ownerId = typeof doc.owner === 'object' ? doc.owner.id : doc.owner
          const user = typeof doc.owner === 'object' ? doc.owner : await req.payload.findByID({ collection: 'users', id: ownerId, depth: 0 })
          customerEmail = user?.email
        }
        if (customerEmail) {
          const orderNumber = doc.orderNumber || doc.id
          const label = doc.status === 'refunded' ? 'refunded' : (req.context?.paymentFailed ? 'failed' : 'cancelled')
          const customerFirstName = escapeHtml(doc.customerFirstName || 'there')
          const subject = label === 'failed'
            ? `Your Order #${orderNumber} payment failed`
            : `Your Order #${orderNumber} has been ${label}`
          const { generateOrderInvoiceHtml } = await import('@/lib/emails/generateOrderEmail')
          const html = await generateOrderInvoiceHtml(doc, req.payload, undefined, label as 'failed' | 'cancelled' | 'refunded')
          await sendTrackedEmail(req.payload, {
            from: 'Orders | Certified Aminos <support@certifiedaminos.com>',
            to: customerEmail,
            // On payment failure, admin gets the identical invoice email (same cart/totals)
            // the customer receives, rather than a separate summary-only alert.
            ...(label === 'failed' ? { bcc: 'support@certifiedaminos.com' } : {}),
            subject,
            html,
          })
        }
      } catch (err) {
        req.payload.logger.error({ err }, `Failed to send cancellation/refund/failure email for order ${doc.id}`)
      }
    }
  }

  // Handle custom email notes from admin
  if (req.context.queuedCustomerNotes && Array.isArray(req.context.queuedCustomerNotes)) {
    let customerEmail = doc.guestEmail
    
    // Resolve owner email if not a guest
    if (!customerEmail && doc.owner) {
      if (typeof doc.owner === 'object' && doc.owner !== null && doc.owner.email) {
        customerEmail = doc.owner.email
      } else {
        try {
          const user = await req.payload.findByID({
            collection: 'users',
            id: typeof doc.owner === 'object' ? doc.owner.id : doc.owner,
            depth: 0,
          })
          if (user && user.email) {
            customerEmail = user.email
          }
        } catch (e) {
          req.payload.logger.error(`Could not resolve owner email for order ${doc.id}`)
        }
      }
    }
    
    if (customerEmail) {
      try {
        const { generateOrderInvoiceHtml } = await import('@/lib/emails/generateOrderEmail')
        
        for (const customNote of req.context.queuedCustomerNotes) {
          // Pass the note into the email generator
          const invoiceHtml = await generateOrderInvoiceHtml(doc, req.payload, customNote)
          
          await sendTrackedEmail(req.payload, {
            from: 'Orders | Certified Aminos <support@certifiedaminos.com>',
            to: customerEmail,
            subject: `Update regarding your Order #${doc.orderNumber || doc.id}`,
            html: invoiceHtml,
          })
          
          req.payload.logger.info(`Sent custom order note to ${customerEmail} for order ${doc.id}`)
        }
      } catch (err) {
        req.payload.logger.error({ err }, `Failed to send custom order note email for order ${doc.id}`)
      }
    } else {
      req.payload.logger.error(`No customer email found to send order notes for order ${doc.id}`)
    }
  }

  // Handle tracking link email
  if (req.context.queueTrackingEmail && doc.trackingLink) {
    let customerEmail = doc.guestEmail
    if (!customerEmail && doc.owner) {
      if (typeof doc.owner === 'object' && doc.owner !== null && doc.owner.email) {
        customerEmail = doc.owner.email
      } else {
        try {
          const user = await req.payload.findByID({ collection: 'users', id: typeof doc.owner === 'object' ? doc.owner.id : doc.owner, depth: 0 })
          if (user && user.email) customerEmail = user.email
        } catch (e) {}
      }
    }

    if (customerEmail) {
      try {
        const { generateOrderInvoiceHtml } = await import('@/lib/emails/generateOrderEmail')
        const invoiceHtml = await generateOrderInvoiceHtml(doc, req.payload, "Great news! Your order has been shipped. You can track your package using the tracking link below.")
        
        await sendTrackedEmail(req.payload, {
          from: 'Orders | Certified Aminos <support@certifiedaminos.com>',
          to: customerEmail,
          subject: `Your Order #${doc.orderNumber || doc.id} has shipped!`,
          html: invoiceHtml,
        })
        
        req.payload.logger.info(`Sent tracking email to ${customerEmail} for order ${doc.id}`)
      } catch (err) {
        req.payload.logger.error({ err }, `Failed to send tracking email for order ${doc.id}`)
      }
    }
  }

  return doc
}
