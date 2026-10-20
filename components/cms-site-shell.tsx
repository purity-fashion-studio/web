import { SiteHeaderClient } from "@/components/site-shell"
import { SiteFooter as StaticSiteFooter } from "@/components/site-footer"
import { getFooter, getHeader, getSiteSettings } from "@/content/public-api"
import type { Locale } from "@/i18n/routing"

type ShellProps = {
  locale: Locale
  currentPath?: string
}

export async function SiteHeader({
  locale,
  currentPath = "/",
  overlay = true,
}: ShellProps & { overlay?: boolean }) {
  const [headerData, settingsData] = await Promise.all([
    getHeader(locale),
    getSiteSettings(locale),
  ])
  return (
    <SiteHeaderClient
      locale={locale}
      currentPath={currentPath}
      overlay={overlay}
      headerData={headerData}
      settingsData={settingsData}
    />
  )
}

export async function SiteFooter({ locale, currentPath = "/" }: ShellProps) {
  const [footerData, headerData, settingsData] = await Promise.all([
    getFooter(locale),
    getHeader(locale),
    getSiteSettings(locale),
  ])
  return (
    <StaticSiteFooter
      locale={locale}
      currentPath={currentPath}
      footerData={footerData}
      headerData={headerData}
      settingsData={settingsData}
    />
  )
}
