import type { ServiceOffer } from "./public-api"
import type { Locale } from "../i18n/routing"

const numberLocales: Record<Locale, string> = {
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-IE",
}

export type OfferPriceLabels = {
  from: string
  custom: string
}

export function formatOfferPrice(
  offer: ServiceOffer,
  locale: Locale,
  labels: OfferPriceLabels
) {
  if (offer.pricingMode === "custom") {
    return labels.custom
  }

  const formatAmount = (amount: number, currency: "EUR" | "UAH") =>
    new Intl.NumberFormat(numberLocales[locale], {
      style: "currency",
      currency,
    }).format(amount / 100)

  return (
    offer.prices
      ?.map((price) => {
        if (offer.pricingMode === "fixed" && price.amount != null) {
          return formatAmount(price.amount, price.currency)
        }
        if (offer.pricingMode === "from" && price.minAmount != null) {
          return `${labels.from} ${formatAmount(price.minAmount, price.currency)}`
        }
        if (
          offer.pricingMode === "range" &&
          price.minAmount != null &&
          price.maxAmount != null
        ) {
          return `${formatAmount(price.minAmount, price.currency)}–${formatAmount(price.maxAmount, price.currency)}`
        }
        return labels.custom
      })
      .join(" · ") || labels.custom
  )
}
