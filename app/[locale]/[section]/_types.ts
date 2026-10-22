import type { MediaAsset } from "@/content/media"
import type { EditorialBlock } from "@/content/editorial"
import type { DirectionPageData, PublicPageData } from "@/content/public-api"

export type PublicPagePresentation = {
  slug: string
  routeSegment: string
  title: string
  eyebrow: string
  summary: string
  body: string[]
  cta?: { label: string; path: string }
}

export type CategoryPresentation = {
  slug: string
  routeSegment: string
  title: string
  summary: string
}

export type CategoryPagePresentation = {
  editorialBlocks?: EditorialBlock[]
  ctaService: string
  heroNote: string
  processTitle: string
  processSteps: Array<{ title: string; text: string }>
  formatsTitle: string
  formats: string[]
  outcomesTitle: string
  outcomes: string[]
  ctaTitle: string
  ctaSummary: string
  diagnosticLabel?: string
  faqTitle?: string
  faq?: Array<{ question: string; answer: string }>
}

export type CollectionCardView = {
  routeSegment: string
  title: string
  summary: string
  materials: string[]
  commercialStatus: string
  priceNote: string
  mediaAsset?: MediaAsset
}

export function toCategoryPagePresentation(
  direction: DirectionPageData
): CategoryPagePresentation {
  return {
    ctaService: direction.ctaService,
    editorialBlocks: direction.editorialBlocks,
    heroNote: direction.narrative,
    processTitle: direction.processTitle,
    processSteps: direction.process.map((step) => ({
      title: step.title,
      text: step.description,
    })),
    formatsTitle: direction.formatsTitle,
    formats: direction.formatNotes,
    outcomesTitle: direction.outcomesTitle,
    outcomes: direction.outcomes,
    ctaTitle: direction.ctaTitle,
    ctaSummary: direction.ctaSummary,
    diagnosticLabel: direction.diagnosticLabel,
    faqTitle: direction.faqTitle,
    faq: direction.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  }
}

export function toSpecialPagePresentation(
  page: PublicPageData
): PublicPagePresentation | undefined {
  if (!["studio", "privacy", "terms"].includes(page.pageType)) {
    return undefined
  }

  const body = page.sections.length
    ? page.sections.map((section) => section.body)
    : page.body.split(/\n\n+/).filter(Boolean)
  return {
    slug: page.slug,
    routeSegment: page.routeSegment,
    title: page.title,
    eyebrow: page.eyebrow ?? page.title,
    summary: page.summary,
    body,
    cta: {
      label: page.cta.label,
      path: page.cta.action === "contact" ? "/contacts" : "/booking",
    },
  }
}

export function toCategoryPresentation(
  direction: DirectionPageData
): CategoryPresentation {
  return {
    slug: direction.canonicalKey,
    routeSegment: direction.routeSegment,
    title: direction.title,
    summary: direction.summary,
  }
}
