import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        host: 'https://stalhub.dev',
        sitemap: 'https://stalhub.dev/sitemap.xml',
    }
}