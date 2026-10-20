/* Generated from the official Payload blank template. */
import config from "@payload-config"
import "@payloadcms/next/css"
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts"
import type { ServerFunctionClient } from "payload"
import type React from "react"

import { importMap } from "./admin/importMap.js"
import "./custom.scss"

type Props = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async (args) => {
  "use server"

  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({ children }: Props) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}
