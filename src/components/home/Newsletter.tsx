'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { FluidButton } from '@/components/ui/fluid-button'
import Image from 'next/image'

export function Newsletter() {
  const t = useTranslations('home.newsletter')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }
      
      setStatus('success')
      setMessage('Successfully subscribed!')
      // Reset form
      const form = e.target as HTMLFormElement
      form.reset()
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="relative z-10 w-full py-32 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 z-0 bg-black">
        <Image 
          src="/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_36_52 AM.webp"
          alt="Abstract dark laboratory-inspired background for the Certified Aminos newsletter signup"
          fill 
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/80" />
      </div>

      <Container size="content" className="flex flex-col items-center text-center relative z-10">
        
        <FadeUp>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
            {t('eyebrow')}
          </span>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter uppercase mb-6">
            {t('title')}
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-white/70 text-lg max-w-lg leading-relaxed">
            {t('description')}
          </p>
        </FadeUp>
        
        <FadeUp delay={0.3} className="w-full">
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 max-w-md mx-auto mt-12 w-full"
          >
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <Input
                type="email"
                name="email"
                placeholder={t('emailPlaceholder')}
                required
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary min-w-0 disabled:opacity-50"
              />
              <div className="shrink-0 flex justify-center w-full md:w-auto">
                <FluidButton
                  type="submit"
                  text={status === 'loading' ? 'Subscribing...' : t('subscribeButton')}
                  variant="cyan"
                />
              </div>
            </div>
            
            {message && (
              <p className={`text-sm mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>
        </FadeUp>

        <FadeUp delay={0.4}>
          <p className="text-xs font-medium tracking-wide text-white/40 mt-6 uppercase">
            {t('unsubscribeNote')}
          </p>
        </FadeUp>

      </Container>
    </section>
  )
}
