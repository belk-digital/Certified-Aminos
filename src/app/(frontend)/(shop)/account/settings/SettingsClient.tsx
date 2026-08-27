'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, Shield, Save, Bell, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { toast } from 'sonner'
import { UpdatePasswordDialog, ChangeEmailDialog } from '@/components/account/SecurityDialogs'

export interface AccountSettingsProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    authProvider?: string;
    preferredLocale?: string;
    acceptsMarketing?: boolean;
    orderSmsUpdates?: boolean;
  }
}

export function SettingsClient({ user }: AccountSettingsProps) {
  const t = useTranslations('account.settings')
  const [isPending, startTransition] = React.useTransition()
  const [language, setLanguage] = React.useState(user.preferredLocale || 'en')
  const [marketingEmails, setMarketingEmails] = React.useState(user.acceptsMarketing ?? false)
  const [orderSms, setOrderSms] = React.useState(user.orderSmsUpdates ?? false)

  async function savePreferences(update: Partial<{ preferredLocale: 'en' | 'es'; acceptsMarketing: boolean; orderSmsUpdates: boolean }>) {
    const { updatePreferencesAction } = await import('./actions')
    const result = await updatePreferencesAction(update)
    if (!result.success) {
      toast.error(result.error || t('toastUpdateFailed'))
      return
    }
    toast.success(t('toastUpdateSuccess'))
  }

  const [passwordOpen, setPasswordOpen] = React.useState(false)
  const [emailOpen, setEmailOpen] = React.useState(false)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const { updateProfile } = await import('./actions')
        const result = await updateProfile(formData)
        if (!result?.success) {
          toast.error(result?.error || t('toastUpdateFailed'))
          return
        }
        toast.success(t('toastUpdateSuccess'))
      } catch (error: any) {
        toast.error(error.message || t('toastUnexpectedError'))
      }
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col w-full max-w-[1000px] font-sans"
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1 max-w-lg text-sm">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* Personal Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-8 md:gap-16 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col gap-3 md:w-64 shrink-0">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-black">{t('personalInformation')}</h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Update your basic profile information to keep your account up to date.</p>
          </div>

          <form action={handleSubmit} className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('firstName')}</Label>
                <Input name="firstName" id="firstName" defaultValue={user.firstName || ''} className="h-12 bg-white border border-gray-200 rounded-xl px-4 focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-navy-deep font-light text-base" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('lastName')}</Label>
                <Input name="lastName" id="lastName" defaultValue={user.lastName || ''} className="h-12 bg-white border border-gray-200 rounded-xl px-4 focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-navy-deep font-light text-base" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="phone" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('phoneNumber')}</Label>
                <Input name="phone" id="phone" type="tel" defaultValue={user.phone || ''} className="h-12 bg-white border border-gray-200 rounded-xl px-4 focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-navy-deep font-light text-base" />
              </div>
              <div className="md:col-span-2 mt-4 flex md:justify-end">
                <button disabled={isPending} className="flex items-center gap-2 bg-navy-deep hover:bg-navy text-white rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-50 font-heading w-full md:w-auto justify-center">
                  <Save size={14} />
                  {isPending ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </div>
          </form>
        </motion.section>

        {/* Sign In & Security */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-8 md:gap-16 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col gap-3 md:w-64 shrink-0">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-black">{t('signInAndSecurity')}</h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Manage your credentials and keep your account secure.</p>
          </div>

          <div className="flex-1 w-full flex flex-col gap-8">
            <div className="flex flex-col gap-2 pb-6 border-b border-gray-100">
              <span className="text-base font-light text-black">{t('authManagedSecurely')}</span>
              <p className="text-sm text-gray-500 font-light">
                {t.rich('authDescription', {
                  strong: (chunks) => <strong className="text-black font-medium">{chunks}</strong>,
                  email: user.email,
                })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="flex items-center justify-center gap-2 bg-transparent hover:bg-gray-50 border border-gray-200 hover:border-navy-deep text-black rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors w-full sm:w-auto font-heading"
              >
                {t('updatePassword')} <ExternalLink size={14} />
              </button>
              <button
                type="button"
                onClick={() => setEmailOpen(true)}
                className="flex items-center justify-center gap-2 bg-transparent hover:bg-gray-50 border border-gray-200 hover:border-navy-deep text-black rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors w-full sm:w-auto font-heading"
              >
                {t('changeEmail')} <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-8 md:gap-16 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col gap-3 md:w-64 shrink-0">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-black">{t('preferences')}</h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Customize your region and currency settings.</p>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div className="flex flex-col gap-2">
              <Label htmlFor="language" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('language')}</Label>
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value)
                  startTransition(() => { savePreferences({ preferredLocale: value as 'en' | 'es' }) })
                }}
              >
                <SelectTrigger id="language" className="h-12 bg-white border border-gray-200 rounded-xl px-4 focus:ring-0 focus-visible:ring-0 font-light text-base w-full">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl">
                  <SelectItem value="en" className="rounded-lg font-light">{t('languageEnglishUs')}</SelectItem>
                  <SelectItem value="es" className="rounded-lg font-light">{t('languageSpanish')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency" className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] font-heading">{t('currency')}</Label>
              <div id="currency" className="h-12 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 text-base font-light text-gray-500">
                {t('currencyUsd')}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-8 md:gap-16 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col gap-3 md:w-64 shrink-0">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-black">{t('notifications')}</h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed">Manage how and when we contact you.</p>
          </div>

          <div className="flex-1 w-full flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col gap-2">
                <span className="text-base font-light text-black">{t('marketingEmails')}</span>
                <span className="text-sm text-gray-500 font-light">{t('marketingEmailsDescription')}</span>
              </div>
              <div className="flex bg-gray-50 rounded-full p-1 border border-gray-100 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { setMarketingEmails(true); startTransition(() => { savePreferences({ acceptsMarketing: true }) }) }}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-all font-heading ${marketingEmails ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t('on')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMarketingEmails(false); startTransition(() => { savePreferences({ acceptsMarketing: false }) }) }}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-all font-heading ${!marketingEmails ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t('off')}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col gap-2">
                <span className="text-base font-light text-black">{t('orderSmsUpdates')}</span>
                <span className="text-sm text-gray-500 font-light">{t('orderSmsUpdatesDescription')}</span>
              </div>
              <div className="flex bg-gray-50 rounded-full p-1 border border-gray-100 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { setOrderSms(true); startTransition(() => { savePreferences({ orderSmsUpdates: true }) }) }}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-all font-heading ${orderSms ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t('on')}
                </button>
                <button
                  type="button"
                  onClick={() => { setOrderSms(false); startTransition(() => { savePreferences({ orderSmsUpdates: false }) }) }}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-all font-heading ${!orderSms ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t('off')}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

      </div>

      <UpdatePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} isGoogleOnly={user.authProvider === 'google'} />
      <ChangeEmailDialog open={emailOpen} onOpenChange={setEmailOpen} />
    </motion.div>
  )
}
