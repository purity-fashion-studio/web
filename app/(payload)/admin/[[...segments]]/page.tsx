import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import config from "@payload-config"
import type { Metadata } from "next"

import { importMap } from "../importMap"

type Props = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({
  params,
  searchParams,
}: Props): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

export default function PayloadAdminPage({ params, searchParams }: Props) {
  return RootPage({ config, params, searchParams, importMap })
}
