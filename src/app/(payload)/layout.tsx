/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './428b5e40/importMap'
import { serverFunction } from './serverFunction'
import React from 'react'

/* Payload's pre-compiled CSS */
import '@payloadcms/next/css'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
