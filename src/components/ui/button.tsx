'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  'inline-flex items-center justify-center font-heading font-bold uppercase tracking-widest transition-all duration-300 ease-out rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:   'bg-[#121212] hover:bg-black text-white shadow-sm hover:shadow',
        secondary: 'bg-white hover:bg-gray-50 text-[#121212] border border-black/10 shadow-sm hover:shadow',
        ghost:     'bg-transparent text-[#121212] hover:bg-black/5',
        link:      'bg-transparent text-[#121212] underline underline-offset-4 hover:text-black px-0 py-0 h-auto',
        dark:      'bg-black text-white hover:bg-[#1a1a1a]',
        outline:   'bg-transparent text-[#121212] border border-black/10 hover:bg-black/5 hover:border-black/20',
      },
      size: {
        sm: 'text-[11px] xl:text-[12px] px-6 py-3 h-11',
        md: 'text-[12px] xl:text-[13px] min-[1650px]:text-[14px] px-8 py-4 min-[1650px]:px-10 min-[1650px]:py-5 h-12 min-[1650px]:h-14',
        lg: 'text-[14px] xl:text-[15px] px-12 py-6 h-16',
        icon: 'h-12 w-12',
        "icon-sm": 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

const Spinner = () => (
  <motion.svg
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    viewBox="0 0 24 24"
    width="20"
    height="20"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="60 100"
      strokeLinecap="round"
    />
  </motion.svg>
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, asChild, ...props }, ref) => {
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(buttonVariants({ variant, size, className }), (children.props as any).className),
        ref,
        ...props
      } as any)
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
