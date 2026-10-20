"use client"

import { ListIcon as MenuIcon, XIcon } from "@phosphor-icons/react"
import Link from "next/link"
import * as React from "react"

import { BrandLogo, LanguageSwitcher } from "@/components/purity"
import { ShellLink } from "@/components/site-shell-links"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { HeaderData, SiteSettingsData } from "@/content/public-api"
import { localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const subscribe = () => () => undefined

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex size-6 items-center justify-center text-2xl">
      <MenuIcon
        aria-hidden="true"
        data-icon="inline-start"
        className={cn(
          "absolute transition duration-200",
          open
            ? "rotate-90 opacity-0 group-data-ending-style/menu:rotate-0 group-data-ending-style/menu:opacity-100 group-data-starting-style/menu:rotate-0 group-data-starting-style/menu:opacity-100"
            : "rotate-0 opacity-100"
        )}
      />
      <XIcon
        aria-hidden="true"
        data-icon="inline-start"
        className={cn(
          "absolute transition duration-200",
          open
            ? "rotate-0 opacity-100 group-data-ending-style/menu:rotate-90 group-data-ending-style/menu:opacity-0 group-data-starting-style/menu:rotate-90 group-data-starting-style/menu:opacity-0"
            : "-rotate-90 opacity-0"
        )}
      />
    </span>
  )
}

function SiteHeaderClient({
  locale,
  currentPath = "/",
  overlay = true,
  headerData,
  settingsData,
}: {
  locale: Locale
  currentPath?: string
  overlay?: boolean
  headerData: HeaderData
  settingsData: SiteSettingsData
}) {
  const navigation = headerData.navigation
    .filter((item) => item.visible)
    .map((item) => ({
      id: item.path,
      label: item.label,
      accessibleLabel: item.accessibleLabel,
      href: item.external ? item.path : localizePath(locale, item.path),
    }))
  const bookingItem = navigation.find(
    (item) => item.id === "booking" || item.id === "/booking"
  )
  const primaryNavigation = navigation.filter(
    (item) => item.id !== "booking" && item.id !== "/booking"
  )
  const bookingHref = bookingItem?.href ?? localizePath(locale, "/booking")
  const bookingLabel =
    headerData.bookingLabel ??
    bookingItem?.label ??
    settingsData.contacts.actionLabel
  const brandName = settingsData.brandName
  const languageLabel = settingsData.uiLabels.language
  const menuLabel = settingsData.uiLabels.menu
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuClosing, setMenuClosing] = React.useState(false)
  const [isAtTop, setIsAtTop] = React.useState(true)
  const isInteractive = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const menuContentRef = React.useRef<HTMLDivElement>(null)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const transparent = overlay && isAtTop
  const lightHeader = transparent && !menuOpen

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const requestMenuState = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        clearCloseTimer()
        setMenuClosing(false)
        setMenuOpen(true)
        return
      }

      if (!menuOpen || menuClosing) {
        return
      }

      setMenuClosing(true)
      closeTimerRef.current = setTimeout(() => {
        setMenuOpen(false)
        setMenuClosing(false)
        closeTimerRef.current = null
      }, 160)
    },
    [clearCloseTimer, menuClosing, menuOpen]
  )

  React.useEffect(() => {
    const updateHeader = () => setIsAtTop(window.scrollY < 12)

    updateHeader()
    window.addEventListener("scroll", updateHeader, { passive: true })

    return () => window.removeEventListener("scroll", updateHeader)
  }, [])

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 px-6 py-4 text-xs uppercase transition-colors md:px-10",
        lightHeader
          ? "text-primary-foreground"
          : transparent
            ? "text-foreground"
            : "bg-background text-muted-foreground"
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-5">
        <Link
          href={localizePath(locale)}
          aria-label={brandName}
          className="flex min-h-11 w-32 shrink-0 items-center focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-36"
        >
          <BrandLogo
            locale={locale}
            variant="wordmark"
            className={lightHeader ? "brightness-0 invert" : undefined}
            priority
          />
        </Link>
        <nav
          aria-label={brandName}
          data-testid="desktop-navigation"
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 whitespace-nowrap xl:flex"
        >
          {primaryNavigation.map((item) => (
            <ShellLink
              key={item.id}
              href={item.href}
              ariaLabel={item.accessibleLabel}
            >
              {item.label}
            </ShellLink>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
          <div
            className="hidden shrink-0 items-center xl:flex"
            data-testid="header-utilities"
          >
            <LanguageSwitcher
              currentLocale={locale}
              currentPath={currentPath}
              ariaLabel={languageLabel}
              linkClassName={
                lightHeader
                  ? "text-primary-foreground/70 hover:text-primary-foreground"
                  : undefined
              }
            />
            <Link
              href={bookingHref}
              data-testid="header-booking-cta"
              className={cn(
                buttonVariants({
                  variant: lightHeader ? "secondary" : "default",
                  size: "sm",
                  className: "min-h-11",
                })
              )}
            >
              {bookingLabel}
            </Link>
          </div>
          <Sheet
            modal="trap-focus"
            open={menuOpen}
            onOpenChange={requestMenuState}
          >
            <Button
              type="button"
              aria-label={menuLabel}
              aria-hidden={menuOpen || undefined}
              aria-controls="mobile-site-menu"
              aria-expanded={menuOpen}
              data-interactive={isInteractive}
              data-testid="mobile-menu-trigger"
              variant="ghost"
              size="icon-lg"
              className={cn(
                "xl:hidden",
                menuOpen && "pointer-events-none opacity-0"
              )}
              tabIndex={menuOpen ? -1 : undefined}
              onClick={() => requestMenuState(!menuOpen)}
            >
              <MenuToggleIcon open={menuOpen} />
            </Button>
            <SheetContent
              id="mobile-site-menu"
              ref={menuContentRef}
              initialFocus={menuContentRef}
              data-closing={menuClosing || undefined}
              className="group/menu inset-0 size-full overscroll-contain border-0 shadow-none transition-[clip-path] duration-300 ease-out [clip-path:circle(150vmax_at_calc(100%_-_2.875rem)_2.375rem)] data-ending-style:[clip-path:circle(0_at_calc(100%_-_2.875rem)_2.375rem)] data-starting-style:[clip-path:circle(0_at_calc(100%_-_2.875rem)_2.375rem)] data-[side=right]:left-0 data-[side=right]:w-full data-[side=right]:max-w-none data-[side=right]:border-0 data-[side=right]:data-ending-style:translate-x-0 data-[side=right]:data-starting-style:translate-x-0 sm:size-full sm:max-w-none data-[side=right]:sm:max-w-none"
              showCloseButton={false}
              closeLabel={settingsData.uiLabels.close}
              side="right"
            >
              <SheetHeader className="flex-row items-center justify-between px-6 py-4 md:px-10">
                <Link
                  href={localizePath(locale)}
                  aria-label={brandName}
                  className="flex min-h-11 w-32 items-center focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-36"
                >
                  <BrandLogo locale={locale} variant="wordmark" />
                </Link>
                <SheetClose
                  aria-label={settingsData.uiLabels.close}
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      className="xl:hidden"
                    />
                  }
                >
                  <MenuToggleIcon open />
                </SheetClose>
                <SheetTitle className="sr-only">{brandName}</SheetTitle>
                <SheetDescription className="sr-only">
                  {menuLabel}
                </SheetDescription>
              </SheetHeader>
              <div className="grid flex-1 content-start gap-10 overflow-y-auto px-6 pt-16 pb-8 opacity-100 transition-opacity delay-150 duration-150 group-data-ending-style/menu:opacity-0 group-data-ending-style/menu:delay-0 group-data-ending-style/menu:duration-100 group-data-starting-style/menu:opacity-0 group-data-[closing=true]/menu:opacity-0 group-data-[closing=true]/menu:delay-0 md:px-10">
                <nav
                  aria-label={brandName}
                  data-testid="mobile-navigation"
                  className="grid justify-items-center text-center font-heading text-3xl leading-none uppercase"
                >
                  {primaryNavigation.slice(0, 8).map((item) => (
                    <ShellLink
                      key={item.id}
                      href={item.href}
                      ariaLabel={item.accessibleLabel}
                      className="min-h-14 w-full justify-center py-2"
                    >
                      {item.label}
                    </ShellLink>
                  ))}
                </nav>
                <Link
                  href={bookingHref}
                  data-testid="mobile-booking-cta"
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "lg",
                      className: "min-h-14 w-full",
                    })
                  )}
                >
                  {bookingLabel}
                </Link>
                <LanguageSwitcher
                  currentLocale={locale}
                  currentPath={currentPath}
                  ariaLabel={languageLabel}
                  className="mt-auto"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export { SiteHeaderClient }
