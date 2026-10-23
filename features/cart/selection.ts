import { z } from "zod/v4"

import { formats, paymentCurrencies } from "@/features/booking/schema"

export const cartSelectionSchema = z.object({
  kind: z.enum(["service", "course", "collection"]),
  slug: z
    .string()
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  offerId: z
    .string()
    .max(160)
    .regex(/^[a-zA-Z0-9-]+$/)
    .optional(),
  format: z.enum(formats),
  currency: z.enum(paymentCurrencies),
})
export const cartSchema = z.array(cartSelectionSchema).max(20)
export type CartSelection = z.infer<typeof cartSelectionSchema>

export function cartSelectionKey(selection: CartSelection) {
  return [
    selection.kind,
    selection.slug,
    selection.offerId ?? "",
    selection.format,
    selection.currency,
  ].join(":")
}

export function parseStoredCart(stored: string | null): CartSelection[] {
  if (!stored || stored.length > 50_000) return []
  try {
    const parsed = cartSchema.safeParse(JSON.parse(stored))
    return parsed.success
      ? [
          ...new Map(
            parsed.data.map((item) => [cartSelectionKey(item), item])
          ).values(),
        ]
      : []
  } catch {
    return []
  }
}

export function addSelection(
  cart: CartSelection[],
  selection: CartSelection
): CartSelection[] {
  const item = cartSelectionSchema.parse(selection)
  const result = [
    ...cart.filter(
      (existing) => cartSelectionKey(existing) !== cartSelectionKey(item)
    ),
    item,
  ]
  return cartSchema.parse(result)
}
