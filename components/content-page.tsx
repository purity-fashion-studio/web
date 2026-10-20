import Link from "next/link"
import type * as React from "react"

import { EditorialHero } from "@/components/purity"
import { SiteFooter, SiteHeader } from "@/components/cms-site-shell"
import { buttonVariants } from "@/components/ui/button"
import type { MediaAsset } from "@/content/media"
import type { Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type ContentPageProps = {
  locale: Locale
  currentPath: string
  eyebrow: string
  title: string
  summary: string
  items?: string[]
  mediaAsset?: MediaAsset
  action?: {
    label: string
    href: string
  }
  children?: React.ReactNode
}

function ContentPage({
  locale,
  currentPath,
  eyebrow,
  title,
  summary,
  items,
  mediaAsset,
  action,
  children,
}: ContentPageProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader locale={locale} currentPath={currentPath} />

      <main>
        <EditorialHero
          locale={locale}
          eyebrow={eyebrow}
          title={title}
          summary={summary}
          mediaAsset={mediaAsset}
          composition="quiet"
        >
          {children && (
            <div className="max-w-2xl text-sm leading-7 text-background/75">
              {children}
            </div>
          )}
          {action && (
            <Link
              href={action.href}
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "w-fit max-w-full",
                })
              )}
            >
              {action.label}
            </Link>
          )}
        </EditorialHero>

        {items && (
          <section className="bg-muted px-6 py-16 md:px-10 md:py-24">
            <ol className="mx-auto grid max-w-screen-xl min-w-0 gap-x-12 md:grid-cols-2">
              {items.map((item, index) => (
                <li
                  key={item}
                  className="grid min-w-0 gap-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-8"
                >
                  <span className="text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="max-w-3xl text-lg leading-8 break-words sm:text-xl">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  )
}

export { ContentPage }
