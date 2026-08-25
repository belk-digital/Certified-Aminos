'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Settings2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updatePayoutCurrency } from './actions'

interface SettingsClientProps {
  initialCurrency: string;
}

export function SettingsClient({ initialCurrency }: SettingsClientProps) {
  const t = useTranslations('affiliate.dashboardSettings')
  const [currency, setCurrency] = React.useState(initialCurrency || 'USD')
  const [isPending, startTransition] = React.useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updatePayoutCurrency(currency)
      if (!result.success) {
        toast.error(result.error || 'Failed to save preferences')
        return
      }
      toast.success('Preferences saved')
    })
  }
  // Animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12"
    >
      <motion.div variants={itemVars} className="border-b-2 border-black pb-8">
        <h1 className="text- -light tracking-tight text-[#1e5661] uppercase leading-none mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">{t('subtitle')}</p>
      </motion.div>

      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
        <div className="flex flex-col gap-2 md:w-1/3">
          <h3 className="text-sm font-bold text-black uppercase tracking-widest">{t('payoutMethodTitle')}</h3>
          <p className="text-sm text-gray-500">{t('payoutMethodDesc')}</p>
        </div>

        <form className="w-full md:w-2/3 max-w-2xl flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('preferredCurrencyLabel')}</label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full appearance-none bg-transparent border-b-2 border-gray-200 text-black text-xl font-medium px-0 py-4 focus:outline-none focus:border-black transition-colors cursor-pointer rounded-none"
              >
                <option value="USD">{t('currencyUsd')}</option>
                <option value="BTC">{t('currencyBtc')}</option>
                <option value="ETH">{t('currencyEth')}</option>
                <option value="USDT_ERC20">{t('currencyUsdtErc20')}</option>
                <option value="USDT_TRC20">{t('currencyUsdtTrc20')}</option>
                <option value="STORE_CREDIT">{t('currencyStoreCredit')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-black">
                <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full h-14 px-10 text-xs font-medium uppercase tracking-[0.2em] gap-2 bg-black hover:bg-gray-800 text-white border-none disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('savePreferencesButton')}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

