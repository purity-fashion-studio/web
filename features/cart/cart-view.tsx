"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingFormat } from "@/features/booking/schema"
import { getInterfaceCopy } from "@/i18n/messages"
import { localizePath, type Locale } from "@/i18n/routing"

import { resolveCart, type ResolvedCartItem } from "./actions"
import { removeCartSelection, useCartSelections } from "./store"

export function CartView({
  locale,
  formatLabels,
}: {
  locale: Locale
  formatLabels: Record<BookingFormat, string>
}) {
  const selections = useCartSelections()
  const requestKey = `${locale}:${JSON.stringify(selections)}`
  const [result, setResult] = useState<{
    key: string
    items: ResolvedCartItem[]
    failed: boolean
  }>({ key: "", items: [], failed: false })
  const [storageError, setStorageError] = useState(false)
  const copy = getInterfaceCopy(locale).Cart
  useEffect(() => {
    let active = true
    resolveCart(locale, selections).then(
      (items) => {
        if (active) setResult({ key: requestKey, items, failed: false })
      },
      () => {
        if (active) setResult({ key: requestKey, items: [], failed: true })
      }
    )
    return () => {
      active = false
    }
  }, [locale, selections, requestKey])
  if (!selections.length)
    return (
      <div className="grid gap-6">
        <p>{copy.empty}</p>
        <Link
          href={localizePath(locale, "/stylist")}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {copy.browse}
        </Link>
      </div>
    )
  return (
    <div className="grid gap-6" aria-busy={result.key !== requestKey}>
      {(storageError || result.failed) && <p role="alert">{copy.error}</p>}
      {result.key !== requestKey ? (
        <p role="status">{copy.loading}</p>
      ) : (
        result.items.map((item) => (
          <Card key={item.key} data-testid="cart-item">
            <CardHeader>
              <CardTitle>{item.title ?? item.selection.slug}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {item.offerTitle && (
                <p>
                  {copy.selected}: {item.offerTitle}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {formatLabels[item.selection.format]} ·{" "}
                {item.selection.currency}
              </p>
              {item.price && (
                <p>
                  {copy.price}: {item.price}
                </p>
              )}
              {!item.available ? (
                <p role="status">{copy.unavailable}</p>
              ) : (
                item.requiresQuote && <p>{copy.quote}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {item.bookingPath && (
                  <Link
                    href={localizePath(locale, item.bookingPath)}
                    className={buttonVariants({
                      size: "lg",
                      className: "h-auto min-h-11 max-w-full whitespace-normal",
                    })}
                    data-testid="cart-continue"
                  >
                    {copy.continue}
                  </Link>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    try {
                      removeCartSelection(item.selection)
                      setStorageError(false)
                    } catch {
                      setStorageError(true)
                    }
                  }}
                >
                  {copy.remove}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
