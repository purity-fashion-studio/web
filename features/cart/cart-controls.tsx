"use client"

import Link from "next/link"
import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  formats,
  paymentCurrencies,
  type BookingFormat,
} from "@/features/booking/schema"
import { BookingStartCta } from "@/features/booking/booking-start-cta"
import { getInterfaceCopy } from "@/i18n/messages"
import { localizePath, type Locale } from "@/i18n/routing"

import { cartSelectionKey, type CartSelection } from "./selection"
import { addCartSelection, useCartSelections } from "./store"

export function AddToCart({
  locale,
  selection,
  formatLabels,
  formatLabel,
  currencyLabel,
  allowedFormats,
  bookingCTA,
}: {
  locale: Locale
  selection: CartSelection
  allowedFormats?: readonly BookingFormat[]
  bookingCTA?: { label: string; serviceSlug: string }
  formatLabels: Record<BookingFormat, string>
  formatLabel: string
  currencyLabel: string
}) {
  const cart = useCartSelections()
  const [error, setError] = useState(false)
  const [format, setFormat] = useState(selection.format)
  const [currency, setCurrency] = useState(selection.currency)
  const formatOptions =
    allowedFormats ?? (selection.offerId ? [selection.format] : formats)
  const currentSelection = { ...selection, format, currency }
  const copy = getInterfaceCopy(locale).Cart
  const added = cart.some(
    (item) => cartSelectionKey(item) === cartSelectionKey(currentSelection)
  )
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        {formatOptions.length > 1 && (
          <Select
            value={format}
            onValueChange={(value) => {
              if (formatOptions.includes(value as BookingFormat))
                setFormat(value as BookingFormat)
            }}
            items={formatOptions.map((value) => ({
              value,
              label: formatLabels[value],
            }))}
          >
            <SelectTrigger aria-label={formatLabel} className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((value) => (
                <SelectItem key={value} value={value}>
                  {formatLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select
          value={currency}
          onValueChange={(value) => {
            if (value === "EUR" || value === "UAH") setCurrency(value)
          }}
          items={paymentCurrencies.map((value) => ({ value, label: value }))}
        >
          <SelectTrigger aria-label={currencyLabel} className="min-h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentCurrencies.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {bookingCTA && selection.offerId && (
          <BookingStartCta
            href={localizePath(
              locale,
              `/booking?${new URLSearchParams({ service: selection.slug, offer: selection.offerId, format, currency })}`
            )}
            label={bookingCTA.label}
            serviceSlug={bookingCTA.serviceSlug}
          />
        )}
        <Button
          type="button"
          variant="outline"
          size="lg"
          data-testid="add-to-cart"
          onClick={() => {
            try {
              addCartSelection(currentSelection)
              setError(false)
            } catch {
              setError(true)
            }
          }}
        >
          {added ? copy.added : copy.add}
        </Button>
        <Link
          className={buttonVariants({ variant: "link", size: "lg" })}
          href={localizePath(locale, "/cart")}
          prefetch={false}
          data-testid="view-cart"
        >
          {copy.link}
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-sm">
          {copy.error}
        </p>
      )}
      <span className="sr-only" role="status">
        {added ? copy.added : ""}
      </span>
    </div>
  )
}

export function CartLink({ locale }: { locale: Locale }) {
  const cart = useCartSelections()
  return (
    <Link
      href={localizePath(locale, "/cart")}
      prefetch={false}
      className={buttonVariants({
        variant: "ghost",
        size: "sm",
        className: "min-h-11",
      })}
      data-testid="header-cart-link"
    >
      {getInterfaceCopy(locale).Cart.link}
      {cart.length ? ` (${cart.length})` : ""}
    </Link>
  )
}
