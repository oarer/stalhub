import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'StalHub',
		short_name: 'StalHub',
		description: 'Калькуляторы, сборки и гайды для StalZone',
		start_url: '/',
		display: 'standalone',
		background_color: '#000000',
		theme_color: '#000000',
		icons: [
			{
				src: '/svg/logo.svg',
				sizes: 'any',
				type: 'image/svg+xml',
			},
			{
				src: '/favicon.ico',
				sizes: '48x48',
				type: 'image/x-icon',
			},
		],
	}
}
