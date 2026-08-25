'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Loader2 } from 'lucide-react'

// Add Tidio Types to global Window
declare global {
  interface Window {
    tidioChatApi?: {
      show: () => void;
      hide: () => void;
      open: () => void;
      close: () => void;
      on: (event: string, callback: () => void) => void;
      display: (show: boolean) => void;
    }
  }
}

const INTERACTION_EVENTS = ['scroll', 'mousemove', 'touchstart', 'keydown'] as const
const FALLBACK_DELAY_MS = 10000

export function TidioWidget({ publicKey }: { publicKey: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  // Force load Tidio manually if clicked before interaction events fire
  const manualLoadTidio = useCallback(() => {
    if (document.getElementById('tidio-script')) return;
    
    setIsLoadingChat(true)
    const script = document.createElement('script')
    script.id = 'tidio-script'
    script.src = `//code.tidio.co/${publicKey}.js`
    script.async = true
    document.body.appendChild(script)
  }, [publicKey])

  useEffect(() => {
    let scriptLoaded = false

    const loadTidio = () => {
      if (scriptLoaded || document.getElementById('tidio-script')) return
      scriptLoaded = true
      cleanup()

      const script = document.createElement('script')
      script.id = 'tidio-script'
      script.src = `//code.tidio.co/${publicKey}.js`
      script.async = true
      document.body.appendChild(script)
    }

    const cleanup = () => {
      INTERACTION_EVENTS.forEach((event) => window.removeEventListener(event, loadTidio))
      clearTimeout(fallbackTimer)
    }

    // Wait for interaction to load script (saves lighthouse score)
    INTERACTION_EVENTS.forEach((event) => window.addEventListener(event, loadTidio, { passive: true, once: true }))
    const fallbackTimer = setTimeout(loadTidio, FALLBACK_DELAY_MS)

    // Poll for the Tidio API to become available after script injects
    const checkTidioApi = setInterval(() => {
      if (window.tidioChatApi) {
        clearInterval(checkTidioApi)
        
        // CSS to ghost the entire Tidio container during transitions
        const style = document.createElement('style')
        style.id = 'tidio-custom-style'
        style.innerHTML = `
          #tidio-chat { 
            opacity: 0 !important; 
            pointer-events: none !important;
            transition: opacity 0.2s ease-in-out !important;
          }
          #tidio-chat.custom-tidio-open {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `
        document.head.appendChild(style)

        window.tidioChatApi.on("ready", () => {
          // Permanently hide the default launcher
          window.tidioChatApi?.hide()
          setIsLoaded(true)
          
          // If the user clicked to load it, open it immediately
          setIsLoadingChat((wasLoading) => {
            if (wasLoading) {
              window.tidioChatApi?.show()
              window.tidioChatApi?.open()
            }
            return false
          })
        })

        // Track when the user opens/closes the chat via the API
        window.tidioChatApi.on("open", () => {
          setIsOpen(true)
          // Wait for Tidio's internal expand animation to finish, then fade in the entire container
          setTimeout(() => {
            document.getElementById('tidio-chat')?.classList.add('custom-tidio-open')
          }, 250)
        })
        
        window.tidioChatApi.on("close", () => {
          setIsOpen(false)
          // Immediately hide the container so we don't see it shrink back into the blue circle
          document.getElementById('tidio-chat')?.classList.remove('custom-tidio-open')
          
          // Then tell Tidio API to hide the launcher completely
          setTimeout(() => {
            window.tidioChatApi?.hide()
          }, 300)
        })
      }
    }, 500)

    return () => {
      cleanup()
      clearInterval(checkTidioApi)
      document.getElementById('tidio-custom-style')?.remove()
    }
  }, [publicKey])

  const toggleChat = () => {
    if (!isLoaded || !window.tidioChatApi) {
      manualLoadTidio()
      return
    }

    if (isOpen) {
      document.getElementById('tidio-chat')?.classList.remove('custom-tidio-open')
      setTimeout(() => {
        window.tidioChatApi?.close()
      }, 50)
    } else {
      // Must call show() before open() for the API to work, but it's hidden by our CSS wrapper
      window.tidioChatApi.show()
      window.tidioChatApi.open()
    }
  }

  // Hide our custom button if the actual chat window is open
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          id="custom-tidio-button"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-[99999] flex items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-xl border border-[#92DCE5]/30 rounded-full shadow-[0_8px_32px_rgba(146,220,229,0.25)] text-[#92DCE5] hover:bg-[#92DCE5] hover:text-white hover:border-[#92DCE5] transition-all duration-300 group"
          aria-label="Open support chat"
        >
          {/* Subtle Pulse Effect */}
          <div className="absolute inset-0 rounded-full border border-[#92DCE5]/50 animate-ping opacity-20 group-hover:opacity-0" />
          
          {isLoadingChat ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
