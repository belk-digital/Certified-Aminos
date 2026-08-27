'use client'

import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitAffiliateApplication } from '@/app/(frontend)/affiliates/actions'
import type { UserAffiliateStatus } from '@/app/(frontend)/affiliates/AffiliatesLandingClient'

gsap.registerPlugin(ScrollTrigger)

const fieldClass = 'h-14 rounded-xl bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900 px-4 text-slate-900 placeholder:text-slate-400'

export function AffiliatesApplyForm({ userStatus }: { userStatus: UserAffiliateStatus }) {
  const t = useTranslations('affiliate.landing')
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useGSAP(() => {
    gsap.fromTo('.apply-form',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    )
  }, { scope: containerRef })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await submitAffiliateApplication(formData)

    setIsSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else if (result.error === 'Unauthorized. Please log in to apply.') {
      router.push('/login?redirect=/affiliates#apply')
    } else {
      setError(result.error || t('formErrorGeneric'))
    }
  }

  return (
    <section ref={containerRef} id="apply" className="py-24 bg-white scroll-mt-24">
      <div className="w-full px-6 md:px-12 max-w-[1000px] mx-auto">
        <div className="apply-form relative w-full bg-[#FAFAFA] rounded-[2rem] border border-slate-200 overflow-hidden p-8 sm:p-12 md:p-16 shadow-sm">

          <div className="mb-12 relative z-10">
            <span className="font-syncopate font-bold text-blue-900 tracking-[0.15em] uppercase text-xs block mb-3">
              {t('applyEyebrow')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-syncopate font-medium uppercase text-slate-900 tracking-tight leading-tight max-w-2xl">
              {t('applyTitle')}
            </h2>
          </div>

          {userStatus === 'affiliate_approved' ? (
            <div className="text-center py-12 relative z-10">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-100">
                <Activity className="w-12 h-12 text-blue-900" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('approvedTitle')}</h3>
              <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10">{t('approvedDesc')}</p>
              <Link href="/affiliates/dashboard">
                <Button size="lg" className="h-14 px-10 rounded-full bg-blue-900 text-white hover:bg-slate-900 transition-all duration-300 font-bold tracking-wider uppercase text-sm border-none">
                  {t('approvedButton')}
                </Button>
              </Link>
            </div>
          ) : userStatus === 'affiliate_pending' || userStatus === 'pending_application' || submitted ? (
            <div className="text-center py-12 relative z-10">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('pendingTitle')}</h3>
              <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10">{t('pendingDesc')}</p>
            </div>
          ) : userStatus === 'affiliate_rejected' ? (
            <div className="text-center py-12 relative z-10">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
                <XCircle className="w-12 h-12 text-red-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('rejectedTitle')}</h3>
              <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10">{t('rejectedDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">

              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-semibold">
                    {error}
                  </div>
                )}
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase border-b border-slate-200 pb-3">{t('basicInfoTitle')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('displayNameLabel')} <span className="text-blue-900">*</span></Label>
                    <Input id="displayName" name="displayName" required placeholder={t('displayNamePlaceholder')} className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('websiteUrlLabel')}</Label>
                    <Input id="websiteUrl" name="websiteUrl" type="text" placeholder="https://example.com" className={fieldClass} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase border-b border-slate-200 pb-3 mt-8">{t('primaryPlatformTitle')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('platformLabel')} <span className="text-blue-900">*</span></Label>
                    <Select defaultValue="youtube" required name="platform">
                      <SelectTrigger id="platform" className={fieldClass}>
                        <SelectValue placeholder={t('platformPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-white border-slate-200 text-slate-900 shadow-xl">
                        <SelectItem value="youtube">{t('platformYoutube')}</SelectItem>
                        <SelectItem value="instagram">{t('platformInstagram')}</SelectItem>
                        <SelectItem value="tiktok">{t('platformTiktok')}</SelectItem>
                        <SelectItem value="twitter">{t('platformTwitter')}</SelectItem>
                        <SelectItem value="reddit">{t('platformReddit')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialUrl" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('profileUrlLabel')}</Label>
                    <Input id="socialUrl" name="socialUrl" type="text" placeholder="https://youtube.com/c/... or @yourhandle" className={fieldClass} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase border-b border-slate-200 pb-3 mt-8">{t('audienceStrategyTitle')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reach" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('reachLabel')} <span className="text-blue-900">*</span></Label>
                    <Select defaultValue="1k-10k" required name="reach">
                      <SelectTrigger id="reach" className={fieldClass}>
                        <SelectValue placeholder={t('reachPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-white border-slate-200 text-slate-900 shadow-xl">
                        <SelectItem value="<1k">{t('reachLess1k')}</SelectItem>
                        <SelectItem value="1k-10k">{t('reach1k10k')}</SelectItem>
                        <SelectItem value="10k-100k">{t('reach10k100k')}</SelectItem>
                        <SelectItem value="100k+">{t('reach100kPlus')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('nicheLabel')}</Label>
                    <Input id="niche" name="niche" placeholder={t('nichePlaceholder')} className={fieldClass} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methods" className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1">{t('methodsLabel')} <span className="text-blue-900">*</span></Label>
                  <Textarea
                    id="methods"
                    name="methods"
                    required
                    placeholder={t('methodsPlaceholder')}
                    className="min-h-[120px] rounded-xl bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900 p-4 text-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-slate-200">
                <div className="flex flex-row items-start space-x-3 space-y-0 bg-slate-50 p-5 rounded-xl border border-slate-200 w-full md:w-auto md:flex-1">
                  <Checkbox id="terms" name="terms" required className="mt-1 border-slate-300 data-[state=checked]:bg-blue-900 data-[state=checked]:text-white" />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="text-sm font-semibold text-slate-900 cursor-pointer">
                      {t('termsLabel')}
                    </Label>
                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                      {t('termsDesc')}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-end shrink-0">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-10 rounded-full bg-blue-900 text-white hover:bg-slate-900 transition-all duration-300 font-bold tracking-wider uppercase text-sm border-none w-full md:w-auto"
                  >
                    {isSubmitting ? t('submitting') : t('submitNow')}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
