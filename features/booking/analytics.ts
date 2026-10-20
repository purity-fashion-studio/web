type BookingEvent =
  "cta_click" | "booking_start" | "booking_submit" | "checkout_start"

type BookingEventPayload = {
  event: BookingEvent
  serviceSlug?: string
  provider?: string
  currency?: string
}

export function trackBookingEvent(payload: BookingEventPayload) {
  if (typeof window === "undefined") return

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") {
    window.dataLayer ??= []
    window.dataLayer.push({
      event:
        payload.event === "booking_start" ? "begin_booking" : payload.event,
      service_slug: payload.serviceSlug,
      provider: payload.provider,
      currency: payload.currency,
    })
  } else if (process.env.NODE_ENV !== "production") {
    console.info("[purity analytics]", payload)
  }
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}
