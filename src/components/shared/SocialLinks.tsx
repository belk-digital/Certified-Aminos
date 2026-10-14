import React from 'react'
import { SOCIAL_LINKS } from '@/lib/socials'

const ICONS: Record<string, React.ReactNode> = {
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  Reddit: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm6.67 13.34c.05.25.08.5.08.76 0 3.1-3.6 5.62-8.05 5.62s-8.05-2.52-8.05-5.62c0-.26.03-.51.08-.76a1.7 1.7 0 1 1 1.87-2.73c1.2-.8 2.83-1.32 4.65-1.38l.87-4.1a.38.38 0 0 1 .45-.29l2.9.62a1.2 1.2 0 1 1-.14.7l-2.56-.54-.77 3.62c1.8.07 3.4.58 4.6 1.38a1.7 1.7 0 1 1 1.97 2.74zM8.3 13.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm7.4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm-.4 3.9a.3.3 0 0 0-.42 0c-.6.6-1.5.9-2.88.9s-2.28-.3-2.88-.9a.3.3 0 0 0-.42.42c.72.72 1.78 1.08 3.3 1.08s2.58-.36 3.3-1.08a.3.3 0 0 0 0-.42z" />
    </svg>
  ),
}

export function SocialLinks({ className = '', iconClassName = 'w-5 h-5' }: { className?: string; iconClassName?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SOCIAL_LINKS.map(({ platform, url }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={`Certified Aminos on ${platform}`}
          className="transition-colors hover:text-white"
        >
          <span className={`block ${iconClassName}`}>{ICONS[platform]}</span>
        </a>
      ))}
    </div>
  )
}
