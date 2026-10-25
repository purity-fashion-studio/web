import { formatOfferPrice, type OfferPriceLabels } from "@/content/commerce"
import type { ServiceOffer } from "@/content/public-api"
import {
  defaultOfferFormat,
  supportedOfferFormats,
} from "@/features/booking/offer-eligibility"
import type { Locale } from "@/i18n/routing"

import { ProductCartControls } from "./product-cart-controls"
import type { CartSelection } from "./selection"

export function ProductOfferSelection({
  locale,
  kind,
  slug,
  offer,
  priceLabels,
}: {
  locale: Locale
  kind: CartSelection["kind"]
  slug: string
  offer: ServiceOffer
  priceLabels: OfferPriceLabels
}) {
  return (
    <div
      className="grid min-w-0 gap-4 border-t border-border pt-5"
      data-testid="offer-selection"
      data-offer-id={offer.id}
    >
      <h3 className="font-medium break-words">
        {offer.title}: {formatOfferPrice(offer, locale, priceLabels)}
      </h3>
      <ProductCartControls
        locale={locale}
        allowedFormats={supportedOfferFormats(offer)}
        selection={{
          kind,
          slug,
          offerId: offer.id,
          format: defaultOfferFormat(offer),
          currency:
            offer.prices?.find((price) => price.currency === "EUR")?.currency ??
            offer.prices?.[0]?.currency ??
            "EUR",
        }}
      />
    </div>
  )
}
