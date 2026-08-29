'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { ShoppingBag, Menu, Search, X, User, Copy, Timer, ArrowRight } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import { useCartStore } from '@/lib/cart/store'
import { useUiStore } from '@/lib/ui/store'
import { useWishlistStore } from '@/lib/wishlist/store'
import dynamic from 'next/dynamic'
import { SearchOverlay } from './SearchOverlay'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { getCategoryDisplayName } from '@/lib/categoryDisplay'

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer').then(mod => mod.CartDrawer), { ssr: false })

const ANNOUNCEMENTS = [
  {
    key: "puritySale",
    couponCode: "PURITY20",
    expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
  },
  {
    key: "freeShipping",
    couponCode: null,
    expiresAt: null
  },
  {
    key: "newCustomerDiscount",
    couponCode: null,
    expiresAt: null
  },
  {
    key: "kitsDiscount",
    couponCode: null,
    expiresAt: null
  }
]

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      if (difference > 0) {
        return {
          h: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          m: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
          s: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
        }
      }
      return { h: '00', m: '00', s: '00' }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider">
      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white w-6 h-6 rounded shadow-sm">
          {timeLeft.h}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">HRS</span>
      </div>
      
      <span className="text-white/50 text-[10px] animate-pulse -mt-3">:</span>
      
      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white w-6 h-6 rounded shadow-sm">
          {timeLeft.m}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">MIN</span>
      </div>
      
      <span className="text-white/50 text-[10px] animate-pulse -mt-3">:</span>

      <div className="flex flex-col items-center gap-[2px]">
        <div className="flex items-center justify-center bg-white/30 backdrop-blur-md border border-white/50 text-white w-6 h-6 rounded shadow-sm font-black">
          {timeLeft.s}
        </div>
        <span className="text-[6px] text-white/90 font-sans tracking-widest uppercase">SEC</span>
      </div>
    </div>
  )
}

function CouponBox({ code }: { code: string }) {
  const t = useTranslations('header')

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    toast.success(t('couponCopiedTitle'), {
      description: t('couponCopiedDescription', { code }),
    })
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 border border-dashed border-white/60 hover:border-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-white shadow-sm"
      title={t('clickToCopy')}
    >
      {code}
      <Copy size={12} />
    </motion.button>
  )
}

export function ClientHeader({ cartItemCount = 0, wishlistItemCount = 0, isLoggedIn = false, categories: initialCategories = [], initialWishlistItems = [], initialCartItems = [] }: any) {
  const t = useTranslations('header')
  const cartStore = useCartStore()
  const setCartItems = useCartStore((state) => state.setItems)
  const setWishlistItems = useWishlistStore((state) => state.setItems)
  const activeCartCount = cartStore.items.reduce((acc: any, i: any) => acc + i.quantity, 0)
  const [blogSlugs, setBlogSlugs] = useState<string[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const setUiMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen)

  // Mirrors local open state into the shared UI store so sections elsewhere on the page
  // (e.g. the Hero's autoplaying video) can react to the mobile menu opening/closing.
  useEffect(() => {
    setUiMobileMenuOpen(mobileMenuOpen)
  }, [mobileMenuOpen, setUiMobileMenuOpen])
  const [hidden, setHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [showMobileTimer, setShowMobileTimer] = useState(false)
  const [announcementClosed, setAnnouncementClosed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const [categoriesData, setCategoriesData] = useState<any[]>(initialCategories)
  const [isLoadingMenu, setIsLoadingMenu] = useState(initialCategories.length === 0)
  
  const menuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setIsMegaMenuOpen(true)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false)
    }, 150)
  }

  useEffect(() => {
    if (initialCategories.length === 0) {
      import('@/app/(frontend)/actions/megaMenu').then(module => {
        module.getMegaMenuData().then(data => {
          setCategoriesData(data)
          setIsLoadingMenu(false)
        })
      })
    }
  }, [initialCategories])

  const cartHydrated = useRef(false)
  const wishlistHydrated = useRef(false)

  // Sync Cart with Backend
  useEffect(() => {
    if (isLoggedIn && !cartHydrated.current) {
      const localItems = cartStore.items
      if (initialCartItems.length > 0) {
        setCartItems(initialCartItems)
      } else if (localItems.length > 0) {
        import('@/app/(frontend)/actions/cart').then(m => m.syncCartToPayload(localItems))
      }
      cartHydrated.current = true
    }
  }, [isLoggedIn, initialCartItems])

  // Sync Wishlist with Backend
  useEffect(() => {
    if (isLoggedIn && !wishlistHydrated.current) {
      const localItems = useWishlistStore.getState().items
      if (initialWishlistItems.length > 0) {
        setWishlistItems(initialWishlistItems)
      } else if (localItems.length > 0) {
        import('@/app/(frontend)/actions/wishlist').then(m => {
          localItems.forEach(item => m.toggleWishlistInPayload(item.id, true))
        })
      }
      wishlistHydrated.current = true
    }
  }, [isLoggedIn, initialWishlistItems])

  // Global Search Shortcut & Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    const handleOpenSearch = () => setIsSearchOpen(true)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search-modal', handleOpenSearch)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search-modal', handleOpenSearch)
    }
  }, [])

  useEffect(() => {
    fetch('/api/blog-posts?where[status][equals]=published&limit=200&depth=0&select[slug]=true')
      .then((res) => res.json())
      .then((data) => setBlogSlugs((data?.docs || []).map((d: any) => d.slug).filter(Boolean)))
      .catch(() => {})
  }, [])

  const pathname = usePathname()
  const isBlogPost = blogSlugs.some(slug => pathname === `/${slug}`)
  const isTransparentHeader = pathname === '/' || pathname === '/en' || pathname === '/shop' || pathname === '/about-us' || pathname === '/faq' || pathname === '/contact-us' || pathname === '/affiliates' || pathname === '/blog' || isBlogPost

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Reset announcement state on route change
    setAnnouncementClosed(false)
    document.body.classList.remove('announcement-closed')
    
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      if (tick % 2 !== 0) {
        setShowMobileTimer(true)
      } else {
        setShowMobileTimer(false)
        setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
      }
    }, 4000)
    
    return () => clearInterval(timer)
  }, [pathname])

  const closeAnnouncement = () => {
    setAnnouncementClosed(true)
    document.body.classList.add('announcement-closed')
  }
  
  const { scrollY } = useScroll()
  const lastYRef = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsScrolled(y > 20)
    const difference = y - lastYRef.current
    
    // Lower threshold so it reacts instantly to a single scroll wheel tick
    if (Math.abs(difference) > 5) {
      // Hide immediately when scrolling down, as long as we aren't at the very top
      if (difference > 0 && y > 60) {
        setHidden(true)
      } 
      // Show immediately when scrolling up
      else if (difference < 0) {
        setHidden(false)
      }
      lastYRef.current = y
    }
  })

  // Before the user scrolls, the header floats transparent over every page's hero.
  // Once scrolled, it becomes a solid white bar.
  // On the homepage/FAQ the hero is dark, so text/icons go white while transparent.
  // When scrolled, it's always light theme (white bg).
  const isHomeTransparent = (pathname === '/' || pathname === '/en' || pathname === '/faq') && !isScrolled
  const isTransparentBackground = !isScrolled
  const isDarkTheme = isHomeTransparent
  const textColor = isDarkTheme ? 'text-white' : 'text-black'
  const textHoverColor = 'hover:text-primary transition-colors'
  const iconColor = isDarkTheme ? '#ffffff' : '#000000'
  const buttonBorder = isDarkTheme ? 'border-white/20 hover:bg-white/10' : 'border-black/20 hover:bg-black/10'
  const iconHoverBg = isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-black/5'

  const headerContent = (
    <div className={`flex items-center justify-between transition-all duration-300 px-6 md:px-12 w-full ${textColor} py-4 md:py-5`}>
      {/* Left: Logo */}
      <div className="flex-1 xl:flex-none flex justify-start">
        <a
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity gap-2"
        >
          <Image 
            src="/logo.png" 
            alt="Certified Aminos Logo" 
            width={180} 
            height={40} 
            className={`transition-all duration-300 w-[45px] sm:w-[70px] h-auto object-contain ${isDarkTheme ? 'brightness-0 invert' : ''}`}
            priority
          />
        </a>
      </div>

      {/* Center: Nav */}
      <nav className="hidden xl:flex items-center justify-center gap-5 xl:gap-7 min-[1650px]:gap-10 flex-1 h-full min-w-0">
        {(() => {
          const hoverTextColor = isDarkTheme ? 'hover:text-white' : 'hover:text-black'
          const underlineColor = isDarkTheme ? 'after:bg-white/40' : 'after:bg-black/20'
          const activeColor = isDarkTheme ? 'text-white' : 'text-navy-deep'
          const activeDotColor = isDarkTheme ? 'after:bg-white' : 'after:bg-navy-deep'
          const getNavLinkClass = (path: string) => {
            const targetPath = path.replace('/en', '');
            const isActive = targetPath === '' ? pathname === '/en' || pathname === '/' : pathname.includes(targetPath);
            return `relative text-[11px] xl:text-[12px] min-[1650px]:text-[13px] font-syncopate font-semibold tracking-[0.05em] min-[1650px]:tracking-[0.1em] uppercase transition-all duration-300 h-full flex items-center py-2 whitespace-nowrap ${
              isActive
                ? `${activeColor} opacity-100 after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] ${activeDotColor} after:rounded-full`
                : `${textColor} opacity-60 hover:opacity-100 ${hoverTextColor} hover:after:w-full after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] ${underlineColor} after:transition-all after:duration-300 after:rounded-full`
            }`;
          };

          return (
            <>
              <Link href="/shop" className={getNavLinkClass('/shop')}>
                {t('navShop')}
              </Link>

              <div
                className="h-full flex items-center cursor-pointer"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <Link href="/shop" onClick={() => setIsMegaMenuOpen(false)} className={`group relative flex items-center gap-1.5 text-[11px] xl:text-[12px] min-[1650px]:text-[13px] font-syncopate font-semibold tracking-[0.05em] min-[1650px]:tracking-[0.1em] uppercase transition-all duration-300 h-full py-2 whitespace-nowrap ${textColor} opacity-60 hover:opacity-100 ${hoverTextColor} hover:after:w-full after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] ${underlineColor} after:transition-all after:duration-300 after:rounded-full`}>
                  {t('navCategories')}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
                </Link>
              </div>

              <Link href="/peptide-calculator" className={getNavLinkClass('/peptide-calculator')}>
                {t('navCalculator')}
              </Link>
              <Link href="/about-us" className={getNavLinkClass('/about-us')}>
                {t('navAbout')}
              </Link>
              <Link href="/blog" className={getNavLinkClass('/blog')}>
                {t('navBlog')}
              </Link>
              <Link href="/faq" className={getNavLinkClass('/faq')}>
                {t('navFaq')}
              </Link>
              <Link href="/contact-us" className={getNavLinkClass('/contact-us')}>
                {t('navContact')}
              </Link>
              <Link href="/affiliates" className={getNavLinkClass('/affiliates')}>
                {t('navAffiliates')}
              </Link>
            </>
          )
        })()}
      </nav>

      {/* Right: Search, SHOP NOW Button & Cart */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 xl:gap-3 flex-none shrink-0 text-sm relative z-20">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 rounded-full transition-all duration-300 relative flex items-center justify-center ${textColor} ${iconHoverBg} hover:scale-105`}
          aria-label={t('openSearch')}
        >
          <Search size={18} strokeWidth={2} />
        </button>

        <button onClick={cartStore.openCart} className={`p-2 rounded-full transition-all duration-300 relative flex items-center justify-center ${textColor} ${iconHoverBg} hover:scale-105`} aria-label={t('openCart')}>
          <ShoppingBag size={18} strokeWidth={2} />
          <AnimatePresence>
            {activeCartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute top-0 right-0 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full bg-[#121212] text-white shadow-sm`}
              >
                {activeCartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        


        <div className="flex items-center justify-center ml-1">
          {mounted ? (
            isLoggedIn ? (
              <Link href="/account" className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${textColor} ${iconHoverBg} hover:scale-105`} title="Account">
                <User size={18} strokeWidth={2} />
              </Link>
            ) : (
              <>
                <Link href="/login" className={`sm:hidden p-2 rounded-full transition-all duration-300 flex items-center justify-center ${textColor} ${iconHoverBg} hover:scale-105`} title="Login">
                  <User size={18} strokeWidth={2} />
                </Link>
                <Link href="/login" className={`hidden sm:flex transition-all duration-300 items-center justify-center ${textColor} hover:opacity-70 px-4 py-2 text-[9px] xl:text-[10px] min-[1650px]:text-[11px] font-heading font-bold uppercase tracking-widest whitespace-nowrap`}>
                  Login
                </Link>
              </>
            )
          ) : null}
        </div>
        <Link href="/shop" className={`hidden md:inline-flex ${isDarkTheme ? 'bg-white hover:bg-white/90 text-black' : 'bg-[#121212] hover:bg-black text-white'} rounded-[10px] px-6 py-3 min-[1650px]:px-8 min-[1650px]:py-4 text-[11px] xl:text-[12px] min-[1650px]:text-[13px] font-heading font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ml-2`}>
          {t('shopNow')}
        </Link>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileMenuOpen(true)} className={`xl:hidden p-1 -mr-1 transition-colors ${textColor} hover:text-primary`} aria-label={t('openMenu')}>
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {!pathname.includes('/account') && (
        <>
          <div className="fixed top-0 inset-x-0 z-sticky flex flex-col pointer-events-none print:hidden">
        
        <motion.div
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 }
          }}
          initial="hidden"
          animate={hidden ? "hidden" : "visible"}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full flex flex-col"
        >
          {/* Announcement Bar */}
          <AnimatePresence>
            {!announcementClosed && (
              <motion.div 
                initial={{ height: 44, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-black text-white flex items-center justify-center pointer-events-auto overflow-hidden relative z-50"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={announcementIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute w-full px-4 md:px-12 h-full flex items-center justify-center"
                  >
                    {/* Desktop & Tablet Layout */}
                    <div className="hidden sm:flex flex-row items-center justify-center gap-4 lg:gap-6 w-full">
                      <span className="text-[10px] lg:text-[11px] font-heading font-extrabold tracking-[0.2em] uppercase text-center shrink-0 mt-[2px] drop-shadow-sm">
                        {t(`announcements.${ANNOUNCEMENTS[announcementIndex].key}`)}
                      </span>
                      {ANNOUNCEMENTS[announcementIndex].couponCode && ANNOUNCEMENTS[announcementIndex].expiresAt && (
                        <div className="flex items-center gap-3 shrink-0">
                          <CountdownTimer expiresAt={ANNOUNCEMENTS[announcementIndex].expiresAt} />
                          <CouponBox code={ANNOUNCEMENTS[announcementIndex].couponCode} />
                        </div>
                      )}
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex sm:hidden flex-row items-center justify-center w-full h-full relative">
                      <AnimatePresence mode="wait">
                        {(!ANNOUNCEMENTS[announcementIndex].couponCode || !showMobileTimer) ? (
                          <motion.span
                            key={`text-${announcementIndex}`}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[9px] font-heading font-extrabold tracking-[0.1em] uppercase text-center mt-[1px] absolute w-full px-6 leading-snug drop-shadow-sm"
                          >
                            {t(`announcements.${ANNOUNCEMENTS[announcementIndex].key}`)}
                          </motion.span>
                        ) : (
                          <motion.div
                            key={`timer-${announcementIndex}`}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center gap-2 scale-90 absolute w-full"
                          >
                            <CountdownTimer expiresAt={ANNOUNCEMENTS[announcementIndex].expiresAt} />
                            <CouponBox code={ANNOUNCEMENTS[announcementIndex].couponCode} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <button 
                  onClick={closeAnnouncement}
                  className="absolute right-2 md:right-4 text-white/80 hover:text-white transition-colors z-50 p-2 md:p-0 bg-black/10 hover:bg-black/20 rounded-full md:bg-transparent md:hover:bg-transparent"
                  aria-label={t('closeAnnouncement')}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`w-full relative pointer-events-auto transition-all duration-500 z-50 ${isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : ''}`}
            style={{
              background: isTransparentBackground
                ? 'transparent'
                : isScrolled
                  ? '#ffffff'
                  : 'linear-gradient(180deg, #ffffff 0%, #e2effa 45%, #cbe0f3 100%)',
              transition: 'background 0.5s ease',
            }}
          >
            <div className="w-full mx-auto">
              {headerContent}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Render the Mega Menu OUTSIDE the motion.div wrapper so backdrop-filter is NOT broken by the stacking context! */}
      <div 
        className="hidden lg:block fixed inset-x-0 z-[45] transition-transform duration-300 ease-out"
        style={{ 
          position: isScrolled || (announcementClosed && !isScrolled) ? 'fixed' : 'absolute',
          top: announcementClosed ? '53px' : '97px',
          transform: hidden ? 'translateY(-100px)' : 'translateY(0)'
        }}
      >
        {/* Background Blur Overlay for Mega Menu */}
        <div 
          className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${isMegaMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onMouseEnter={handleMenuLeave}
        />

        {/* Mega Menu Dropdown — compact floating card, centered under the nav */}
        <div
          className={`absolute left-0 right-0 top-0 w-full z-50 px-4 sm:px-6 lg:px-10 pt-3 transition-all duration-300 ${isMegaMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div
            className={`max-w-4xl mx-auto w-full max-h-[85vh] overflow-hidden no-scrollbar bg-white rounded-2xl border border-black/5 shadow-2xl transition-all duration-300 ${isMegaMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >

          <div className="w-full flex flex-col relative z-10 text-black p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-5 relative z-20 shrink-0">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">{t('megaMenu.navigation')}</span>
              <Link
                href="/shop"
                onClick={() => setIsMegaMenuOpen(false)}
                className="inline-flex items-center gap-1.5 text-black/50 hover:text-black transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {/* Visual Grid */}
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3">
              {isLoadingMenu ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[4/3] bg-black/5 rounded-xl animate-pulse" />
                ))
              ) : categoriesData.map((cat: any, index: number) => (
                <div key={`cat-${cat.id ?? cat.name ?? index}`} className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-navy-deep border border-black/5 flex flex-col justify-end shadow-sm">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={`/HelixBio Images/category-${(index % 8) + 1}.webp`}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-500" />
                  </div>

                  {/* Index badge */}
                  <span className="absolute top-3 left-3 z-20 font-inter text-[10px] font-light text-white/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Content */}
                  <div className="relative z-20 p-3 w-full flex flex-col justify-end h-full">
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="w-full block"
                    >
                      <h3 className="text-sm font-medium text-white tracking-tight group-hover:translate-x-1 transition-transform duration-500 truncate">
                        {getCategoryDisplayName(cat.name)}
                      </h3>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
        </>
      )}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        onSearchClick={() => setIsSearchOpen(true)}
        categories={categoriesData}
      />
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} categories={categoriesData} />
    </>
  )
}
