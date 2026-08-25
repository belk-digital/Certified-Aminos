'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FluidButtonProps {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  text: React.ReactNode;
  className?: string;
  variant?: "dark" | "cyan" | "white";
  ariaLabel?: string;
}

export function FluidButton({ href, target, rel, onClick, type = "button", disabled = false, text, className = "", variant = "dark", ariaLabel }: FluidButtonProps) {
  
  // Map FluidButton legacy variants to our new unified global Button variants
  let buttonVariant: "primary" | "secondary" | "dark" | "outline" | "ghost" | "link" = "primary";
  if (variant === "white") buttonVariant = "secondary";
  
  // If variant is cyan, we use primary as base and inject cyan utility classes
  const customClasses = variant === "cyan" ? "bg-[#008b8b] hover:bg-[#006666] text-white border-none shadow-sm" : "";

  if (href) {
    return (
      <Button asChild variant={buttonVariant} className={`${customClasses} ${className}`} disabled={disabled} onClick={onClick}>
        <Link href={href} target={target} rel={rel} aria-label={ariaLabel}>
          {text}
        </Link>
      </Button>
    );
  }

  return (
    <Button type={type} variant={buttonVariant} className={`${customClasses} ${className}`} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
      {text}
    </Button>
  );
}
