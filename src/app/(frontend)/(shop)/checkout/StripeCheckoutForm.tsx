import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/cart/store'
import { createPayloadOrder, notifyAdminFailedPayment } from './actions'

interface StripeCheckoutFormProps {
  amount: number
  items: any[]
  shippingMethod: string
  couponCode?: string
  isRedeemingPoints: boolean
  formData: any
  paymentIntentId: string
  userId?: string
}

export function StripeCheckoutForm({ 
  amount, items, shippingMethod, couponCode, isRedeemingPoints, formData, paymentIntentId, userId 
}: StripeCheckoutFormProps) {
  const t = useTranslations('checkout.stripeCheckoutForm')
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Validate required form data
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('fillRequiredFields'))
      return
    }

    setIsProcessing(true)

    // 1. Create the Order in Payload CMS
    const orderRes = await createPayloadOrder(
      items, shippingMethod, couponCode, isRedeemingPoints, formData, paymentIntentId, userId
    )

    if (orderRes.error || !orderRes.orderId) {
      toast.error(orderRes.error || t('orderInitFailed'))
      if ((orderRes as any).priceChanged && (orderRes as any).updatedItems) {
        useCartStore.getState().setItems((orderRes as any).updatedItems)
      }
      setIsProcessing(false)
      return
    }

    // 2. Confirm Stripe Payment
    // Some cards require an off-site 3D Secure/bank authentication step even with
    // `redirect: 'if_required'` — when that happens the browser navigates away and back,
    // remounting this page fresh and skipping everything below. Pointing return_url at the
    // order confirmation page (which was already created above) means that redirect still
    // lands somewhere sensible instead of stranding the customer back on checkout.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderRes.orderId}`,
      },
    })

    if (error) {
      toast.error(error.message || t('unexpectedError'))
      setIsProcessing(false)

      // Notify Admin
      await notifyAdminFailedPayment(String(orderRes.orderId), error.message || 'Unknown error')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success(t('paymentSuccessRedirecting'))

      // Force sync with backend immediately (fallback for slow webhooks)
      await import('./actions').then(m => m.syncPaymentStatus(paymentIntent.id, String(orderRes.orderId)))
      
      useCartStore.getState().clear()
      window.location.href = `/order-confirmation/${orderRes.orderId}`
    } else {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="submit" 
          variant="dark" 
          size="lg" 
          disabled={!stripe || isProcessing}
          className="w-full h-16 rounded-full text-sm tracking-widest uppercase shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all text-white disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>{t('payAmount', { amount: (amount).toFixed(2) })} <ArrowRight size={18} className="ml-2" /></>
          )}
        </Button>
        <p className="text-center text-xs text-ink/40 font-medium mt-2">
          {t('termsAcknowledgement')}
        </p>
      </div>
    </form>
  )
}
