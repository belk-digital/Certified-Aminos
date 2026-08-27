import { escapeHtml } from './escapeHtml'
import { emailLayout } from './emailLayout'

export async function generateOrderInvoiceHtml(order: any, payload?: any, customNote?: string, statusContext: 'success' | 'failed' | 'cancelled' | 'refunded' = 'success'): Promise<string> {
  const orderNumber = order.orderNumber || order.id;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const serverUrl = 'https://certifiedaminos.com';
  
  const formatMoney = (amount: number) => `$${(amount).toFixed(2)}`;
  
  const subtotal = order.subtotal || 0;
  const discountTotal = order.discountTotal || 0;
  const redeemedPoints = order.redeemedPoints || 0;
  const shippingTotal = order.shippingTotal || 0;
  const taxTotal = order.taxTotal || 0;
  const feeTotal = order.feeTotal || 0;
  const total = order.total || 0;
  
  const customerName = escapeHtml(`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Customer');
  
  let customerEmail = order.guestEmail || '';
  if (!customerEmail && order.owner && payload) {
    try {
      const userDoc = typeof order.owner === 'object' ? order.owner : await payload.findByID({ collection: 'users', id: order.owner, depth: 0 });
      if (userDoc?.email) customerEmail = userDoc.email;
    } catch (e) {
      console.error('Failed to fetch user email for invoice', e);
    }
  }

  const rawShipAddr = order.shippingAddress || {};
  const rawHasBilling = order.billingAddress && order.billingAddress.line1;
  const rawBillAddr = rawHasBilling ? order.billingAddress : rawShipAddr;
  const escapeAddr = (a: any) => ({
    line1: escapeHtml(a.line1),
    line2: escapeHtml(a.line2),
    city: escapeHtml(a.city),
    state: escapeHtml(a.state),
    postalCode: escapeHtml(a.postalCode),
    country: escapeHtml(a.country),
  })
  const shipAddr = escapeAddr(rawShipAddr);
  const billAddr = escapeAddr(rawBillAddr);

  let itemsHtml = '';
  if (order.items && Array.isArray(order.items)) {
    const itemPromises = order.items.map(async (item: any) => {
      const product = item.productSnapshot || {};
      const name = product.name || 'Product';
      const variantText = item.variantTitle || item.variant;
      const variant = variantText && variantText !== 'DEFAULT' ? ` - ${variantText}` : '';
      
      let imageUrl = '';
      
      // Try to get variant image first
      if (product.variants?.length) {
         const matchedVariant = product.variants.find((v: any) => v.sku === item.variant || (item.variant && item.variant.includes(v.sku)));
         if (matchedVariant && matchedVariant.images?.length > 0) {
            const vImgRef = matchedVariant.images[0].image;
            if (typeof vImgRef === 'object' && vImgRef?.url) {
               imageUrl = vImgRef.url.startsWith('http') ? vImgRef.url : `${serverUrl}${vImgRef.url.startsWith('/') ? '' : '/'}${vImgRef.url}`;
            } else if ((typeof vImgRef === 'string' || typeof vImgRef === 'number') && payload) {
               try {
                  const mediaDoc = await payload.findByID({ collection: 'media', id: vImgRef, depth: 0 });
                  if (mediaDoc && mediaDoc.url) {
                     imageUrl = mediaDoc.url.startsWith('http') ? mediaDoc.url : `${serverUrl}${mediaDoc.url.startsWith('/') ? '' : '/'}${mediaDoc.url}`;
                  }
               } catch (e) {
                  console.error('Failed to fetch media for email variant image', e);
               }
            }
         }
      }

      // Fallback to main product image
      if (!imageUrl && product.images && product.images.length > 0) {
        const imgRef = product.images[0].image;
        if (typeof imgRef === 'object' && imgRef?.url) {
          imageUrl = imgRef.url.startsWith('http') ? imgRef.url : `${serverUrl}${imgRef.url.startsWith('/') ? '' : '/'}${imgRef.url}`;
        } else if ((typeof imgRef === 'string' || typeof imgRef === 'number') && payload) {
          try {
            const mediaDoc = await payload.findByID({ collection: 'media', id: imgRef, depth: 0 });
            if (mediaDoc && mediaDoc.url) {
              imageUrl = mediaDoc.url.startsWith('http') ? mediaDoc.url : `${serverUrl}${mediaDoc.url.startsWith('/') ? '' : '/'}${mediaDoc.url}`;
            }
          } catch (e) {
             console.error('Failed to fetch media for email image', e)
          }
        }
      }
      
      // Fix spaces in URL for email clients without double-encoding existing percent-encodings
      if (imageUrl) {
         imageUrl = imageUrl.replace(/ /g, '%20');
      }

      const imgHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${name}" style="width: 60px; height: 90px; object-fit: contain; border-radius: 6px;" />` 
        : `<div style="width: 60px; height: 90px; background-color: #f3f4f6; border-radius: 6px; display: inline-block;"></div>`;

      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="75" valign="middle">
                  ${imgHtml}
                </td>
                <td valign="middle">
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${name}${variant}</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Qty: ${item.quantity}</p>
                </td>
                <td valign="middle" align="right">
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${formatMoney(item.price)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    });
    
    const itemsHtmlArray = await Promise.all(itemPromises);
    itemsHtml = itemsHtmlArray.join('');
  }

  const discountRow = discountTotal > 0 ? `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Discount ${order.couponCode ? `(${order.couponCode})` : ''}</td>
      <td align="right" style="padding: 8px 0; font-size: 14px; color: #16a34a;">-${formatMoney(discountTotal)}</td>
    </tr>
  ` : '';

  const pointsRow = redeemedPoints > 0 ? `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">HB Points Redeemed</td>
      <td align="right" style="padding: 8px 0; font-size: 14px; color: #16a34a;">-${formatMoney(redeemedPoints)}</td>
    </tr>
  ` : '';

  // Use the percentage snapshot stored on the order's appliedFees, never the live
  // processing-fees config — the config may have changed since this order was placed, and
  // this email must always reflect the rate actually charged at the time.
  let feeLabel = 'Processing Fees'
  const appliedPercentageFee = Array.isArray(order.appliedFees)
    ? order.appliedFees.find((f: any) => f.feeType === 'percentage' && typeof f.percentage === 'number')
    : null
  if (appliedPercentageFee) feeLabel = `Processing Fees (${appliedPercentageFee.percentage}%)`

  const safeTrackingLink = typeof order.trackingLink === 'string' && /^https?:\/\//i.test(order.trackingLink)
    ? escapeHtml(order.trackingLink)
    : ''

  const paymentMethodLabels: Record<string, string> = {
    stripe: 'Card',
    zelle: 'Zelle',
    amex: 'American Express',
    circoflows: 'Card',
    stripe_link: 'Stripe (Custom Link)',
  }
  const paymentMethodLabel = paymentMethodLabels[order.paymentMethod] || 'Card'

  const feeRow = feeTotal > 0 ? `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">${feeLabel}</td>
      <td align="right" style="padding: 8px 0; font-size: 14px; color: #111827;">${formatMoney(feeTotal)}</td>
    </tr>
  ` : '';
  return emailLayout({
    title: `Order Invoice #${orderNumber}`,
    serverUrl,
    content: `
              ${statusContext === 'failed' ? `
                <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #B91C1C; font-weight: 800; letter-spacing: -0.5px;">Your payment could not be processed</h2>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">Hi ${customerName},</p>
                <p style="margin: 0 0 24px 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">We weren't able to process payment for your order <strong>#${orderNumber}</strong>, so it hasn't been placed. You're welcome to try placing the order again.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${serverUrl}/checkout" style="background-color: #0A0A0A; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">Try Checking Out Again</a>
                </div>
              ` : statusContext === 'cancelled' || statusContext === 'refunded' ? `
                <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Your order has been ${statusContext}</h2>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">Hi ${customerName},</p>
                <p style="margin: 0 0 24px 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">Your order <strong>#${orderNumber}</strong> has been <strong>${statusContext}</strong>.</p>
                ${order.redeemedPoints ? `<p style="margin: 0 0 16px 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">Any HB Points used on this order have been credited back to your account.</p>` : ''}
              ` : `
                <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Thank you for your order, ${customerName}!</h2>
              `}
              
          ${customNote ? `
          <!-- Custom Admin Note -->
              <div style="background-color: #FAFAFA; border-left: 4px solid #0A0A0A; padding: 24px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #0A0A0A; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Message regarding your order</h3>
                <p style="margin: 0; color: #4A4A4A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(customNote)}</p>
              </div>
          ` : ''}

          ${statusContext === 'success' && order.paymentMethod === 'zelle' && order.paymentStatus === 'unpaid' ? `
          <!-- Zelle Payment Instructions -->
              <div style="background-color: #F3E8FF; border: 1px solid #E9D5FF; padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #E9D5FF; border-radius: 50%; color: #7E22CE; font-weight: bold; font-size: 24px; line-height: 48px; margin-bottom: 16px;">Z</div>
                <h3 style="margin: 0 0 8px 0; color: #6B21A8; font-size: 18px; font-weight: 700;">Complete Your Payment via Zelle</h3>
                <p style="margin: 0 0 20px 0; color: #7E22CE; font-size: 14px; line-height: 1.5;">To finalize your order, please send exactly <strong>${formatMoney(total)}</strong> to our Zelle account.</p>
                
                <p style="margin: 0 0 16px 0; color: #B91C1C; font-size: 13px; font-weight: 600;">Please make sure to include your order number <strong>#${orderNumber}</strong> in the Zelle memo.</p>

                <div style="display: block; margin-bottom: 20px;">
                  <div style="background-color: #ffffff; border: 1px solid #E9D5FF; border-radius: 12px; padding: 8px; display: inline-block;">
                  </div>
                </div>
                
                <div style="display: block; margin-bottom: 16px;">
                  <div style="background-color: #ffffff; border-radius: 8px; padding: 12px 24px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <p style="margin: 0 0 4px 0; color: #A855F7; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Send To</p>
                    <p style="margin: 0; color: #6B21A8; font-size: 16px; font-weight: 700;">support@certifiedaminos.com</p>
                  </div>
                </div>
                
                <p style="margin: 0; color: #9333EA; font-size: 11px; font-style: italic;">Note: Please ignore this payment instruction if you have already completed your payment on the website.</p>
              </div>
          ` : ''}

          ${statusContext === 'success' && order.paymentMethod === 'amex' && order.paymentStatus === 'unpaid' ? `
          <!-- AMEX Payment Instructions -->
              <div style="background-color: #EFF6FF; border: 1px solid #DBEAFE; padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #DBEAFE; border-radius: 50%; color: #1D4ED8; font-weight: bold; font-size: 24px; line-height: 48px; margin-bottom: 16px;">A</div>
                <h3 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 18px; font-weight: 700;">Complete Your American Express Payment</h3>
                <p style="margin: 0 0 20px 0; color: #1D4ED8; font-size: 14px; line-height: 1.5;">One of our team members will reach out to you shortly via <strong>SMS</strong> with a secure invoice link to finalize your American Express payment.</p>
              </div>
          ` : ''}

          ${statusContext === 'success' && order.paymentMethod === 'stripe_link' && order.paymentStatus === 'unpaid' ? `
          <!-- Stripe Link Payment Instructions -->
              <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #C7D2FE; border-radius: 50%; color: #4338CA; font-weight: bold; font-size: 24px; line-height: 48px; margin-bottom: 16px;">S</div>
                <h3 style="margin: 0 0 8px 0; color: #3730A3; font-size: 18px; font-weight: 700;">Complete Your Payment</h3>
                <p style="margin: 0; color: #4338CA; font-size: 14px; line-height: 1.5;">Our team will get back to you shortly with a custom Stripe payment link to finalize your order.</p>
              </div>
          ` : ''}

          ${statusContext === 'success' && safeTrackingLink ? `
          <!-- Tracking Link -->
              <div style="background-color: #FAFAFA; border-left: 4px solid #10B981; padding: 24px; border-radius: 0 12px 12px 0; margin-bottom: 32px;">
                <h3 style="margin: 0 0 8px 0; color: #065F46; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Track Your Order</h3>
                <p style="margin: 0 0 16px 0; color: #065F46; font-size: 14px; line-height: 1.6;">Your package is on the way! You can track its progress using the link below.</p>
                <a href="${safeTrackingLink}" target="_blank" style="display: inline-block; padding: 14px 24px; background-color: #10B981; color: #ffffff; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; border-radius: 8px;">Track Package</a>
              </div>
          ` : ''}

          <!-- Order Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td width="25%">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 700;">Order Number</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #0A0A0A; font-weight: 600;">${orderNumber}</p>
                  </td>
                  <td width="25%" align="center">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 700;">Payment Method</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #0A0A0A; font-weight: 600;">${escapeHtml(paymentMethodLabel)}</p>
                  </td>
                  <td width="25%" align="center">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 700;">Payment Status</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: ${order.paymentStatus === 'unpaid' ? '#B91C1C' : '#15803D'}; font-weight: 700;">${order.paymentStatus === 'unpaid' ? 'UNPAID' : 'PAID'}</p>
                  </td>
                  <td width="25%" align="right">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 700;">Date</p>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #0A0A0A; font-weight: 600;">${orderDate}</p>
                  </td>
                </tr>
              </table>

          <!-- Items -->
              <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 800; color: #0A0A0A; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                ${itemsHtml}
              </table>

          <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #4A4A4A;">Subtotal</td>
                  <td align="right" style="padding: 8px 0; font-size: 14px; color: #0A0A0A;">${formatMoney(subtotal)}</td>
                </tr>
                ${discountRow}
                ${pointsRow}
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #4A4A4A;">Shipping (${order.shippingMethod || 'Standard'})</td>
                  <td align="right" style="padding: 8px 0; font-size: 14px; color: #0A0A0A;">${shippingTotal === 0 ? 'Free' : formatMoney(shippingTotal)}</td>
                </tr>
                ${feeRow}
                <tr>
                  <td style="padding: 16px 0 0 0; font-size: 15px; font-weight: 700; color: #0A0A0A; border-top: 1px solid #E5E7EB;">Total</td>
                  <td align="right" style="padding: 16px 0 0 0; font-size: 18px; font-weight: 800; color: #0A0A0A; border-top: 1px solid #E5E7EB;">${formatMoney(total)}</td>
                </tr>
              </table>

          <!-- Shipping Info -->
              <div style="background-color: #FAFAFA; border-radius: 12px; border: 1px solid #E5E7EB; padding: 24px; margin-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.1em;">Shipping Address</p>
                    <p style="margin: 0; font-size: 14px; color: #0A0A0A; line-height: 1.6; font-weight: 500;">
                      ${customerName}<br>
                      ${shipAddr.line1 || ''} ${shipAddr.line2 ? `<br>${shipAddr.line2}` : ''}<br>
                      ${shipAddr.city || ''}, ${shipAddr.state || ''} ${shipAddr.postalCode || ''}<br>
                      ${shipAddr.country || ''}
                    </p>
                  </td>
                  <td width="50%" valign="top" style="padding-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.1em;">Billing Address</p>
                    <p style="margin: 0; font-size: 14px; color: #0A0A0A; line-height: 1.6; font-weight: 500;">
                      ${customerName}<br>
                      ${billAddr.line1 || ''} ${billAddr.line2 ? `<br>${billAddr.line2}` : ''}<br>
                      ${billAddr.city || ''}, ${billAddr.state || ''} ${billAddr.postalCode || ''}<br>
                      ${billAddr.country || ''}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 24px; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.1em;">Contact Information</p>
                    <p style="margin: 0; font-size: 14px; color: #0A0A0A; line-height: 1.6; font-weight: 500;">
                      ${customerEmail ? `Email: ${escapeHtml(customerEmail)}<br>` : ''}
                      ${order.customerPhone ? `Phone: ${escapeHtml(order.customerPhone)}` : ''}
                      ${!customerEmail && !order.customerPhone ? 'No contact information provided' : ''}
                    </p>
                  </td>
                </tr>
              </table>
              </div>

          <!-- View Order Button -->
              <div style="text-align: center;">
                <a href="${serverUrl}/account/orders/${order.id}" style="display: inline-block; padding: 16px 40px; background-color: #0A0A0A; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.1em;">View Order Status</a>
              </div>
    `
  })
}
