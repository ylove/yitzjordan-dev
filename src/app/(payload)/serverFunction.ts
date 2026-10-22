'use server'

import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './428b5e40/importMap'
import type { ServerFunctionClient } from 'payload'

export const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}
