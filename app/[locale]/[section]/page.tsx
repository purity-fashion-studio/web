import type { Metadata } from "next"
import { commerceLabel } from "@/content/commerce"
import { notFound } from "next/navigation"

import { ContentPage } from "@/components/content-page"
import { getLocalizedMetadata } from "@/content/metadata"
import {
  getDirectionBySlug,
  getPageBySlug,
  getServiceBySlug,
  getPublishedCourseCards,
  getPublishedDirections,
  getPublishedFashionCollectionCards,
  getPublishedServices,
} from "@/content/public-api"
import { coursePath, sectionPath, servicePath } from "@/content/routes"
import { hasLocale, localizePath, type Locale } from "@/i18n/routing"
import {
  toCategoryPagePresentation,
  toCategoryPresentation,
  toSpecialPagePresentation,
  toServiceCategoryPresentation,
  type CategoryPresentation,
  type CollectionCardView,
} from "./_types"
import {
  CollectionsPageView,
  LegalPageView,
  OfferCategoryPageView,
  StudioPageView,
} from "./section-page-views"

type SectionPageProps = {
  params: Promise<{ locale: string; section: string }>
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { locale: rawLocale, section } = await params

  if (!hasLocale(rawLocale)) {
    return {}
  }

  const [direction, publicPage] = await Promise.all([
    getDirectionBySlug(rawLocale, section),
    getPageBySlug(rawLocale, section),
  ])
  if (publicPage?.pageType === "service-state") return {}
  const entry = publicPage ?? direction

  if (!entry && section === "atelier") {
    const [service] = await getPublishedServices(rawLocale, {
      slugs: ["atelier-service"],
    })
    if (service) {
      return getLocalizedMetadata({
        locale: rawLocale,
        path: sectionPath(section),
        title: service.title,
        description: service.summary,
      })
    }
  }

  if (!entry) {
    return {}
  }

  return await getLocalizedMetadata({
    locale: rawLocale,
    path: sectionPath(entry.routeSegment),
    title: entry.seo.title,
    description: entry.seo.description,
    image: entry.seo.image,
  })
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { locale: rawLocale, section } = await params

  if (!hasLocale(rawLocale)) {
    notFound()
  }

  const locale: Locale = rawLocale
  const [directionData, publicPageData] = await Promise.all([
    getDirectionBySlug(locale, section),
    getPageBySlug(locale, section),
  ])
  if (publicPageData?.pageType === "service-state") notFound()
  const publicPage = publicPageData
    ? toSpecialPagePresentation(publicPageData)
    : undefined

  if (publicPage) {
    if (publicPage.slug === "studio") {
      const directions = await getPublishedDirections(locale)
      const corporateServices =
        directions.find((item) => item.canonicalKey === "corporate")
          ?.services ?? []
      const privateServices = directions
        .filter(
          (item) =>
            item.canonicalKey !== "corporate" &&
            item.canonicalKey !== "collections"
        )
        .flatMap((item) => item.services)
      return (
        <StudioPageView
          locale={locale}
          publicPage={publicPage}
          pageData={publicPageData!}
          privateServices={privateServices}
          corporateServices={corporateServices}
          directions={directions}
          mediaAsset={publicPageData?.mediaAsset}
        />
      )
    }

    if (publicPage.slug === "privacy" || publicPage.slug === "terms") {
      return (
        <LegalPageView
          locale={locale}
          publicPage={publicPage}
          pageData={publicPageData!}
        />
      )
    }

    return (
      <ContentPage
        locale={locale}
        currentPath={sectionPath(publicPage.routeSegment)}
        eyebrow={publicPage.eyebrow}
        title={publicPage.title}
        summary={publicPage.summary}
        items={publicPage.body}
        editorialBlocks={publicPageData?.editorialBlocks}
        mediaAsset={publicPageData?.mediaAsset}
        action={
          publicPage.cta
            ? {
                label: publicPage.cta.label,
                href: localizePath(locale, publicPage.cta.path),
              }
            : undefined
        }
      />
    )
  }

  if (publicPageData) {
    return (
      <ContentPage
        locale={locale}
        currentPath={sectionPath(publicPageData.routeSegment)}
        eyebrow={publicPageData.eyebrow ?? publicPageData.title}
        title={publicPageData.title}
        summary={publicPageData.summary}
        editorialBlocks={publicPageData.editorialBlocks}
        items={
          publicPageData.sections.length
            ? publicPageData.sections.map((item) => item.body)
            : publicPageData.body.split(/\n\n+/).filter(Boolean)
        }
        action={{
          label: publicPageData.cta.label,
          href: localizePath(
            locale,
            publicPageData.cta.action === "contact" ? "/contacts" : "/booking"
          ),
        }}
      />
    )
  }

  const atelierService =
    section === "atelier" && !directionData
      ? await getServiceBySlug(locale, "atelier-service")
      : null
  const atelierServices = atelierService ? [atelierService] : []
  const category: CategoryPresentation | undefined = directionData
    ? toCategoryPresentation(directionData)
    : section === "atelier" && atelierService
      ? {
          slug: "atelier",
          routeSegment: "atelier",
          title: atelierService.title,
          summary: atelierService.summary,
        }
      : undefined

  if (
    !category ||
    category.slug === "portfolio" ||
    category.slug === "contacts"
  ) {
    notFound()
  }

  const payloadCategoryServices = directionData
    ? directionData.services
    : category.slug === "atelier"
      ? atelierServices
      : undefined
  const [payloadCourses, payloadCollections] = await Promise.all([
    category.slug === "school" ? getPublishedCourseCards(locale) : [],
    category.slug === "collections"
      ? getPublishedFashionCollectionCards(locale)
      : [],
  ])
  const categoryMediaAsset =
    directionData?.mediaAsset ??
    payloadCategoryServices?.find((service) => service.mediaAsset)
      ?.mediaAsset ??
    payloadCourses.find((course) => course.mediaAsset)?.mediaAsset ??
    payloadCollections.find((collection) => collection.mediaAssets[0])
      ?.mediaAssets[0]
  const serviceEntries = (payloadCategoryServices ?? []).map((service) => ({
    href: localizePath(locale, servicePath(service.routeSegment)),
    title: service.title,
    summary: service.summary,
    status: directionData?.narrative ?? service.summary,
    priceNote:
      directionData?.outcomes.join(" · ") ??
      atelierService?.outcomes.join(" · ") ??
      "",
  }))
  const courseEntries = payloadCourses.map((course) => ({
    href: localizePath(locale, coursePath(course.routeSegment)),
    title: course.title,
    summary: course.summary,
    status: commerceLabel(locale, "status", course.commercialStatus),
    priceNote: course.priceNote,
  }))
  const collectionCards: CollectionCardView[] = payloadCollections.map(
    (collection) => ({
      routeSegment: collection.routeSegment,
      title: collection.title,
      summary: collection.summary,
      materials: collection.materials,
      commercialStatus: collection.commercialStatus,
      priceNote: collection.priceNote,
      mediaAsset: collection.mediaAssets[0],
    })
  )
  if (category.slug === "collections" && directionData) {
    return (
      <CollectionsPageView
        locale={locale}
        category={category}
        collections={collectionCards}
        direction={directionData}
      />
    )
  }

  if (
    category.slug === "research" ||
    category.slug === "realisation" ||
    category.slug === "atelier" ||
    category.slug === "transformation" ||
    category.slug === "corporate" ||
    category.slug === "school"
  ) {
    const copy = directionData
      ? toCategoryPagePresentation(directionData)
      : atelierService
        ? toServiceCategoryPresentation(atelierService)
        : null
    if (!copy) notFound()
    return (
      <OfferCategoryPageView
        locale={locale}
        category={category}
        entries={[...serviceEntries, ...courseEntries]}
        mediaAsset={categoryMediaAsset}
        copy={copy}
        ctaLabel={directionData?.ctaLabel ?? atelierService!.cta.label}
      />
    )
  }

  notFound()
}
