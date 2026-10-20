import type { Locale } from "../i18n/routing"

/**
 * Public representation of a Media document read from Payload.
 *
 * This is intentionally a view type, rather than an authoring contract: the
 * source of every value is the Payload Media collection at runtime.
 */
export type MediaAsset = {
  id: string
  kind: "logo" | "image"
  source: "client" | "generated" | "licensed" | "editorial"
  generated: boolean
  fileName: string
  aspectRatio: string
  src?: string
  heroFocalPoint?: "left" | "center" | "right"
  usage: string[]
  internalLabel: Record<Locale, string>
  alt: Record<Locale, string>
  replacementPriority:
    | "keep-client-source"
    | "replace-before-launch"
    | "replace-when-client-proof-arrives"
  isRealClientProof: boolean
}
