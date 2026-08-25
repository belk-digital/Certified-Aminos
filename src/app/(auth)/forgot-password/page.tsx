'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Space_Grotesk } from 'next/font/google'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { requestPasswordReset } from './actions'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '700'] })

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordInput) => {
    await requestPasswordReset(data)
    setSubmitted(true)
  }

  return (
    <AuthSplitLayout mode="login">
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e5661]/10 text-[#1e5661] dark:bg-[#1e5661]/20 dark:text-[#84d0d9]">
                <MailCheck size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-center text-ink font-bold text-lg mb-4">
                  Check your email
                </h2>
                <p className="text-sm text-ink/60 max-w-[280px] mx-auto">
                  {t('success')}
                </p>
              </div>
              <Link href="/login" className="w-full">
                <button type="button" className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2">
                  {t('backToLogin')}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-center text-ink font-bold text-lg">
                {t('title')}
              </h2>
              <p className="text-sm text-ink/60 text-center -mt-4">{t('subtitle')}</p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
                <div className="flex flex-col border border-black/10 rounded-2xl overflow-hidden bg-white">
                  <div className="flex flex-col px-4 py-3 relative">
                    <label htmlFor="email" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                      {t('email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                      {...register('email')}
                    />
                    {errors.email && <span className="text-[10px] text-red-500 absolute right-4 top-4">{errors.email.message}</span>}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : t('submit')}
                </button>
              </form>
              <div className="flex justify-center items-center gap-1.5 mt-2">
                <Link href="/login" className="text-xs font-bold text-ink hover:text-primary transition-colors hover:underline underline-offset-4">
                  {t('backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthSplitLayout>
  )
}
