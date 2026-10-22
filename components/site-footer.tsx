import Link from "next/link"

import { ArrowSquareOutIcon as ExternalLinkIcon } from "@phosphor-icons/react/dist/ssr"
import { BrandLogo, LanguageSwitcher } from "@/components/purity"
import { ShellLink } from "@/components/site-shell-links"
import { buttonVariants } from "@/components/ui/button"
import type {
  FooterData,
  HeaderData,
  SiteSettingsData,
} from "@/content/public-api"
import { localizePath, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function SiteFooter({
  locale,
  currentPath = "/",
  footerData,
  headerData,
  settingsData,
}: {
  locale: Locale
  currentPath?: string
  footerData: FooterData
  headerData: HeaderData
  settingsData: SiteSettingsData
}) {
  const navigation = headerData.navigation
    .filter((item) => item.visible && item.path !== "/booking")
    .map((item) => ({
      id: item.path,
      label: item.label,
      accessibleLabel: item.accessibleLabel,
      href: item.external ? item.path : localizePath(locale, item.path),
    }))
  const footerNavigation = footerData.legalNavigation.map((item) => ({
    id: item.path,
    label: item.label,
    href: localizePath(locale, item.path),
  }))
  const languageLabel = settingsData.uiLabels.language
  const brandName = settingsData.brandName
  const city = settingsData.contacts.city
  const address = footerData.address
  const phones = footerData.phones
  const email = footerData.email
  const hours = footerData.hours
  const socials = footerData.socialLinks.map((item) => ({
    label: item.platform,
    url: item.url,
    accessibleLabel: item.accessibleLabel,
  }))

  return (
    <footer className="bg-foreground px-6 py-14 text-xs text-background/65 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[minmax(18rem,1.6fr)_max-content_max-content_minmax(18rem,1fr)] lg:gap-x-16">
        <div className="grid min-w-0 content-start gap-3">
          <BrandLogo
            locale={locale}
            variant="reversedLockup"
            className="w-56 max-w-full"
          />
          <address className="mt-1 max-w-72 not-italic">
            {city && (
              <p className="leading-6 font-semibold text-background">{city}</p>
            )}
            <p className="leading-6">{address}</p>
          </address>
          <p className="leading-6 break-words">{hours}</p>
        </div>

        <nav
          aria-label={settingsData.uiLabels.footerDirections}
          className="grid min-w-0 content-start uppercase"
        >
          <p className="mb-6 font-semibold text-background">
            {settingsData.uiLabels.footerDirections}
          </p>
          {navigation.slice(0, 8).map((item) => (
            <ShellLink
              key={item.id}
              href={item.href}
              ariaLabel={item.accessibleLabel}
            >
              {item.label}
            </ShellLink>
          ))}
        </nav>

        <nav
          aria-label={brandName}
          className="grid min-w-0 content-start uppercase"
        >
          <p className="mb-6 font-semibold text-background">{brandName}</p>
          {footerNavigation.map((item) => (
            <ShellLink key={item.id} href={item.href}>
              {item.label}
            </ShellLink>
          ))}
        </nav>

        <div className="grid min-w-0 content-start uppercase">
          <p className="mb-6 font-semibold text-background">
            {settingsData.uiLabels.footerContacts}
          </p>
          {phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex min-h-11 items-center break-words transition-opacity hover:opacity-65 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {phone}
            </a>
          ))}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center transition-opacity hover:opacity-65 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {email}
            </a>
          )}
          <Link
            href={localizePath(locale, settingsData.contacts.actionPath)}
            prefetch={false}
            data-testid="footer-booking-cta"
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "mt-2 min-h-11 w-fit max-w-full",
              })
            )}
          >
            {headerData.bookingLabel ?? settingsData.contacts.actionLabel}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            {settingsData.contacts.viberURL && (
              <a
                href={settingsData.contacts.viberURL}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "min-h-11",
                  })
                )}
              >
                Viber
                <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
                <span className="sr-only">
                  {settingsData.uiLabels.externalLink}
                </span>
              </a>
            )}
            {socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.accessibleLabel}
                data-testid="footer-social-link"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "min-h-11",
                  })
                )}
              >
                {social.label}
                <ExternalLinkIcon aria-hidden="true" data-icon="inline-end" />
                <span className="sr-only">
                  {settingsData.uiLabels.externalLink}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 border-t border-background/20 pt-6">
        <LanguageSwitcher
          currentLocale={locale}
          currentPath={currentPath}
          ariaLabel={languageLabel}
          linkClassName="text-background/65 hover:text-background"
        />
        <div aria-hidden="true" className="shrink-0">
          <BrandLogo
            locale={locale}
            variant="mark"
            decorative
            className="w-7 opacity-55"
          />
        </div>
        <span aria-hidden="true" />
      </div>
    </footer>
  )
}
