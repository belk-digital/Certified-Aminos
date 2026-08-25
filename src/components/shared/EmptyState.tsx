import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 sm:px-6 w-full max-w-2xl mx-auto font-sans relative overflow-hidden group">
      
      {/* Icon Container */}
      <div className="relative mb-8 z-10 transition-transform duration-700 group-hover:scale-105">
        <div className="relative bg-white border border-ink/5 shadow-md rounded-full p-4 sm:p-5 z-20">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="font-heading text-2xl sm:text-3xl font-black text-ink uppercase tracking-tighter mb-3 z-10">
        {title}
      </h3>
      
      {description && (
        <p className="text-ink/60 text-sm sm:text-base font-light leading-relaxed max-w-sm mx-auto mb-8 z-10">
          {description}
        </p>
      )}
      
      {action && (
        <div className="relative z-20 pointer-events-auto">
          {action}
        </div>
      )}
    </div>
  )
}
