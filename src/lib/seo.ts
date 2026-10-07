import type { Metadata } from 'next'

const SITE_URL =
	process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
	'https://stalhub.dev'

const LOCALES = ['ru', 'en', 'es', 'fr', 'ko'] as const

export function dynamicAlternates(path: string): Metadata['alternates'] {
	return {
		canonical: `${SITE_URL}${path}`,
		languages: Object.fromEntries(
			LOCALES.map((l) => [
				l,
				`${SITE_URL}/${l}${path === '/' ? '' : path}`,
			])
		),
	}
}

export function dynamicTwitter({
	title,
	description,
	images,
}: {
	title: string
	description?: string
	images?: string[]
}): Metadata['twitter'] {
	return {
		card: 'summary_large_image',
		title,
		...(description ? { description } : {}),
		...(images?.length ? { images } : {}),
	}
}
