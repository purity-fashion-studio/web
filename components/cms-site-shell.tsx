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
  const maintenanceMessage = settingsData.maintenance.enabled
    ? settingsData.maintenance.message?.trim()
    : undefined
  return (
    <>
      <SiteHeaderClient
        locale={locale}
        currentPath={currentPath}
        overlay={maintenanceMessage ? false : overlay}
        headerData={headerData}
        settingsData={settingsData}
      />
      {maintenanceMessage && (
        <aside
          role="status"
          className="relative border-b border-border bg-muted px-6 pt-24 pb-5 text-sm leading-7 text-foreground md:px-10"
        >
          <p className="mx-auto max-w-screen-xl break-words whitespace-pre-line">
            {maintenanceMessage}
          </p>
        </aside>
      )}
    </>
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
