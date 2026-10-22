import { getSiteSettings } from "@/content/public-api"
import type { Locale } from "@/i18n/routing"

import { AddToCart } from "./cart-controls"
import type { CartSelection } from "./selection"

export async function ProductCartControls({
  locale,
  selection,
}: {
  locale: Locale
  selection: CartSelection
}) {
  const { booking } = await getSiteSettings(locale)
  return (
    <AddToCart
      locale={locale}
      selection={selection}
      formatLabels={booking.formats}
      formatLabel={booking.labels.format}
      currencyLabel={booking.labels.budgetCurrency}
    />
  )
}
