import type { Metadata } from 'next'
import raw from '@/constants/meta.json'

type PageMeta = {
	title?: string
	description?: string
	keywords?: string[]
	robots?: {
		index?: boolean
		follow?: boolean
	}
	openGraph?: {
		title?: string
		description?: string
	}
}

type MetaSchema = {
	base: PageMeta
	notFound: PageMeta
} & Record<string, PageMeta | undefined>

const meta = raw as MetaSchema

const SITE_URL =
	process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
	'https://stalhub.dev'

const LOCALES = ['ru', 'en', 'es', 'fr', 'ko'] as const

const OG_LOCALE: Record<string, string> = {
	ru: 'ru_RU',
	en: 'en_US',
	es: 'es_ES',
	fr: 'fr_FR',
	ko: 'ko_KR',
}

function languagesFor(path: string): Record<string, string> {
	const entries = LOCALES.map(
		(l) => [l, `${SITE_URL}/${l}${path === '/' ? '' : path}`] as const
	)
	return Object.fromEntries(entries)
}

function buildBase(locale = 'ru'): Metadata {
	const base = meta.base
	const baseTitle =
		base.title ?? 'StalHub — калькуляторы, сборки и гайды для StalZone'

	return {
		metadataBase: new URL(SITE_URL),
		title: {
			absolute: baseTitle,
			// чтобы не было дубля "· StalHub · StalHub".
			template: '%s',
		},
		description: base.description,
		keywords: base.keywords,
		authors: [{ name: 'StalHub', url: SITE_URL }],
		creator: 'StalHub',
		publisher: 'StalHub',
		applicationName: 'StalHub',
		formatDetection: {
			telephone: false,
		},
		icons: {
			icon: '/favicon.ico',
			shortcut: '/favicon.ico',
			apple: '/svg/logo.svg',
		},
		manifest: '/manifest.webmanifest',
		openGraph: {
			type: 'website',
			locale: OG_LOCALE[locale] ?? 'ru_RU',
			siteName: 'StalHub',
			url: SITE_URL,
			title: baseTitle,
			description: base.description,
			images: [
				{
					url: '/images/og/banner.png',
					width: 1200,
					height: 630,
					alt: 'StalHub — калькуляторы, сборки и гайды для StalZone',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: base.title,
			description: base.description,
			images: ['/images/og/banner.png'],
		},
		verification: {
			...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
				? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
				: {}),
		},
	}
}

export function getMetadataByPath(
	path: string | undefined,
	locale = 'ru'
): Metadata {
	const baseMeta = buildBase(locale)

	if (!path) return baseMeta

	const pageMeta = meta[path]
	if (!pageMeta) return baseMeta

	return {
		...baseMeta,
		...(pageMeta.title ? { title: pageMeta.title } : {}),
		...(pageMeta.description ? { description: pageMeta.description } : {}),
		...(pageMeta.keywords ? { keywords: pageMeta.keywords } : {}),
		...(pageMeta.robots ? { robots: pageMeta.robots } : {}),
		alternates: {
			canonical: `${SITE_URL}${path}`,
			languages: languagesFor(path),
		},
		openGraph: {
			...baseMeta.openGraph,
			title: pageMeta.openGraph?.title ?? pageMeta.title,
			description:
				pageMeta.openGraph?.description ?? pageMeta.description,
			url: `${SITE_URL}${path}`,
		},
		twitter: {
			...baseMeta.twitter,
			title: pageMeta.title,
			description: pageMeta.description,
		},
	}
}

export const SITE_META = { SITE_URL, LOCALES: [...LOCALES] }
