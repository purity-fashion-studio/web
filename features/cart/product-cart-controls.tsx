import { getSiteSettings } from "@/content/public-api"
import type { BookingFormat } from "@/features/booking/schema"
import type { Locale } from "@/i18n/routing"

import { AddToCart } from "./cart-controls"
import type { CartSelection } from "./selection"

export async function ProductCartControls({
  locale,
  selection,
  allowedFormats,
  bookingCTA,
}: {
  locale: Locale
  selection: CartSelection
  allowedFormats?: readonly BookingFormat[]
  bookingCTA?: { label: string; serviceSlug: string }
}) {
  const { booking } = await getSiteSettings(locale)
  return (
    <AddToCart
      locale={locale}
      selection={selection}
      allowedFormats={allowedFormats}
      bookingCTA={bookingCTA}
      formatLabels={booking.formats}
      formatLabel={booking.labels.format}
      currencyLabel={booking.labels.budgetCurrency}
    />
  )
}
