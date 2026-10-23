import { hasLocale } from "@/i18n/routing"

import { bookingSchema } from "./schema"

export function readSubmissionSnapshot(value: unknown) {
  if (!value || typeof value !== "object" || !("locale" in value))
    return undefined
  const parsed = bookingSchema.safeParse(value)
  if (
    !parsed.success ||
    typeof value.locale !== "string" ||
    !hasLocale(value.locale)
  )
    return undefined
  return {
    ...parsed.data,
    locale: value.locale,
    intent:
      parsed.data.intent ??
      ("offerId" in value && value.offerId ? "checkout" : "request"),
    offerId:
      "offerId" in value && typeof value.offerId === "string"
        ? value.offerId
        : undefined,
  }
}
