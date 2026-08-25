import React from 'react'
import Image from 'next/image'
import { Mail } from 'lucide-react'

const PUBLISHER_EMAIL = 'support@helixbiochem.com'

export function AuthorCard({
  name,
  title,
  bio,
  credentials,
  photoUrl,
}: {
  name: string
  title?: string
  bio?: string
  credentials?: string
  photoUrl?: string
}) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-ink/10 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row gap-6 items-start">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-ink/5 shrink-0">
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading font-black text-xl">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <span className="text-label-md uppercase tracking-wider text-gold-dark mb-1 block">
          Published by
        </span>
        <h4 className="font-heading font-bold text-lg text-ink mb-1">{name}</h4>
        {title && <p className="text-sm text-ink-muted font-medium mb-2">{title}</p>}
        {bio && <p className="text-sm text-ink-muted leading-relaxed mb-3">{bio}</p>}
        {credentials && (
          <p className="text-xs text-ink/40 font-bold uppercase tracking-wider mb-3">{credentials}</p>
        )}
        <a
          href={`mailto:${PUBLISHER_EMAIL}`}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-medium transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          {PUBLISHER_EMAIL}
        </a>
      </div>
    </div>
  )
}
