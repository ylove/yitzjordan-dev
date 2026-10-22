import type { MetadataRoute } from 'next'
import { SITE } from '@/content/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Yitz Jordan',
    description: SITE.description,
    start_url: '/',
    scope: '/',
    display: 'browser',
    theme_color: '#F6F4EF',
    background_color: '#F6F4EF',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
