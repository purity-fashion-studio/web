"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { trackBookingEvent } from "@/features/booking/analytics"

type BookingStartCtaProps = {
  href: string
  label: string
  serviceSlug: string
  variant?: "default" | "secondary"
}

function BookingStartCta({
  href,
  label,
  serviceSlug,
  variant = "default",
}: BookingStartCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant,
          size: "lg",
          className: "h-auto min-h-11 max-w-full whitespace-normal",
        })
      )}
      onClick={() => {
        trackBookingEvent({ event: "cta_click", serviceSlug })
        trackBookingEvent({ event: "booking_start", serviceSlug })
      }}
    >
      {label}
    </Link>
  )
}

export { BookingStartCta }
