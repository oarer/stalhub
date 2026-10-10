type JsonLdProps = {
	data: Record<string, unknown> | Array<Record<string, unknown>>
}

export function JsonLd({ data }: JsonLdProps) {
	return (
		<script
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
			type="application/ld+json"
		/>
	)
}

export function websiteJsonLd(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'StalHub',
		alternateName: ['сталхаб'],
		url: siteUrl,
		inLanguage: ['ru', 'en', 'es', 'fr', 'ko'],
	}
}

export function organizationJsonLd(siteUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'StalHub',
		url: siteUrl,
		logo: `${siteUrl}/svg/logo.svg`,
	}
}

export function breadcrumbJsonLd(
	siteUrl: string,
	items: Array<{ name: string; path: string }>
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: `${siteUrl}${item.path}`,
		})),
	}
}

export function articleJsonLd({
	siteUrl,
	path,
	headline,
	description,
	datePublished,
	dateModified,
	authorName,
	tags,
	image,
}: {
	siteUrl: string
	path: string
	headline: string
	description?: string
	datePublished?: string
	dateModified?: string
	authorName?: string
	tags?: string[]
	image?: string
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline,
		...(description ? { description } : {}),
		mainEntityOfPage: `${siteUrl}${path}`,
		...(image ? { image } : {}),
		...(datePublished ? { datePublished } : {}),
		...(dateModified ? { dateModified } : {}),
		...(authorName
			? { author: { '@type': 'Person', name: authorName } }
			: {}),
		...(tags?.length ? { keywords: tags.join(', ') } : {}),
		publisher: {
			'@type': 'Organization',
			name: 'StalHub',
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/svg/logo.svg`,
			},
		},
	}
}
