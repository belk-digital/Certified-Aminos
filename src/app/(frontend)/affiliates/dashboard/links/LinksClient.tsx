'use client'

import React, { useState } from 'react'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { Copy, Check, ExternalLink, Edit2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { updateCouponCode } from './actions'

interface LinksClientProps {
  referralLink: string;
  couponCode: string;
  customerDiscount: number;
  commissionRate: number;
}

export function LinksClient({ referralLink, couponCode: initialCouponCode, customerDiscount, commissionRate }: LinksClientProps) {
  const t = useTranslations('affiliate.links')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  
  // Edit states
  const [couponCode, setCouponCode] = useState(initialCouponCode)
  const [isEditing, setIsEditing] = useState(false)
  const [newCode, setNewCode] = useState(initialCouponCode)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text)
    if (type === 'link') {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleSaveCode = async () => {
    setError(null)
    setIsSaving(true)
    
    try {
      const result = await updateCouponCode(newCode)
      
      if (result.success && result.code) {
        setCouponCode(result.code)
        setNewCode(result.code)
        setIsEditing(false)
      } else {
        setError(result.error || t('errorUpdateFailed'))
      }
    } catch (err: any) {
      setError(err.message || t('errorUnexpected'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setNewCode(couponCode)
    setIsEditing(false)
    setError(null)
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16 max-w-4xl"
    >
      <motion.div variants={itemVars} className="border-b-2 border-black pb-8">
        <h1 className="text-4xl lg:text-[56px] font-light tracking-tight text-black leading-none mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">{t('subtitle')}</p>
      </motion.div>

      {/* Referral Link Card */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start border-b border-gray-100 pb-12">
        <div className="flex flex-col gap-2 md:w-1/3 shrink-0">
          <h3 className="text-sm font-medium text-black uppercase tracking-[0.2em]">{t('referralLinkTitle')}</h3>
          <p className="text-sm text-gray-500">{t('referralLinkDesc')}</p>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-3">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('yourReferralLink') || 'URL'}</label>
              <div className="bg-transparent border-b-2 border-gray-200 px-0 py-3 text-lg font-mono text-black break-all select-all selection:bg-black/10">
                {referralLink}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto h-[52px]">
              <Button
                onClick={() => handleCopy(referralLink, 'link')}
                variant="outline"
                className="flex-1 sm:flex-none rounded-none h-full px-8 text-xs font-medium uppercase tracking-[0.2em] gap-2 bg-transparent text-black border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? t('copied') : t('copy')}
              </Button>
              <a href={referralLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-full bg-gray-50 hover:bg-gray-100 text-black transition-colors">
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coupon Code Card */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
        <div className="flex flex-col gap-2 md:w-1/3 shrink-0">
          <h3 className="text-sm font-medium text-[#008B8B] uppercase tracking-[0.2em]">{t('couponCodeTitle')}</h3>
          <p className="text-sm text-gray-500">
            {t.rich('couponCodeDesc', {
              discount: customerDiscount,
              commission: commissionRate,
              strong: (chunks) => <strong className="text-[#008B8B]">{chunks}</strong>,
            })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full items-end">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 w-full flex flex-col gap-3"
              >
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('yourCouponCode') || 'CODE'}</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder={t('codePlaceholder')}
                    maxLength={20}
                    className="w-full bg-transparent border-b-2 border-[#008B8B] px-0 py-3 text-2xl font-mono font-bold text-[#008B8B] focus:outline-none focus:border-blue-600 transition-colors"
                    autoFocus
                  />
                  {error && <span className="text-xs font-medium text-red-500">{error}</span>}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 w-full flex flex-col gap-3"
              >
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('yourCouponCode') || 'CODE'}</label>
                <div className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-3 text-2xl font-mono font-bold text-black flex items-center justify-between">
                  <span>{couponCode}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-black transition-colors"
                    title={t('editCodeTitle')}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="edit-actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-2 shrink-0 w-full sm:w-auto h-[56px]"
              >
                <Button 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  variant="outline"
                  className="flex-1 sm:flex-none rounded-none h-full px-6 text-xs font-medium uppercase tracking-[0.2em] gap-2 bg-transparent text-gray-500 border-2 border-gray-200 hover:bg-gray-100"
                >
                  <X size={16} />
                </Button>
                <Button 
                  onClick={handleSaveCode}
                  disabled={isSaving}
                  className="flex-1 sm:w-32 rounded-none h-full px-8 text-xs font-medium uppercase tracking-[0.2em] gap-2 bg-[#008B8B] hover:bg-blue-600 text-white border-none"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? t('saving') : t('save')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="copy-action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="shrink-0 w-full sm:w-auto h-[56px]"
              >
                <Button
                  onClick={() => handleCopy(couponCode, 'code')}
                  className="w-full rounded-none h-full px-10 text-xs font-medium uppercase tracking-[0.2em] gap-2 bg-black hover:bg-gray-800 text-white border-none"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? t('copied') : t('copyCode')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </motion.div>
  )
}

