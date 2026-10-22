import Link from "next/link"
import type * as React from "react"

import { cn } from "@/lib/utils"

export function ShellLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}) {
  const linkClassName = cn(
    "inline-flex min-h-11 min-w-11 items-center transition-opacity hover:opacity-65 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    className
  )
  if (/^(?:https?:\/\/|mailto:|tel:|viber:)/i.test(href)) {
    const opensNewTab = /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={linkClassName}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={linkClassName}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
