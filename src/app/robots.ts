import type { MetadataRoute } from 'next'

const SITE_URL =
	process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
	'https://stalhub.dev'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin', '/me', '/auth', '/api/'],
			},
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
	}
}
