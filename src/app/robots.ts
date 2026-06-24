import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        host: 'https://stalhub.tech',
        sitemap: 'https://stalhub.tech/sitemap.xml',
    }
}