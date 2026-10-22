import Link from "next/link"

import { EditorialFaq, ImageFrame } from "@/components/purity"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { EditorialBlock } from "@/content/editorial"
import type { MediaAsset } from "@/content/media"
import { getInterfaceCopy } from "@/i18n/messages"
import { localizePath, type Locale } from "@/i18n/routing"

function EditorialImage({
  media,
  locale,
}: {
  media: MediaAsset
  locale: Locale
}) {
  return (
    <ImageFrame
      alt={media.alt[locale]}
      src={media.src}
      label={
        media.generated
          ? getInterfaceCopy(locale).System.generatedImage
          : undefined
      }
    />
  )
}

function BlockContent({
  block,
  locale,
}: {
  block: EditorialBlock
  locale: Locale
}) {
  switch (block.blockType) {
    case "richText":
      return (
        <p className="max-w-3xl leading-7 whitespace-pre-line">{block.body}</p>
      )
    case "mediaText":
      return (
        <div className="grid min-w-0 gap-8 md:grid-cols-2">
          <div
            className={block.mediaPosition === "end" ? "md:order-2" : undefined}
          >
            {block.media && (
              <EditorialImage media={block.media} locale={locale} />
            )}
          </div>
          <p className="min-w-0 leading-7 whitespace-pre-line">{block.body}</p>
        </div>
      )
    case "featureGrid":
    case "steps":
      return (
        <ol className="grid min-w-0 gap-4 md:grid-cols-2">
          {block.items.map((item, index) => (
            <li key={`${index}:${item.title}`}>
              <Card className="h-full">
                <CardHeader>
                  <h3 className="font-medium">
                    {block.blockType === "steps" ? `${index + 1}. ` : ""}
                    {item.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 whitespace-pre-line">{item.text}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )
    case "relationGrid":
      return (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {block.items.map((item) => (
            <Card key={item.path}>
              <CardHeader>
                <h3>
                  <Link
                    className="font-medium underline underline-offset-4"
                    href={localizePath(locale, item.path)}
                  >
                    {item.title}
                  </Link>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="leading-7">{item.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    case "gallery":
      return (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {block.media.map((media, index) => (
            <EditorialImage
              key={`${index}:${media.id}`}
              media={media}
              locale={locale}
            />
          ))}
        </div>
      )
    case "testimonials":
      return (
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          {block.items.map((item, index) => (
            <figure key={index} className="grid gap-4 border border-border p-6">
              <blockquote className="leading-7 whitespace-pre-line">
                {item.quote}
              </blockquote>
              <figcaption className="text-sm text-muted-foreground">
                {item.attribution}
                {item.role ? ` · ${item.role}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      )
    case "cta":
      return (
        <div className="grid justify-items-start gap-6">
          <p className="max-w-3xl leading-7 whitespace-pre-line">
            {block.body}
          </p>
          <Link
            href={localizePath(locale, block.path)}
            className={buttonVariants({
              size: "lg",
              className: "h-auto min-h-11 max-w-full whitespace-normal",
            })}
          >
            {block.label}
          </Link>
        </div>
      )
    case "faq":
      return null
  }
}

// Empty layouts render nothing. Supplementary sections never replace the
// route's fixed template or inject CMS-authored HTML, styles or scripts.
export function EditorialSections({
  blocks,
  locale,
}: {
  blocks?: EditorialBlock[]
  locale: Locale
}) {
  return blocks?.map((block, index) =>
    block.blockType === "faq" ? (
      <EditorialFaq
        key={index}
        title={block.heading}
        items={block.items.map((item) => [item.question, item.answer])}
      />
    ) : (
      <section
        key={index}
        data-testid="editorial-section"
        className="mx-auto grid w-full max-w-6xl min-w-0 gap-8 px-6 py-14 break-words md:px-10"
      >
        <h2 className="text-3xl leading-tight font-medium md:text-5xl">
          {block.heading}
        </h2>
        <BlockContent block={block} locale={locale} />
      </section>
    )
  )
}
