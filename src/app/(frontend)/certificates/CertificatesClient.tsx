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
    <main className="w-full bg-[#FAFAFA] font-sans min-h-screen flex flex-col">
      
      {/* V2 Hero Section */}
      <section className="w-full h-[90vh] min-h-[600px] p-4 md:p-6 bg-[#FAFAFA] pt-[160px] md:pt-[200px] flex flex-col relative z-10">
        <div className="relative w-full h-full flex-grow rounded-3xl overflow-hidden bg-[#111] flex flex-col justify-between shadow-2xl">
          
          {/* Background Image & Overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
            style={{ backgroundImage: 'url("/HelixBio Images/hero_vials_lab.jpg")' }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
          
          {/* Center Content */}
          <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center">
            <FadeUp>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-blue-200/80 text-sm md:text-base tracking-[0.2em] uppercase font-semibold mt-6 max-w-lg mx-auto">
                {t('description')}
              </p>
            </FadeUp>
          </div>
          
        </div>
      </section>

      {/* V2 Stats Section */}
      <section className="py-24 bg-white overflow-hidden relative border-t border-slate-100">
        <div className="w-full px-6 md:px-12 max-w-6xl mx-auto">
          <FadeUp>
            <h2 className="text-xl md:text-3xl font-syncopate font-medium uppercase text-slate-900 mb-12 leading-tight">
              Verify our <span className="font-bold text-blue-900">purity standards</span> and access complete <span className="italic text-slate-500">analytical insights</span>.
            </h2>
          </FadeUp>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mt-16">
            <FadeUp delay={0.1} className="border-l border-blue-900 pl-6">
              <div className="text-5xl font-bold text-slate-900 mb-2">{coas.length}</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{t('statBatchesLabel')}</div>
            </FadeUp>
            <FadeUp delay={0.2} className="border-l border-blue-900 pl-6">
              <div className="text-5xl font-bold text-slate-900 mb-2">{t('statLabsValue')}</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{t('statLabsLabel')}</div>
            </FadeUp>
            <FadeUp delay={0.3} className="border-l border-blue-900 pl-6">
              <div className="text-5xl font-bold text-slate-900 mb-2">{t('statTestedValue')}</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{t('statTestedLabel')}</div>
            </FadeUp>
            <FadeUp delay={0.4} className="border-l border-blue-900 pl-6">
              <div className="text-5xl font-bold text-slate-900 mb-2">100%</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Transparency</div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* V2 Filter and Table */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="w-full px-6 md:px-12 max-w-6xl mx-auto">
          <FadeUp>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <h2 className="text-xl md:text-3xl font-syncopate font-medium uppercase text-slate-900 tracking-tight">{t('libraryTitle')}</h2>
              {coas.length > 0 && (
                <div className="w-full sm:w-64">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="rounded-full border-slate-200 bg-white shadow-sm focus:ring-blue-900 focus:border-blue-900 h-12 px-6">
                      <SelectValue placeholder={t('filterPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="focus:bg-slate-50">{cat === 'All' ? t('allCategories') : cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {coas.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center text-slate-500 font-medium shadow-sm">
                {t('emptyLibrary')}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-5 px-8 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('tableProduct')}</th>
                          <th className="py-5 px-8 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('tablePurity')}</th>
                          <th className="py-5 px-8 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('tableBatch')}</th>
                          <th className="py-5 px-8 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('tableAnalyzed')}</th>
                          <th className="py-5 px-8 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">{t('tableCoaDownload')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCOAs.map((coa) => (
                          <tr key={coa.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-6 px-8">
                              <div className="text-sm font-semibold text-slate-900">{coa.product}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-900 mt-1">{coa.category}</div>
                            </td>
                            <td className="py-6 px-8 text-sm text-slate-900 font-medium">{coa.purity || '—'}</td>
                            <td className="py-6 px-8 text-sm text-slate-600 font-mono">{coa.batch || '—'}</td>
                            <td className="py-6 px-8 text-sm text-slate-600">{coa.analyzed || '—'}</td>
                            <td className="py-6 px-8 text-right">
                              {coa.coaUrl ? (
                                <a
                                  href={coa.coaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 hover:text-blue-700 transition-colors bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100"
                                >
                                  <FileTextIcon className="w-4 h-4" />
                                  <span>{t('pdfLabel')}</span>
                                </a>
                              ) : (
                                <Link href="/contact-us" className="text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors">
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
                    <div key={coa.id} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{coa.product}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900">{coa.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-medium text-slate-900">{coa.purity || '—'}</span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{t('purityLabel')}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-4 border-t border-b border-slate-100 mb-4">
                        <div>
                          <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{t('batchLabel')}</span>
                          <span className="text-sm font-mono text-slate-700">{coa.batch || '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{t('analyzedLabel')}</span>
                          <span className="text-sm text-slate-700">{coa.analyzed || '—'}</span>
                        </div>
                      </div>

                      <div className="flex justify-center mt-2">
                        {coa.coaUrl ? (
                          <a
                            href={coa.coaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-900 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-800 transition-colors"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t('downloadCoa')}</span>
                          </a>
                        ) : (
                          <Link href="/contact-us" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors">
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

      {/* V2 Editorial Section */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                <Image
                  src="/hplc-machine-lab.png"
                  alt="HPLC (high-performance liquid chromatography) instrument used to verify Certified Aminos peptide purity for each batch's Certificate of Analysis"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2 className="text-2xl md:text-4xl font-syncopate font-medium uppercase text-slate-900 mb-8 leading-tight">{t('processTitle')}</h2>
              <div className="text-slate-600 text-lg leading-relaxed space-y-6">
                <p>{t('processText1')}</p>
                <p>{t('processText2')}</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* V2 CTA Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 text-center relative overflow-hidden">
        <div className="w-full px-6 md:px-12 relative z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-syncopate font-medium text-slate-900 tracking-tight uppercase mb-6 max-w-4xl mx-auto leading-tight">
              {t('ctaTitle')}
            </h2>
            <p className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
              {t('ctaText')}
            </p>
            <Link href="/science" className="inline-flex group">
              <div className="bg-blue-900 text-white px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-blue-800 shadow-xl shadow-blue-900/20">
                {t('ctaButton')}
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
