'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { DownloadIcon, FileTextIcon, ArrowRightIcon } from 'lucide-react'
import { FadeUp } from '@/components/motion/FadeUp'
import { FluidButton } from '@/components/ui/fluid-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type COA = {
  id: number
  product: string
  category: string
  purity: string | null
  batch: string | null
  analyzed: string | null
  coaUrl: string | null
}

export function CertificatesClient({ coas }: { coas: COA[] }) {
  const t = useTranslations('legal.certificates')
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...Array.from(new Set(coas.map(c => c.category))).sort()]

  const filteredCOAs = filter === 'All'
    ? coas
    : coas.filter(c => c.category === filter)

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003333] to-[#001111] pt-32 pb-20 relative overflow-hidden">
        <div className="w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] mx-auto relative z-10 flex flex-col items-center text-center">
          <FadeUp className="flex flex-col items-center">
            <div className="inline-block border border-white/10 rounded-full px-4 py-1.5 mb-6 bg-white/5 backdrop-blur-sm">
              <span className="text-white/90 text-xs font-bold tracking-[0.2em] uppercase font-heading">{t('eyebrow')}</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-6 max-w-3xl">
              {t('title')}
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
              {t('description')}
            </p>
            <Link href="/shop" className="inline-block">
              <FluidButton text={t('shopButton')} variant="cyan" />
            </Link>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-16 max-w-xl mx-auto">
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl">
                <span className="block text-2xl sm:text-3xl font-heading font-black text-white tracking-tighter">{coas.length}</span>
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1 font-heading">{t('statBatchesLabel')}</span>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl">
                <span className="block text-2xl sm:text-3xl font-heading font-black text-white tracking-tighter">{t('statLabsValue')}</span>
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1 font-heading">{t('statLabsLabel')}</span>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl">
                <span className="block text-2xl sm:text-3xl font-heading font-black text-white tracking-tighter">{t('statTestedValue')}</span>
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60 mt-1 font-heading">{t('statTestedLabel')}</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Filter and Table */}
      <section className="py-20 md:py-28">
        <div className="w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] mx-auto">
          <FadeUp>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">{t('libraryTitle')}</h2>
              {coas.length > 0 && (
                <div className="w-full sm:w-64">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="rounded-xl border-gray-200 focus:ring-[#2b646c]">
                      <SelectValue placeholder={t('filterPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat === 'All' ? t('allCategories') : cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {coas.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center text-gray-500">
                {t('emptyLibrary')}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 font-heading">{t('tableProduct')}</th>
                          <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 font-heading">{t('tablePurity')}</th>
                          <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 font-heading">{t('tableBatch')}</th>
                          <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 font-heading">{t('tableAnalyzed')}</th>
                          <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 font-heading text-right">{t('tableCoaDownload')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCOAs.map((coa) => (
                          <tr key={coa.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                            <td className="py-5 px-6">
                              <div className="text-sm font-semibold text-black">{coa.product}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-[#2b646c] mt-1 font-heading">{coa.category}</div>
                            </td>
                            <td className="py-5 px-6 text-sm text-black">{coa.purity || '—'}</td>
                            <td className="py-5 px-6 text-sm text-gray-600 font-mono">{coa.batch || '—'}</td>
                            <td className="py-5 px-6 text-sm text-gray-500">{coa.analyzed || '—'}</td>
                            <td className="py-5 px-6 text-right">
                              {coa.coaUrl ? (
                                <a
                                  href={coa.coaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#2b646c] hover:text-black transition-colors font-heading"
                                >
                                  <FileTextIcon className="w-4 h-4" />
                                  <span>{t('pdfLabel')}</span>
                                </a>
                              ) : (
                                <Link href="/contact-us" className="text-xs text-gray-500 hover:text-black underline underline-offset-4 transition-colors">
                                  {t('availableOnRequest')}
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-4">
                  {filteredCOAs.map((coa) => (
                    <div key={coa.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-black">{coa.product}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2b646c] font-heading">{coa.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-heading font-black text-black">{coa.purity || '—'}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 font-heading">{t('purityLabel')}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-4">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 font-heading">{t('batchLabel')}</span>
                          <span className="text-sm font-mono text-black">{coa.batch || '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 font-heading">{t('analyzedLabel')}</span>
                          <span className="text-sm text-black">{coa.analyzed || '—'}</span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {coa.coaUrl ? (
                          <a
                            href={coa.coaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2b646c] text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#1e5661] transition-colors font-heading"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t('downloadCoa')}</span>
                          </a>
                        ) : (
                          <Link href="/contact-us" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors font-heading">
                            {t('requestCoa')}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </FadeUp>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="w-[calc(100%-2rem)] md:w-[calc(100%-6rem)] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/hplc-machine-lab.png"
                  alt="HPLC (high-performance liquid chromatography) instrument used to verify Certified Aminos peptide purity for each batch's Certificate of Analysis"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="inline-block border border-gray-200 rounded-full px-4 py-1.5 mb-6 bg-white">
                <span className="text-[#2b646c] text-xs font-bold tracking-[0.2em] uppercase font-heading">{t('processEyebrow')}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-black tracking-tight uppercase mb-8">{t('processTitle')}</h2>
              <div className="text-gray-600 text-base leading-relaxed space-y-6">
                <p>{t('processText1')}</p>
                <p>{t('processText2')}</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-10 bg-black text-center">
        <FadeUp>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-white tracking-tight uppercase mb-6 max-w-2xl mx-auto">{t('ctaTitle')}</h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-10">
            {t('ctaText')}
          </p>
          <Link href="/science" className="inline-flex">
            <FluidButton text={<span className="flex items-center gap-2">{t('ctaButton')} <ArrowRightIcon className="w-4 h-4" /></span>} variant="white" />
          </Link>
        </FadeUp>
      </section>
    </main>
  )
}
