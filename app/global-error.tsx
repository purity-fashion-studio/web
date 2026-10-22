"use client"

import { usePathname } from "next/navigation"

import "./globals.css"
import { Button } from "@/components/ui/button"
import { getInterfaceCopy } from "@/i18n/messages"
import { hasLocale } from "@/i18n/routing"

export default function GlobalError({ retry }: { retry: () => void }) {
  const pathname = usePathname() ?? "/en"
  const candidate = pathname.split("/")[1]
  const locale = hasLocale(candidate) ? candidate : "en"
  const copy = getInterfaceCopy(locale).System
  return (
    <html lang={locale}>
      <head>
        <title>PURITY Fashion Studio</title>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body className="bg-background text-foreground">
        <main
          id="main-content"
          tabIndex={-1}
          role="alert"
          className="mx-auto grid min-h-svh max-w-3xl content-center gap-8 px-6 py-20"
        >
          <h1 className="font-heading text-3xl">{copy.unavailable}</h1>
          <Button type="button" className="w-fit" onClick={retry}>
            {copy.retry}
          </Button>
        </main>
      </body>
    </html>
  )
}
