// src/hooks/users.ts
import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'

/**
 * Lower‑case the email on create / update.
 */
export const beforeChangeEmailLowercase: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (data.email) {
    data.email = (data.email as string).toLowerCase()
  }
  // Preserve existing email on updates if not changed
  if (!data.email && originalDoc?.email) {
    data.email = (originalDoc.email as string).toLowerCase()
  }
  return data
}

/**
 * Runs after a new user is created: sends the welcome email, notifies admin, and
 * retroactively binds any past guest orders placed with this email to the new account.
 * (Stripe customer creation isn't wired in yet — not needed while Stripe checkout is off.)
 */
export const afterCreateUserTodo: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    if (doc.email) {
      try {
        const { generateWelcomeEmail } = await import('@/lib/emails/generateWelcomeEmail')
        const welcomeHtml = await generateWelcomeEmail(doc)
        
        try {
          await sendTrackedEmail(req.payload, {
            from: 'Support | Certified Aminos <support@certifiedaminos.com>',
            to: doc.email,
            subject: 'Welcome to Helix Bio!',
            html: welcomeHtml,
          })
          req.payload.logger.info(`Sent welcome email to new user ${doc.email}`)
        } catch (err) {
          req.payload.logger.error({ err }, `Failed to send welcome email to ${doc.email}`)
        }

        // Notify admin
        const { escapeHtml } = await import('@/lib/emails/escapeHtml')
        await sendTrackedEmail(req.payload, {
          from: 'Support | Certified Aminos <support@certifiedaminos.com>',
          to: 'support@helixbiochem.com',
          subject: `New User Registration: ${doc.firstName || ''} ${doc.lastName || ''}`,
          html: `<p>A new user has registered an account.</p><p><strong>Email:</strong> ${escapeHtml(doc.email)}</p><p><strong>Name:</strong> ${escapeHtml(doc.firstName || '')} ${escapeHtml(doc.lastName || '')}</p>`
        })
      } catch (err) {
        req.payload.logger.error({ err }, `Failed to set up welcome emails for ${doc.email}`)
      }

      // Subscribe to marketing emails if accepted
      if (doc.acceptsMarketing && process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          
          const payloadObj: any = {
            email: doc.email.toLowerCase(),
            unsubscribed: false,
          }
          if (doc.firstName) payloadObj.firstName = doc.firstName
          if (doc.lastName) payloadObj.lastName = doc.lastName
          if (process.env.RESEND_AUDIENCE_ID) {
            payloadObj.audienceId = process.env.RESEND_AUDIENCE_ID
          }
          
          const { error } = await resend.contacts.create(payloadObj)
          if (error) {
            req.payload.logger.error({ err: error }, `Resend API Error for ${doc.email}`)
          } else {
            req.payload.logger.info(`Added new user ${doc.email} to Resend marketing audience.`)
          }
        } catch (err) {
          req.payload.logger.error({ err }, `Failed to add new user ${doc.email} to Resend audience.`)
        }
      }
    }

    // Retroactive Order Binding
    if (doc.email) {
      setTimeout(() => {
        (async () => {
          try {
            const payload = req.payload
            const orders = await payload.find({
              collection: 'orders',
              where: {
                and: [
                  { guestEmail: { equals: doc.email.toLowerCase() } },
                  {
                    or: [
                      { owner: { exists: false } },
                      { owner: { equals: null } }
                    ]
                  }
                ]
              },
              overrideAccess: true,
              req,
              sort: '-createdAt',
            })
            
            if (orders.docs.length > 0) {
              // Bind all guest orders to this user
              await Promise.all(orders.docs.map(order => 
                payload.update({
                  collection: 'orders',
                  id: order.id,
                  data: {
                    owner: doc.id
                  },
                  overrideAccess: true,
                  req,
                })
              ))

              // Sync user details from the most recent guest order if the user profile is empty
              const recentOrder = orders.docs[0] as any
              if (!doc.firstName && !doc.lastName && recentOrder.customerFirstName) {
                let addressId = null
                
                // Create default address from the order's shipping address
                if (recentOrder.shippingAddress && recentOrder.shippingAddress.line1) {
                  const newAddress = await payload.create({
                    collection: 'addresses',
                    data: {
                      user: doc.id,
                      label: 'Default Shipping',
                      firstName: recentOrder.customerFirstName,
                      lastName: recentOrder.customerLastName || '',
                      line1: recentOrder.shippingAddress.line1,
                      line2: recentOrder.shippingAddress.line2 || '',
                      city: recentOrder.shippingAddress.city || '',
                      state: recentOrder.shippingAddress.state || '',
                      postalCode: recentOrder.shippingAddress.postalCode || '',
                      country: recentOrder.shippingAddress.country || '',
                      phone: recentOrder.customerPhone || '',
                      isDefaultShipping: true
                    },
                    overrideAccess: true,
                    req,
                  })
                  addressId = newAddress.id
                }

                // Update User Profile
                await payload.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    firstName: recentOrder.customerFirstName,
                    lastName: recentOrder.customerLastName || '',
                    phone: recentOrder.customerPhone || '',
                    ...(addressId ? { defaultShippingAddress: addressId as any } : {})
                  },
                  overrideAccess: true,
                  req,
                })
              }
              console.log(`Retroactively bound ${orders.docs.length} guest orders to user ${doc.id}`)
            }
          } catch (err) {
            console.error('Error retroactively binding orders:', err)
          }
        })()
      }, 0)
    }
  }
}
