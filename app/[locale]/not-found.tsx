import Link from "next/link"
import { getLocale } from "next-intl/server"

import { buttonVariants } from "@/components/ui/button"
import { getInterfaceCopy } from "@/i18n/messages"
import { hasLocale, localizePath } from "@/i18n/routing"

export default async function LocaleNotFound() {
  const segment = await getLocale()
  const locale = segment && hasLocale(segment) ? segment : "en"
  const copy = getInterfaceCopy(locale).NotFound
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-svh w-full max-w-screen-2xl items-center px-6 py-24 md:px-10"
      data-testid="not-found"
    >
      <div className="grid max-w-xl gap-4">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="font-heading text-4xl leading-tight">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.description}</p>
        <Link
          href={localizePath(locale, "/")}
          className={buttonVariants({ className: "w-fit" })}
        >
          {copy.home}
        </Link>
      </div>
    </main>
  )
}
