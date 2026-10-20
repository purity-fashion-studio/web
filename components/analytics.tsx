import Script from "next/script"
import { cookies } from "next/headers"

export async function Analytics({ nonce }: { nonce?: string }) {
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true"
  const id = process.env.NEXT_PUBLIC_GA4_ID
  const consent = (await cookies()).get("purity_analytics_consent")?.value
  if (!enabled || !id || consent !== "granted") {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="purity-ga4" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true,send_page_view:true});`}
      </Script>
    </>
  )
}
