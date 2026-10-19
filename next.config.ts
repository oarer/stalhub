import { resolve } from 'node:path'
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
	turbopack: { root: resolve(process.cwd(), '..') },
	outputFileTracingRoot: resolve(process.cwd(), '..'),
	serverExternalPackages: ['@resvg/resvg-js'],
	allowedDevOrigins: ['192.168.1.40', 'localhost'],
	async rewrites() {
		return [{ source: '/public/:path*', destination: '/:path*' }]
	},
	
	// by teamdima
	async headers() {
		return [
			{
				source: '/map/:path*',
				headers: [
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
					{
						key: 'Cross-Origin-Embedder-Policy',
						value: 'credentialless',
					},
				],
			},
			{
				source: '/map3d-engine/:path*',
				headers: [
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
					{
						key: 'Cross-Origin-Embedder-Policy',
						value: 'credentialless',
					},
					{
						key: 'Cross-Origin-Resource-Policy',
						value: 'same-origin',
					},
				],
			},
		]
	},
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
