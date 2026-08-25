'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { FadeUp } from '@/components/motion/FadeUp'
import { MagneticScrollWrapper } from '@/components/motion/MagneticScrollWrapper'
import { StaggerChildren, staggerItemVariants } from '@/components/motion/StaggerChildren'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, DollarSign, Clock, ShieldCheck, Activity, BarChart3, Link as LinkIcon, XCircle, AlertTriangle, FileText, Share2, MousePointerClick, TrendingUp } from 'lucide-react'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { PinterestGlassCard } from '@/components/home/PinterestGlassCard'
import { submitAffiliateApplication } from './actions'
import { useRouter } from 'next/navigation'
import { FluidButton } from '@/components/ui/fluid-button'

const FAQ_KEYS = [
  'faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq7', 'faq8', 'faq9', 'faq10', 'faq11', 'faq12', 'faq13',
] as const

export type UserAffiliateStatus = 'guest' | 'user' | 'pending_application' | 'affiliate_approved' | 'affiliate_pending' | 'affiliate_rejected'

interface Props {
  userStatus: UserAffiliateStatus;
}

const MagneticScrollCard = ({ feature, icon: Icon, i, staggerItemVariants }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of this specific card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 5%", "start -30%"]
  });

  // Buttery smooth spring for that magnetic pull
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.2
  });

  const isLeft = i % 3 === 0;
  const isRight = i % 3 === 2;
  
  // Magnetic pull offsets
  const xOffset = isLeft ? -100 : isRight ? 100 : 0;
  const yOffset = -150; 
  
  // Apply buttery smooth progress
  const x = useTransform(smoothProgress, [0, 1], [0, xOffset]);
  const y = useTransform(smoothProgress, [0, 1], [0, yOffset]);
  const opacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 1, 0]);

  // Modern stagger hover
  const hoverClasses = "hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(14,165,233,0.15)]";

  return (
    <motion.div 
      ref={cardRef}
      variants={staggerItemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      style={{ x, y, opacity }}
      className="w-full h-full will-change-transform"
    >
      <div className={`w-full h-full p-8 sm:p-10 rounded-[2rem] bg-zinc-950 border border-white/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-start cursor-default ${hoverClasses}`}>
        
        {/* Animated Neon Spotlight (Visible on Hover) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        {/* Huge Outline Watermark Number */}
        <div className="absolute -bottom-10 -right-6 pointer-events-none select-none overflow-hidden">
          <span 
            className="text-[180px] font-black leading-none text-transparent"
            style={{ 
              WebkitTextStroke: '2px rgba(255,255,255,0.03)',
              textShadow: '0 0 40px rgba(255,255,255,0)'
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon Pill */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110 transition-all duration-500 shadow-xl relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Icon className="w-7 h-7 text-white/60 group-hover:text-primary relative z-10 transition-colors duration-500" strokeWidth={1.5} />
            </div>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-white mb-4 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
            {feature.title}
          </h3>
          
          <div className="w-10 h-1 bg-white/10 mb-6 group-hover:bg-primary/50 group-hover:w-20 transition-all duration-500" />
          
          <p className="text-sm md:text-base text-white/60 leading-relaxed font-medium mt-auto group-hover:text-white/90 transition-colors duration-300">
            {feature.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export function AffiliatesLandingClient({ userStatus }: Props) {
  const t = useTranslations('affiliate.landing')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isAccordionHovered, setIsAccordionHovered] = useState(false)

  const WHY_CHOOSE_FEATURES = [
    { key: 'why1', icon: TrendingUp }, 
    { key: 'why2', icon: DollarSign }, 
    { key: 'why3', icon: MousePointerClick },
    { key: 'why4', icon: LinkIcon },
    { key: 'why5', icon: Activity },
    { key: 'why6', icon: BarChart3 },
    { key: 'why7', icon: ShieldCheck },
    { key: 'why8', icon: Clock },
    { key: 'why9', icon: CheckCircle2 }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = await submitAffiliateApplication(formData)

    setIsSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      if (result.error === 'Unauthorized. Please log in to apply.') {
        router.push('/login?redirect=/affiliates#apply')
      } else {
        setError(result.error || t('formErrorGeneric'))
      }
    }
  }

  useEffect(() => {
    if (isAccordionHovered) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAccordionHovered]);

  const scrollToApply = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.body.style.pointerEvents = 'none';
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { document.body.style.pointerEvents = ''; }, 1200); // Wait for scroll to finish
  };

  return (
    <div className="w-full bg-[#FAFAFA] font-sans overflow-hidden">
      
      {/* Home/Calculator Style Hero */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-32 sm:pt-36 md:pt-44 pb-8 mx-auto max-w-[1920px]">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <FadeUp>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-ink uppercase tracking-tighter leading-[0.9] mb-2 sm:mb-4">
              {t('heroTitle') || 'AFFILIATE PROGRAM'}
            </h1>
            <p className="text-ink/50 text-sm md:text-base tracking-wide font-medium max-w-xl">
              JOIN OUR ELITE PARTNER NETWORK
            </p>
          </FadeUp>
        </div>
        
        {/* Banner Row */}
        <FadeUp delay={0.2}>
          <div className="relative w-full h-[400px] sm:h-[450px] md:h-[550px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-4 sm:mb-6 shadow-2xl group cursor-pointer bg-zinc-900">
            <Image
              src="/HelixBio Images/mutiple-vial-1.webp"
              alt="Affiliate Program"
              fill
              className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
            
            {/* Bottom Info Pill */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-28 z-20 pointer-events-none">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 pointer-events-auto">
                <span className="bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 inline-block shadow-sm">
                  PARTNER WITH US
                </span>
                <p className="text-white text-xs sm:text-base md:text-lg font-medium tracking-wide mb-4 leading-relaxed">
                  Earn industry-leading commissions by promoting the highest purity research peptides on the market. We provide 7-day cookie tracking, monthly payouts, and dedicated affiliate support.
                </p>
                <div onClick={scrollToApply} className="inline-block cursor-pointer">
                  <FluidButton
                    text={<>{t('heroJoinButtonShort') || 'Apply Now'}</>}
                  />
                </div>
              </div>
            </div>
            
            {/* Floating Icon */}
            <div onClick={scrollToApply} className="absolute bottom-10 right-10 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30 text-white transition-transform duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-ink hidden sm:flex hover:scale-110">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
        </FadeUp>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <FadeUp delay={0.3} className="h-full">
            <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex items-end justify-between hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full relative">
              <div className="flex flex-col">
                <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                  15%
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                  BASE COMMISSION
                </span>
              </div>
              <span className="absolute top-6 right-6 border border-ink/10 text-ink/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-ink/5">
                EARN
              </span>
            </div>
          </FadeUp>
          
          <FadeUp delay={0.4} className="h-full">
            <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex items-end justify-between hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full relative">
              <div className="flex flex-col">
                <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                  7-DAY
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                  COOKIE DURATION
                </span>
              </div>
              <span className="absolute top-6 right-6 border border-ink/10 text-ink/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-ink/5">
                TRACK
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.5} className="h-full">
            <div className="bg-ink rounded-[1.5rem] p-6 sm:p-8 flex items-end relative hover:bg-black transition-all duration-300 cursor-default shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full">
              <div className="flex flex-col">
                <span className="text-4xl sm:text-5xl font-black text-white font-heading tracking-tighter">
                  MONTHLY
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                  PAYOUT SCHEDULE
                </span>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-10 py-10 md:py-16 relative z-10">

        {/* 1. Intro Section (Bento Grid) */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
            <FadeUp>
              <div className="text-left">
                <h2 className="text-label-md uppercase tracking-widest text-primary mb-6 font-bold flex items-center gap-3">
                  <span className="w-8 h-px bg-primary"></span>
                  {t('introEyebrow')}
                </h2>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 tracking-tighter uppercase leading-[1.1]">
                  {t('introTitle')}
                </h2>
                <p className="font-light text-lg md:text-xl text-ink/70 leading-relaxed max-w-xl">
                  {t('introDescription')}
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <FadeUp delay={0.1} className="md:col-span-2">
              <div className="bg-white rounded-[2rem] p-8 md:p-12 h-full border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mb-8 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-ink mb-4">{t('benefit1')}</h3>
                <p className="text-ink/60 text-lg max-w-md">{t('benefit2')}</p> 
              </div>
            </FadeUp>

            <FadeUp delay={0.2} className="md:col-span-1">
              <div className="bg-zinc-900 rounded-[2rem] p-8 md:p-12 h-full shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">{t('benefit3')}</h3>
                <p className="text-white/60 text-lg">{t('benefit4')}</p>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* 2. How it works */}
        <section className="mb-32">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink mb-6 tracking-tighter uppercase">{t('howItWorksTitle')}</h2>
              <p className="text-base sm:text-lg text-ink/70 font-light max-w-2xl mx-auto leading-relaxed">
                {t('howItWorksSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
              <PinterestGlassCard
                title={t('commissionCardTitle')}
                description={t('commissionCardDesc')}
                icon={<DollarSign className="w-5 h-5" />}
                tag="15%"
                microcopy={t('commissionCardMicrocopy')}
                iconPosition="top-left"
                scrollFanning={true}
              />
              <PinterestGlassCard
                title={t('discountCardTitle')}
                description={t('discountCardDesc')}
                icon={<TrendingUp className="w-5 h-5" />}
                tag="15%"
                microcopy={t('discountCardMicrocopy')}
                iconPosition="top-left"
                scrollFanning={true}
              />
            </div>

            <div 
              className="w-full max-w-7xl mx-auto h-[600px] lg:h-[700px] flex flex-col md:flex-row gap-2 sm:gap-4 mt-16"
              onMouseEnter={() => setIsAccordionHovered(true)}
              onMouseLeave={() => setIsAccordionHovered(false)}
            >
              {[
                { id: 0, title: t('step1Title'), desc: t('step1Desc'), icon: CheckCircle2, image: '/HelixBio Images/slide-1.webp' },
                { id: 1, title: t('step2Title'), desc: t('step2Desc'), icon: LinkIcon, image: '/HelixBio Images/military-1.webp' },
                { id: 2, title: t('step3Title'), desc: t('step3Desc'), icon: Share2, image: '/HelixBio Images/hero-3.png' },
                { id: 3, title: t('step4Title'), desc: t('step4Desc'), icon: DollarSign, image: '/HelixBio Images/hero-1.png' }
              ].map((step, index) => {
                const isActive = activeStepIndex === index;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    onClick={() => setActiveStepIndex(index)}
                    onMouseEnter={() => setActiveStepIndex(index)}
                    animate={{ flex: isActive ? 5 : 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative rounded-[2rem] overflow-hidden cursor-pointer flex flex-col md:flex-row shadow-2xl transition-all duration-300 ${
                      isActive ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-black/5 hover:bg-zinc-50'
                    }`}
                  >
                    {/* Background Image (Only visible when active) */}
                    <div className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-40' : 'opacity-0'}`}>
                      <Image src={step.image} alt={step.title} fill className={`object-cover ${isActive ? 'scale-100' : 'scale-110'} transition-transform duration-1000 ease-out`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    </div>

                    {/* Number Watermark */}
                    <div className={`absolute -bottom-4 md:-bottom-10 right-4 md:-right-6 font-heading font-black leading-none transition-all duration-700 pointer-events-none z-10 ${
                      isActive ? 'text-[120px] md:text-[250px] text-white/[0.03]' : 'text-[60px] text-ink/[0.03]'
                    }`}>
                      0{index + 1}
                    </div>

                    {/* Content Container */}
                    <div className="relative z-20 flex flex-col md:flex-row w-full h-full p-6 md:p-8">
                      {/* Icon & Title Area */}
                      <div className={`flex md:flex-col items-center justify-between md:justify-start gap-4 md:w-16 shrink-0 transition-all duration-500 ${isActive ? '' : 'w-full'}`}>
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                          isActive ? 'bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-zinc-100 border-black/5'
                        }`}>
                          <Icon className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-500 ${isActive ? 'text-primary' : 'text-ink/40'}`} strokeWidth={1.5} />
                        </div>
                        
                        <div className={`transition-all duration-500 flex-1 flex md:items-center justify-center md:pt-8 ${isActive ? 'opacity-0 w-0 h-0 hidden md:block' : 'opacity-100 w-full'}`}>
                          <h3 className={`font-heading font-bold uppercase tracking-widest whitespace-nowrap text-lg md:text-2xl md:[writing-mode:vertical-rl] md:rotate-180 ${isActive ? 'text-white' : 'text-ink/40'}`}>
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      {/* Expanding Detailed Content */}
                      <div className={`flex flex-col justify-end overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'opacity-100 flex-1 ml-0 md:ml-8 mt-4 md:mt-0' : 'opacity-0 w-0 h-0'}`}>
                        <div className="min-w-[250px]">
                          <span className="text-primary font-mono tracking-widest text-xs md:text-sm font-bold uppercase mb-2 block">
                            STEP 0{index + 1}
                          </span>
                          <h4 className="text-3xl md:text-5xl font-black text-white font-heading uppercase tracking-tighter mb-4 leading-[1.1]">
                            {step.title}
                          </h4>
                          <p className="text-white/70 text-sm md:text-lg max-w-md font-medium leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </FadeUp>
        </section>

        {/* 3. Commission Example & Metrics */}
        <section className="mb-32">
          <div className="w-full bg-zinc-950 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden border border-white/10">
            {/* Deep background neon blurs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 z-0" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4 z-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Side: Massive Typography */}
              <FadeUp>
                <div className="flex flex-col justify-center h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-px bg-primary"></div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">{t('commissionStructureTitle')}</h3>
                  </div>
                  <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.95]">
                    Industry <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30">Leading</span><br/>Payouts.
                  </h2>
                  <p className="text-white/60 font-medium text-lg lg:text-xl max-w-lg mb-10 leading-relaxed">
                    {t('commissionStructureDesc')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                      <span className="block text-4xl font-black text-white mb-2">{t('statCookieValue')}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">{t('statCookieLabel')}</span>
                      <p className="text-xs text-white/50">{t('statCookieDesc')}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                      <span className="block text-4xl font-black text-white mb-2">{t('statDualValue')}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">{t('statDualLabel')}</span>
                      <p className="text-xs text-white/50">{t('statDualDesc')}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>

              {/* Right Side: Earnings Dashboard */}
              <FadeUp delay={0.2} className="h-full">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                  
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8 flex justify-between items-center">
                    <span>{t('commissionExampleTitle')}</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-white/80">LIVE CALCULATION</span>
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">{t('commissionExampleOrderValueLabel')}</span>
                      </div>
                      <span className="font-mono text-2xl text-white">$200.00</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">{t('commissionExampleDiscountLabel')}</span>
                      </div>
                      <span className="font-mono text-2xl text-red-400">-$30.00</span>
                    </div>
                    <div className="flex justify-between items-end pb-2">
                      <div className="flex flex-col">
                        <span className="text-primary text-sm font-black tracking-widest uppercase mb-1">{t('commissionExampleYourCommissionLabel')}</span>
                      </div>
                      <span className="font-mono text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">$30.00</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">{t('monthlyEarningsTitle')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                        <div className="font-bold text-white/80 text-sm">{t('monthlyEarnings10Label')}</div>
                        <div className="font-mono text-lg text-white">$225.00</div>
                      </div>
                      <div className="flex justify-between items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="font-bold text-white text-sm relative z-10">{t('monthlyEarnings50Label')}</div>
                        <div className="font-mono text-xl text-primary font-bold relative z-10">$1,125.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* 4. Comprehensive Management Tools */}
        <section className="mb-32">
          <div className="text-center mb-10 sm:mb-16 px-4">
            <h2 className="text-label-md uppercase tracking-widest text-primary mb-4 font-bold">{t('managementToolsTitle')}</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase max-w-2xl mx-auto">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Scale</span>.
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1200px] mx-auto px-4">
            {/* Tool 1: Analytics (Wide, Dark) */}
            <FadeUp className="md:col-span-2 h-full">
              <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-all duration-700 -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 backdrop-blur-md">
                    <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">{t('tool1Title')}</h4>
                  <p className="text-white/60 text-lg max-w-md">{t('tool1Desc')}</p>
                </div>
                
                {/* Decorative Graph Element */}
                <div className="relative z-10 mt-12 flex items-end gap-2 h-24 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  {[40, 70, 45, 90, 65, 100, 85].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm transition-all duration-700" style={{ height: `${height}%`, transitionDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Tool 2: Custom Links (Square, Light) */}
            <FadeUp delay={0.2} className="md:col-span-1 h-full">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 h-full border border-ink/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mb-8 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <LinkIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-ink mb-3">{t('tool2Title')}</h4>
                <p className="text-ink/60">{t('tool2Desc')}</p>
                
                <div className="mt-auto pt-8">
                  <div className="px-4 py-3 bg-zinc-50 rounded-xl border border-ink/5 flex items-center gap-2 group-hover:border-primary/20 transition-colors">
                    <span className="text-xs text-ink/40 font-mono truncate">helixbiochem.com/ref/</span>
                    <span className="text-xs text-primary font-mono font-bold">your-name</span>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Tool 3: Live Tracking (Square, Light) */}
            <FadeUp delay={0.1} className="md:col-span-1 h-full">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 h-full border border-ink/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 mb-8 border border-green-500/20 group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-500">
                  <Activity className="w-6 h-6 text-green-600" strokeWidth={2} />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-ink mb-3">{t('tool3Title')}</h4>
                <p className="text-ink/60">{t('tool3Desc')}</p>
                
                <div className="mt-auto pt-8 flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-green-600">{t('tool3Tag')}</span>
                </div>
              </div>
            </FadeUp>

            {/* Tool 4: Marketing Assets (Wide, Primary) */}
            <FadeUp delay={0.3} className="md:col-span-2 h-full">
              <div className="bg-gradient-to-br from-primary to-teal-500 rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden group shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 max-w-sm mb-8 sm:mb-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mb-8 border border-white/30 group-hover:scale-110 transition-all duration-500 backdrop-blur-md">
                    <FileText className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">{t('tool4Title')}</h4>
                  <p className="text-white/80 text-lg">{t('tool4Desc')}</p>
                </div>
                
                {/* Floating Assets Graphic */}
                <div className="relative z-10 w-full sm:w-auto flex justify-end">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 -rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-xl flex items-center justify-center">
                      <Share2 className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* 5. Why Choose Grid */}
        <section className="mb-32">
          <div className="text-center mb-10 sm:mb-16 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink mb-6 tracking-tighter uppercase">{t('whyChooseTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {WHY_CHOOSE_FEATURES.map((featureData, i) => (
              <MagneticScrollCard key={featureData.key} feature={{ title: t(`${featureData.key}Title`), desc: t(`${featureData.key}Desc`) }} icon={featureData.icon} i={i} staggerItemVariants={staggerItemVariants} />
            ))}
          </div>
        </section>

        {/* 6. Standards */}
        <section className="pb-32 max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MagneticScrollWrapper className="h-full">
              <div className="group bg-zinc-950 rounded-[2rem] p-8 md:p-12 border border-red-500/10 hover:border-red-500/30 shadow-2xl relative overflow-hidden h-full transition-all duration-500">
                {/* Red Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-500">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{t('prohibitedTitle')}</h3>
                  </div>
                  
                  <ul className="space-y-5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <li key={`prohibited-${num}`} className="flex items-start gap-4">
                        <XCircle className="w-5 h-5 text-red-500/80 shrink-0 mt-0.5" />
                        <span className="text-white/70 text-base font-medium">{t(`prohibited${num}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </MagneticScrollWrapper>
            
            <MagneticScrollWrapper className="h-full">
              <div className="group bg-zinc-950 rounded-[2rem] p-8 md:p-12 border border-primary/10 hover:border-primary/30 shadow-2xl relative overflow-hidden h-full transition-all duration-500">
                {/* Primary Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{t('contentStandardsTitle')}</h3>
                  </div>
                  
                  <ul className="space-y-5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <li key={`content-${num}`} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 text-primary/80 shrink-0 mt-0.5" />
                        <span className="text-white/70 text-base font-medium">{t(`content${num}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </MagneticScrollWrapper>
          </div>
        </section>

        {/* 7. Application Form */}
        <section id="apply" className="pb-32 max-w-[1200px] mx-auto scroll-mt-32 px-4">
          <FadeUp>
            <div className="relative w-full bg-white rounded-2xl md:rounded-3xl border border-ink/10 overflow-hidden text-left p-8 sm:p-12 md:p-16 font-sans shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
              
              <div className="mb-12 relative z-10">
                <span className="font-heading font-bold text-primary tracking-[0.15em] uppercase text-xs block mb-3">
                  {t('applyEyebrow')}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink uppercase tracking-tighter leading-tight max-w-2xl">
                  {t('applyTitle')}
                </h2>
              </div>

              {userStatus === 'affiliate_approved' ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
                    <Activity className="w-12 h-12 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold text-ink mb-4 tracking-tight">{t('approvedTitle')}</h3>
                  <p className="text-lg text-ink/60 max-w-md mx-auto leading-relaxed mb-10">
                    {t('approvedDesc')}
                  </p>
                  <Link href="/affiliates/dashboard">
                    <Button size="lg" className="h-14 px-10 rounded-lg bg-primary text-ink hover:bg-ink hover:text-white transition-all duration-300 font-bold tracking-wider uppercase text-sm border-none">
                      {t('approvedButton')}
                    </Button>
                  </Link>
                </div>
              ) : userStatus === 'affiliate_pending' || userStatus === 'pending_application' || submitted ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                    <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold text-ink mb-4 tracking-tight">{t('pendingTitle')}</h3>
                  <p className="text-lg text-ink/60 max-w-md mx-auto leading-relaxed mb-10">
                    {t('pendingDesc')}
                  </p>
                </div>
              ) : userStatus === 'affiliate_rejected' ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30">
                    <XCircle className="w-12 h-12 text-red-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold text-ink mb-4 tracking-tight">{t('rejectedTitle')}</h3>
                  <p className="text-lg text-ink/60 max-w-md mx-auto leading-relaxed mb-10">
                    {t('rejectedDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  
                  <div className="space-y-6">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm font-semibold">
                        {error}
                      </div>
                    )}
                    <h3 className="text-sm font-black text-ink tracking-widest uppercase border-b border-ink/10 pb-3">{t('basicInfoTitle')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('displayNameLabel')} <span className="text-primary">*</span></Label>
                        <Input id="displayName" name="displayName" required placeholder={t('displayNamePlaceholder')} className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink placeholder:text-ink/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('websiteUrlLabel')}</Label>
                        <Input id="websiteUrl" name="websiteUrl" type="text" placeholder="https://example.com" className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink placeholder:text-ink/30" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-ink tracking-widest uppercase border-b border-ink/10 pb-3 mt-8">{t('primaryPlatformTitle')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="platform" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('platformLabel')} <span className="text-primary">*</span></Label>
                        <Select defaultValue="youtube" required name="platform">
                          <SelectTrigger id="platform" className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink">
                            <SelectValue placeholder={t('platformPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg bg-white border-ink/10 text-ink shadow-xl">
                            <SelectItem value="youtube">{t('platformYoutube')}</SelectItem>
                            <SelectItem value="instagram">{t('platformInstagram')}</SelectItem>
                            <SelectItem value="tiktok">{t('platformTiktok')}</SelectItem>
                            <SelectItem value="twitter">{t('platformTwitter')}</SelectItem>
                            <SelectItem value="reddit">{t('platformReddit')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialUrl" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('profileUrlLabel')}</Label>
                        <Input id="socialUrl" name="socialUrl" type="text" placeholder="https://youtube.com/c/... or @yourhandle" className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink placeholder:text-ink/30" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-ink tracking-widest uppercase border-b border-ink/10 pb-3 mt-8">{t('audienceStrategyTitle')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="reach" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('reachLabel')} <span className="text-primary">*</span></Label>
                        <Select defaultValue="1k-10k" required name="reach">
                          <SelectTrigger id="reach" className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink">
                            <SelectValue placeholder={t('reachPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg bg-white border-ink/10 text-ink shadow-xl">
                            <SelectItem value="<1k">{t('reachLess1k')}</SelectItem>
                            <SelectItem value="1k-10k">{t('reach1k10k')}</SelectItem>
                            <SelectItem value="10k-100k">{t('reach10k100k')}</SelectItem>
                            <SelectItem value="100k+">{t('reach100kPlus')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="niche" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('nicheLabel')}</Label>
                        <Input id="niche" name="niche" placeholder={t('nichePlaceholder')} className="h-14 rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary px-4 text-ink placeholder:text-ink/30" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="methods" className="text-xs font-bold tracking-widest uppercase text-ink/70 ml-1">{t('methodsLabel')} <span className="text-primary">*</span></Label>
                      <Textarea
                        id="methods"
                        name="methods"
                        required
                        placeholder={t('methodsPlaceholder')}
                        className="min-h-[120px] rounded-lg bg-zinc-50 border border-ink/10 focus:ring-1 focus:ring-primary focus:border-primary p-4 text-ink placeholder:text-ink/30 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-ink/5">
                    <div className="flex flex-row items-start space-x-3 space-y-0 bg-zinc-50 p-5 rounded-lg border border-ink/5 w-full md:w-auto md:flex-1">
                      <Checkbox id="terms" name="terms" required className="mt-1 border-ink/30 data-[state=checked]:bg-primary data-[state=checked]:text-ink" />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="terms" className="text-sm font-semibold text-ink cursor-pointer">
                          {t('termsLabel')}
                        </Label>
                        <p className="text-xs text-ink/50 font-medium mt-2 leading-relaxed">
                          {t('termsDesc')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex justify-end shrink-0">
                      <FluidButton
                        onClick={() => document.getElementById('hidden-submit-btn')?.click()}
                        text={<>{isSubmitting ? t('submitting') : t('submitNow')}</>}
                        className={isSubmitting ? 'opacity-70 w-full md:w-auto' : 'w-full md:w-auto'}
                      />
                      <button type="submit" className="hidden" id="hidden-submit-btn"></button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </FadeUp>
        </section>

      </main>

      {/* 8. FAQ */}
      <div className="w-screen relative left-1/2 -ml-[50vw]">
        <SharedFaqSection
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
          faqs={FAQ_KEYS.map((key) => ({ question: t(`${key}Question`), answer: t(`${key}Answer`) }))}
        />
      </div>

      {/* 9. Final CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24 relative z-10">
        <div className="bg-primary rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-16 flex flex-col lg:flex-row gap-10 md:gap-12 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow/texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-60 pointer-events-none" />
          
          {/* Abstract background shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/30 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 blur-3xl rounded-full pointer-events-none" />

          <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center">
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink uppercase tracking-tighter mb-4 md:mb-6 leading-[1.1]">
               {t('finalCtaTitle')}
             </h2>
             <p className="text-ink/80 text-lg md:text-xl mb-6 md:mb-8 leading-relaxed font-semibold max-w-lg">
               {t('finalCtaDesc')}
             </p>
             <p className="text-ink/70 text-sm font-bold mb-8 md:mb-10 flex flex-col sm:flex-row gap-1 sm:gap-2">
               <span>{t('finalCtaQuestions')}</span> 
               <a href="mailto:support@helixbiochem.com" className="text-ink hover:text-white transition-colors font-black underline underline-offset-4">support@helixbiochem.com</a>
             </p>
             <div className="flex w-full md:w-auto mt-2">
               <FluidButton
                 variant="dark"
                 onClick={scrollToApply}
                 text={<>{t('finalCtaButton')}</>}
                 className="shadow-xl w-full whitespace-normal h-auto py-4 sm:py-0 sm:h-12 sm:whitespace-nowrap leading-tight text-center text-[11px] sm:text-sm px-4"
               />
             </div>
          </div>

          <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center mt-8 lg:mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {(['finalCtaBullet1', 'finalCtaBullet2', 'finalCtaBullet3', 'finalCtaBullet4', 'finalCtaBullet5', 'finalCtaBullet6'] as const).map((key, i) => (
                 <div key={i} className="flex items-start gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 hover:bg-white/40 transition-all duration-300 shadow-sm group">
                   <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                     <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                   </div>
                   <span className="text-ink font-bold text-sm leading-snug mt-1">{t(key)}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center max-w-4xl mx-auto px-4">
           <p className="text-ink/60 text-[10px] md:text-xs leading-relaxed mb-4 font-medium uppercase tracking-widest">
             <span className="text-red-600 font-bold">{t('footerResearchLabel')}</span> {t('footerResearchText')}
           </p>
           <p className="text-ink/40 text-xs font-semibold">
             {t('footerCopyright')}
           </p>
        </div>
      </section>

    </div>
  )
}
