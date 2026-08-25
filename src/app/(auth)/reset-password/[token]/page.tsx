'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Space_Grotesk } from 'next/font/google'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { resetPassword } from '../actions'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '700'] })

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const t = useTranslations('auth.resetPassword')
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError('')
    const result = await resetPassword(token, data)
    if (!result.success) {
      setServerError(result.error === 'invalidToken' ? t('invalidToken') : t('mismatch'))
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <AuthSplitLayout mode="login">
      <div className="w-full flex flex-col items-center">
        <div className="w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6">
          <h2 className="text-center text-ink font-bold text-lg">
            {t('title')}
          </h2>
          <p className="text-sm text-ink/60 text-center -mt-4">{t('subtitle')}</p>

          {success ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
              <p className="text-sm font-medium text-ink">{t('success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
              <div className="flex flex-col border border-black/10 rounded-2xl overflow-hidden bg-white">
                <div className="flex flex-col px-4 py-3 relative">
                  <label htmlFor="password" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                    {t('newPassword')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                    {...register('password')}
                  />
                  {errors.password && <span className="text-[10px] text-red-500 absolute right-4 top-4">{errors.password.message}</span>}
                </div>
                <div className="w-full h-px bg-black/5" />
                <div className="flex flex-col px-4 py-3 relative">
                  <label htmlFor="confirmPassword" className="text-[10px] text-ink/40 font-bold uppercase tracking-wider mb-1">
                    {t('confirmPassword')}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-ink focus:outline-none focus:ring-0 placeholder:text-ink/20"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && <span className="text-[10px] text-red-500 absolute right-4 top-4">{t('mismatch')}</span>}
                </div>
              </div>
              {serverError && <p className="text-sm font-medium text-red-500 text-center px-1">{serverError}</p>}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#111] hover:bg-black text-white rounded-xl py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Resetting...' : t('submit')}
              </button>
            </form>
          )}

          <div className="flex justify-center items-center gap-1.5 mt-2">
            <Link href="/login" className="text-xs font-bold text-ink hover:text-primary transition-colors hover:underline underline-offset-4">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </AuthSplitLayout>
  )
}
