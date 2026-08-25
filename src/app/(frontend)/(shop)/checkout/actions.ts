'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'
import { verifyCoupon, getUserHBPoints } from '../actions'
import { cookies } from 'next/headers'

import { reserveStock, releaseStock, reserveCouponUsage, releaseCouponUsage, reservePoints, releasePoints } from '@/lib/orders/reserve'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { escapeHtml } from '@/lib/emails/escapeHtml'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10' as any,
})

export async function getShippingMethods() {
  const payload = await getPayload({ config: configPromise })
  const zones = await payload.find({
    collection: 'shippingzones',
    limit: 1,
    depth: 0,
  })

  if (zones.docs.length > 0 && zones.docs[0].methods) {
    return zones.docs[0].methods
  }
  
  // Fallback if none exist (no ShippingZones doc currently exists in this project's DB,
  // so this fallback is what's actually active in production right now)
  return [
    { method: 'Standard Shipping', price: 25, estimatedDays: 5 },
    { method: 'Express Shipping', price: 50, estimatedDays: 2 },
    { method: 'International Shipping', price: 50, estimatedDays: null, isInternational: true },
  ]
}

export async function getActiveProcessingFees() {
  const payload = await getPayload({ config: configPromise })
  const fees = await payload.find({
    collection: 'processing-fees',
    depth: 0,
    overrideAccess: true,
    limit: 100,
  })
  return fees.docs.filter((f: any) => f.isActive)
}

// International orders get a single flat rate — configured in the ShippingZones admin as the
// method with isInternational checked — rather than any of the regular US zone's methods. Cost
// must be resolved server-side from the customer's country rather than trusting a client-supplied
// method name/price (which previously caused Stripe/order totals to fall back to the mismatched
// "Standard Shipping" rate for international orders).
function resolveShippingMethod(methods: any[], shippingMethodName: string, country?: string) {
  const isInternational = !!country && country !== 'US'
  if (isInternational) {
    const internationalMethod = methods.find((m: any) => m.isInternational)
    return internationalMethod || { method: 'International Shipping', price: 50, estimatedDays: null, minOrderAmount: 0 }
  }
  return methods.find((m: any) => m.method === shippingMethodName) || methods[0]
}

export async function createPaymentIntent(
  items: any[],
  shippingMethodName: string,
  couponCode: string | undefined,
  isRedeemingPoints: boolean,
  country?: string
) {
  const payload = await getPayload({ config: configPromise })


  // Validate items, check stock, and calculate subtotal securely on server
  let subtotal = 0;
  let pricesChanged = false;
  const { revalidateCartPrices } = await import('@/app/(frontend)/actions/cart')
  const liveItems = await revalidateCartPrices(items)

  for (let i = 0; i < items.length; i++) {
     const item = items[i]
     const liveItem = liveItems[i]
     
     const itemPrice = Number(item.priceSnapshot)
     const livePrice = Number(liveItem.priceSnapshot)
     
     if (itemPrice !== livePrice && !(Number.isNaN(itemPrice) && Number.isNaN(livePrice))) {
       pricesChanged = true
     }

     const productRes = await payload.findByID({ collection: 'products', id: (!isNaN(Number(item.productId)) ? Number(item.productId) : item.productId) as any, depth: 0 })
     if (!productRes) {
        return { error: `Product not found: ${item.productId}` }
     }
     if ((productRes.stock || 0) < item.quantity) {
        return { error: `Insufficient stock for ${productRes.name || 'item'}. Only ${productRes.stock} left.` }
     }
     subtotal += liveItem.priceSnapshot * item.quantity
  }

  if (pricesChanged) {
    return { 
      error: 'Prices for some items have updated since they were added to your cart. We have refreshed your cart with the latest live prices.', 
      updatedItems: liveItems,
      priceChanged: true
    }
  }

  let discountAmount = 0;
  let freeShipping = false;

  if (couponCode) {
    const couponRes = await verifyCoupon(couponCode, subtotal, items)
    if (couponRes.valid) {
      discountAmount = couponRes.discount || 0
      freeShipping = couponRes.freeShipping || false
    }
  }

  const methods = await getShippingMethods()
  const selectedMethod = resolveShippingMethod(methods, shippingMethodName, country)

  // Validate minOrderAmount for the selected shipping method
  if ((selectedMethod as any)?.minOrderAmount && (selectedMethod as any).minOrderAmount > 0) {
    if (subtotal < (selectedMethod as any).minOrderAmount) {
       return { error: `Your cart subtotal must be at least $${(selectedMethod as any).minOrderAmount} to use ${selectedMethod.method}.` }
    }
  }

  const shippingCost = selectedMethod?.price || 0

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const isInternational = !!country && country !== 'US'
  const isExpressShipping = shippingMethodName.toLowerCase().includes('express')
  const qualifiesForFreeShipping = freeShipping || false
  const finalShipping = (qualifiesForFreeShipping && !isExpressShipping && !isInternational) ? 0 : shippingCost

  // Calculate dynamic processing fees
  const activeFees = await getActiveProcessingFees()
  let feeTotal = 0
  activeFees.forEach((fee: any) => {
    if (!fee.isOptional) {
      if (fee.type === 'percentage') {
        feeTotal += Math.round(subtotalAfterDiscount * (fee.amount / 100) * 100) / 100
      } else if (fee.type === 'fixed_amount') {
        feeTotal += fee.amount
      }
    }
  })

  const tax = 0 // Statically 0 now, handled by ProcessingFees
  const totalBeforePoints = subtotalAfterDiscount + finalShipping + tax + feeTotal

  let pointsToRedeem = 0;
  if (isRedeemingPoints) {
    const availablePoints = await getUserHBPoints()
    pointsToRedeem = Math.min(availablePoints, totalBeforePoints)
  }

  const total = totalBeforePoints - pointsToRedeem
  const amountInCents = Math.round(total * 100)

  if (amountInCents < 50) {
      return { error: 'Order total too low for Stripe processing (minimum $0.50)' }
  }

  // Check for affiliate ref cookie
  const cookieStore = await cookies()
  const affiliateRef = cookieStore.get('affiliate_ref')?.value
  const clickCookie = cookieStore.get('affiliate_click_id')?.value

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        affiliateId: affiliateRef || null,
        clickId: clickCookie || null
      }
    })

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, amount: total }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return { error: error.message }
  }
}

export async function createPayloadOrder(
  items: any[],
  shippingMethodName: string,
  couponCode: string | undefined,
  isRedeemingPoints: boolean,
  formData: any,
  paymentIntentId: string,
  userId?: string,
  paymentMethod: 'stripe' | 'zelle' | 'amex' | 'circoflows' | 'stripe_link' = 'stripe',
  isNewAddress = false
) {
  const payload = await getPayload({ config: configPromise })

  // Re-check required fields server-side — client-side `required` attributes only guard the
  // browser form UI and can be bypassed (disabled JS, direct action call), so phone (needed
  // for delivery updates/carrier issues) must be enforced here too, not just in the UI.
  if (!formData?.email || !formData?.firstName || !formData?.address || !formData?.city || !formData?.state || !formData?.zip || !formData?.phone) {
    return { error: 'Please fill out all required delivery details, including phone number.' }
  }

  let subtotal = 0;
  let pricesChanged = false;
  const { revalidateCartPrices } = await import('@/app/(frontend)/actions/cart')
  const liveItems = await revalidateCartPrices(items)

  const productsCache = new Map()

  for (let i = 0; i < items.length; i++) {
     const item = items[i]
     const liveItem = liveItems[i]
     
     if (item.priceSnapshot !== liveItem.priceSnapshot) {
       pricesChanged = true
     }

     let productRes;
     try {
       productRes = await payload.findByID({ collection: 'products', id: (!isNaN(Number(item.productId)) ? Number(item.productId) : item.productId) as any, depth: 0 })
     } catch (err) {
       return { error: `One or more items in your cart (${item.product?.name || 'Unknown item'}) are no longer available on our site. Please remove them to proceed.` }
     }
     if (!productRes) {
        return { error: `One or more items in your cart (${item.product?.name || 'Unknown item'}) are no longer available on our site. Please remove them to proceed.` }
     }
     productsCache.set(item.productId, productRes)
     if ((productRes.stock || 0) < item.quantity) {
        return { error: `Insufficient stock for ${productRes.name || 'item'}. Only ${productRes.stock} left.` }
     }
     subtotal += liveItem.priceSnapshot * item.quantity
  }

  if (pricesChanged) {
    return { 
      error: 'Prices for some items have updated since they were added to your cart. We have refreshed your cart with the latest live prices.', 
      updatedItems: liveItems,
      priceChanged: true
    }
  }

  let discountAmount = 0;
  let freeShipping = false;

  if (couponCode) {
    const couponRes = await verifyCoupon(couponCode, subtotal, items)
    if (couponRes.valid) {
      discountAmount = couponRes.discount || 0
      freeShipping = couponRes.freeShipping || false
    }
  }

  const methods = await getShippingMethods()
  const selectedMethod = resolveShippingMethod(methods, shippingMethodName, formData?.country)

  // Validate minOrderAmount for the selected shipping method
  if ((selectedMethod as any)?.minOrderAmount && (selectedMethod as any).minOrderAmount > 0) {
    if (subtotal < (selectedMethod as any).minOrderAmount) {
       return { error: `Your cart subtotal must be at least $${(selectedMethod as any).minOrderAmount} to use ${selectedMethod.method}.` }
    }
  }

  const shippingCost = selectedMethod?.price || 0

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const isInternational = !!formData?.country && formData.country !== 'US'
  const isExpressShipping = shippingMethodName.toLowerCase().includes('express')
  const qualifiesForFreeShipping = freeShipping || false
  const finalShipping = (qualifiesForFreeShipping && !isExpressShipping && !isInternational) ? 0 : shippingCost

  // Calculate dynamic processing fees
  const activeFees = await getActiveProcessingFees()
  let feeTotal = 0
  const appliedFees: any[] = []
  
  activeFees.forEach((fee: any) => {
    if (!fee.isOptional) {
      const amount = fee.type === 'percentage'
        ? Math.round(subtotalAfterDiscount * (fee.amount / 100) * 100) / 100
        : fee.amount

      feeTotal += amount
      appliedFees.push({
        feeId: fee.id,
        feeName: fee.name,
        amount,
        feeType: fee.type,
        // Snapshot the rate actually charged so it stays correct on this order even if
        // the processing-fees config is changed later.
        percentage: fee.type === 'percentage' ? fee.amount : null,
      })
    }
  })

  const tax = 0 // Statically 0 now, handled by ProcessingFees
  const totalBeforePoints = subtotalAfterDiscount + finalShipping + tax + feeTotal

  let pointsToRedeem = 0;
  if (isRedeemingPoints) {
    const availablePoints = await getUserHBPoints()
    pointsToRedeem = Math.min(availablePoints, totalBeforePoints)
  }

  const total = totalBeforePoints - pointsToRedeem

  try {
    // userId is the Payload user's own id (from the NextAuth session), not an external IdP id.
    // Guests are never resolved or linked to an existing account by typing an email — that
    // would let anyone attach an order (and, previously, redeem points) to a stranger's
    // account. Guest orders stay unowned; guestEmail is enough for confirmation emails and
    // for the order to show up automatically once they register with the same address
    // (see the retroactive-binding logic in hooks/users.ts).
    const payloadUserId: number | null = userId ? Number(userId) : null

    // Guard against duplicate orders from a double-click or a retried request after a slow
    // response — if an identical pending order for this same buyer was just created, reuse
    // it instead of reserving stock/points a second time.
    const dedupeWindow = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    const recentOrders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          payloadUserId ? { owner: { equals: payloadUserId } } : { guestEmail: { equals: formData.email } },
          { status: { equals: 'pending' } },
          { paymentMethod: { equals: paymentMethod } },
          { createdAt: { greater_than: dedupeWindow } },
        ],
      },
      sort: '-createdAt',
      limit: 1,
      overrideAccess: true,
    })
    const possibleDuplicate = recentOrders.docs[0]
    if (
      possibleDuplicate &&
      Array.isArray(possibleDuplicate.items) &&
      possibleDuplicate.items.length === items.length
    ) {
      return { orderId: String(possibleDuplicate.id) }
    }

    // Reserve stock atomically before creating the order — closes the race where two
    // concurrent checkouts for the last unit could both pass a stale availability check.
    const stockReservation = await reserveStock(
      payload,
      items.map((item) => ({
        productId: !isNaN(Number(item.productId)) ? Number(item.productId) : item.productId,
        quantity: item.quantity,
      })),
    )
    if (!stockReservation.success) {
      return { error: stockReservation.error }
    }

    // Reserve the coupon's usage slot / store-credit balance atomically too, so a
    // usage-limited or store-credit coupon can't be over-redeemed by concurrent checkouts.
    let reservedCouponId: number | null = null
    let reservedCouponIsStoreCredit = false
    if (couponCode && discountAmount > 0) {
      const couponLookup = await payload.find({
        collection: 'coupons',
        where: { code: { equals: couponCode.trim().toUpperCase() } },
        limit: 1,
        overrideAccess: true,
      })
      const couponDoc = couponLookup.docs[0]
      if (couponDoc) {
        reservedCouponId = couponDoc.id
        reservedCouponIsStoreCredit = couponDoc.type === 'store_credit'
        const couponReservation = await reserveCouponUsage(
          payload,
          couponDoc.id,
          discountAmount,
          reservedCouponIsStoreCredit,
        )
        if (!couponReservation.success) {
          await releaseStock(payload, items.map((item) => ({
            productId: !isNaN(Number(item.productId)) ? Number(item.productId) : item.productId,
            quantity: item.quantity,
          })))
          return { error: couponReservation.error }
        }
      }
    }

    // Reserve points atomically and use the CONFIRMED amount for the total — never the
    // earlier estimate — so a concurrent redemption on another order can't double-spend
    // the same balance.
    let confirmedPointsToRedeem = 0
    if (pointsToRedeem > 0 && payloadUserId) {
      confirmedPointsToRedeem = await reservePoints(payload, payloadUserId, pointsToRedeem)
    }
    const confirmedTotal = totalBeforePoints - confirmedPointsToRedeem

    // Format order items for Payload
    const orderItems = items.map(item => {
      const parsedId = parseInt(String(item.productId), 10)
      const productData = productsCache.get(item.productId)
      return {
        product: isNaN(parsedId) ? item.productId : parsedId,
        variant: item.variantSku || 'DEFAULT',
        // Human-readable label (e.g. "10mg Single") the cart already carries — without this
        // the admin only ever sees the raw SKU and has to cross-reference the product's
        // variant list by hand to know what was actually ordered.
        variantTitle: item.variantTitle || null,
        price: item.priceSnapshot,
        quantity: item.quantity,
        productSnapshot: productData || null
      }
    })

    // Create pending Order in Payload
    const cookieStore = await cookies()
    const affiliateRef = cookieStore.get('affiliate_ref')?.value
    const clickCookie = cookieStore.get('affiliate_click_id')?.value
    const orderSourceCookie = cookieStore.get('order_source')?.value

    const order = await payload.create({
      collection: 'orders',
      data: {
        owner: payloadUserId,
        customerFirstName: formData.firstName,
        customerLastName: formData.lastName,
        customerPhone: formData.phone,
        guestEmail: formData.email,
        shippingAddress: {
          line1: formData.address,
          line2: formData.apartment || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.zip,
          country: formData.country || 'US',
        },
        items: orderItems,
        status: confirmedTotal <= 0 ? 'paid' : 'pending',
        // Zelle has no payment API — orders stay unpaid until a human confirms the transfer manually.
        paymentStatus: confirmedTotal <= 0 ? 'captured' : 'unpaid',
        paymentMethod,
        fulfillmentStatus: 'unfulfilled',
        subtotal: subtotal,
        discountTotal: discountAmount,
        redeemedPoints: confirmedPointsToRedeem,
        shippingTotal: finalShipping,
        taxTotal: tax,
        feeTotal,
        appliedFees,
        total: confirmedTotal,
        shippingMethod: selectedMethod?.method || shippingMethodName,
        couponCode: couponCode || '',
        affiliateId: affiliateRef || null,
        clickId: clickCookie || null,
        orderSource: orderSourceCookie || null,
      }
    }).catch(async (err) => {
      // Order creation itself failed — release everything we already reserved above.
      await releaseStock(payload, items.map((item) => ({
        productId: !isNaN(Number(item.productId)) ? Number(item.productId) : item.productId,
        quantity: item.quantity,
      })))
      if (reservedCouponId) {
        await releaseCouponUsage(payload, reservedCouponId, discountAmount, reservedCouponIsStoreCredit)
      }
      if (confirmedPointsToRedeem > 0 && payloadUserId) {
        await releasePoints(payload, payloadUserId, confirmedPointsToRedeem)
      }
      throw err
    })

    // Consume the order-source attribution now that it's been applied to an order — only the
    // first order placed after a sibling-storefront referral (e.g. peptides7) should be
    // attributed to it; a later, unrelated order within the same cookie window should not be.
    if (orderSourceCookie) {
      cookieStore.delete('order_source')
    }

    // Update Stripe PaymentIntent with the Order ID (unless it's a free order or Zelle, which has no PaymentIntent)
    if (paymentMethod === 'stripe' && paymentIntentId && paymentIntentId !== 'free_order') {
       await stripe.paymentIntents.update(paymentIntentId, {
          metadata: {
             orderId: String(order.id)
          }
       })
    } else if (confirmedTotal <= 0) {
       // Instantly finalize the free order (deduct inventory, use coupons, give points)
       const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
       await finalizeOrder(order.id, {
          cartId: undefined, // user cart cleared in finalizeOrder, guest cart is in formData guestCart
          affiliateId: (await cookies()).get('affiliate_ref')?.value,
          clickId: (await cookies()).get('affiliate_click_id')?.value,
       })
    } else if (paymentMethod === 'zelle' || paymentMethod === 'amex' || paymentMethod === 'stripe_link') {
       // Send initial order invoice immediately for Zelle/AMEX/Stripe Link manual orders
       try {
           const customerEmail = order.guestEmail;
           if (customerEmail) {
               const { generateOrderInvoiceHtml } = await import('@/lib/emails/generateOrderEmail');
               const invoiceHtml = await generateOrderInvoiceHtml(order, payload);

               await sendTrackedEmail(payload, {
                   from: 'Orders | Certified Aminos <support@certifiedaminos.com>',
                   to: customerEmail,
                   bcc: 'support@helixbiochem.com',
                   subject: `Order Invoice #${order.orderNumber || order.id}`,
                   html: invoiceHtml,
               })
           }
       } catch (err) {
           console.error(`Failed to send initial ${paymentMethod} confirmation email`, err)
       }
    }

    // Save this shipping address to the account for next time, if it's a newly-typed one
    // (not one they picked from their existing saved addresses).
    if (payloadUserId && isNewAddress && formData.address) {
      try {
        const existingAddresses = await payload.find({
          collection: 'addresses',
          where: { user: { equals: payloadUserId } },
          overrideAccess: true,
        })
        const alreadySaved = existingAddresses.docs.some(
          (addr: any) =>
            addr.line1?.toLowerCase() === formData.address?.toLowerCase() &&
            addr.postalCode === formData.zip
        )
        if (!alreadySaved) {
          await payload.create({
            collection: 'addresses',
            data: {
              user: payloadUserId,
              label: formData.address,
              firstName: formData.firstName,
              lastName: formData.lastName,
              line1: formData.address,
              line2: formData.apartment || '',
              city: formData.city,
              state: formData.state,
              postalCode: formData.zip,
              country: formData.country || 'US',
              phone: formData.phone,
              isDefaultShipping: existingAddresses.docs.length === 0,
            },
            overrideAccess: true,
          })
        }
      } catch (err) {
        // Don't fail the order over a non-critical address save
        console.error('Failed to save address to account:', err)
      }
    }

    // Set a cookie to authorize the order confirmation page
    const authCookieStore = await cookies()
    authCookieStore.set(`order_auth_${order.id}`, 'true', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return { orderId: String(order.id) }
  } catch (error: any) {
    console.error('Failed to create Payload order:', error)
    return { error: error.message }
  }
}

export async function syncPaymentStatus(paymentIntentId: string, orderId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return { success: false, status: paymentIntent.status }
    }

    // Never trust the caller-supplied orderId — this action is a public endpoint (any
    // server action is just a POST route), so anyone could otherwise pay a trivial amount
    // for a PaymentIntent of their own and pass a stranger's orderId to mark it paid.
    // The order to finalize is only ever the one this PaymentIntent's own metadata names,
    // exactly like the webhook handler already does it.
    const trueOrderId = paymentIntent.metadata?.orderId
    if (!trueOrderId || trueOrderId !== String(orderId)) {
      console.error(`syncPaymentStatus: orderId mismatch (requested ${orderId}, PaymentIntent belongs to ${trueOrderId})`)
      return { error: 'Order/payment mismatch' }
    }

    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(trueOrderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    const expectedCents = Math.round((order.total || 0) * 100)
    if (paymentIntent.amount !== expectedCents) {
      console.error(`syncPaymentStatus: amount mismatch for order ${trueOrderId} (paid ${paymentIntent.amount}, expected ${expectedCents})`)
      return { error: 'Payment amount does not match order total' }
    }

    const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
    await finalizeOrder(trueOrderId, paymentIntent.metadata)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to sync payment status:', error)
    return { error: error.message }
  }
}

export async function notifyAdminFailedPayment(orderId: string, errorMessage: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const order = await payload.findByID({
      collection: 'orders',
      id: isNaN(Number(orderId)) ? orderId : Number(orderId),
      depth: 0,
    })

    if (!order) return { success: false }

    const orderNumber = order.orderNumber || orderId
    const customerEmail = (typeof order.owner === 'object' && order.owner !== null ? order.owner.email : order.guestEmail) || 'N/A'
    const customerName = [order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') || 'N/A'
    const customerPhone = order.customerPhone || 'N/A'
    const total = `$${(order.total || 0).toFixed(2)}`
    const paymentMethodLabels: Record<string, string> = {
      stripe: 'Card',
      zelle: 'Zelle',
      amex: 'American Express',
      circoflows: 'Card',
      stripe_link: 'Stripe Link'
    }
    const paymentMethod = (order.paymentMethod && paymentMethodLabels[order.paymentMethod]) || order.paymentMethod || 'N/A'

    const { emailLayout } = await import('@/lib/emails/emailLayout')
    const html = emailLayout({
      title: `Payment Failed - Order #${orderNumber}`,
      content: `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #B91C1C; font-weight: 800;">⚠️ Payment Failed Alert</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #2A2A2A; line-height: 1.6;">A customer attempted to checkout but their payment failed.</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 160px;">Order Number</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(String(orderNumber))}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Customer Name</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(customerName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Customer Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(customerEmail)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Customer Phone</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(customerPhone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Total</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(total)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Payment Method</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(paymentMethod)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Error Message</td>
            <td style="padding: 8px 0; font-size: 14px; color: #0A0A0A; font-weight: 600;">${escapeHtml(errorMessage)}</td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">You can check their cart/order details in the Payload Admin panel to see what they were trying to buy.</p>
      `,
    })

    await sendTrackedEmail(payload, {
      from: 'Support | Certified Aminos <support@certifiedaminos.com>',
      to: 'support@helixbiochem.com',
      subject: `⚠️ Payment Failed - Order #${orderNumber}`,
      html: html,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send admin failure notification:', error)
    return { success: false }
  }
}

