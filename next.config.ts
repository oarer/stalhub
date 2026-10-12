import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
	assetPrefix:
		process.env.NODE_ENV === 'production'
			? process.env.NEXT_PUBLIC_CDN_URL
			: undefined,

	output: 'standalone',
	serverExternalPackages: ['@resvg/resvg-js'],
	allowedDevOrigins: ['192.168.1.40', 'localhost'],
	images: {
		qualities: [25, 50, 75, 85, 95, 100],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.discordapp.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'media.discordapp.net',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.stalhub.dev',
				pathname: '/**',
			},
			...(isDev
				? [
						{
							protocol: 'http' as const,
							hostname: 'localhost',
							port: '',
							pathname: '/**',
						},
					]
				: []),
		],
	},
}

export default withNextIntl(nextConfig)
