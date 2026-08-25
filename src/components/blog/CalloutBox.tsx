import React from 'react'
import { Info, Lightbulb, AlertTriangle } from 'lucide-react'

const STYLES = {
  info: { icon: Info, bg: 'bg-info-bg', text: 'text-info' },
  tip: { icon: Lightbulb, bg: 'bg-success-bg', text: 'text-success' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-bg', text: 'text-warning' },
} as const

export function CalloutBox({
  style = 'info',
  text,
}: {
  style?: keyof typeof STYLES
  text: string
}) {
  const { icon: Icon, bg, text: textColor } = STYLES[style] || STYLES.info

  return (
    <div className={`rounded-[1.25rem] p-6 sm:p-7 flex items-start gap-3.5 ${bg}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${textColor}`} />
      <p className="text-sm sm:text-base text-ink-soft leading-relaxed">{text}</p>
    </div>
  )
}
