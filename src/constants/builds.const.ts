export const BUILD_TAGS = ['fat', 'speed', 'weight', 'combo'] as const

export type BuildTag = (typeof BUILD_TAGS)[number]

export const BUILD_SORTS = [
	'newest',
	'stars',
	'price',
	'quality',
] as const

export type BuildSort = (typeof BUILD_SORTS)[number]

export const BUILD_QUALITY_TIERS = [
	'ART_QUALITY_COMMON',
	'ART_QUALITY_UNCOMMON',
	'ART_QUALITY_SPECIAL',
	'ART_QUALITY_RARE',
	'ART_QUALITY_EXCLUSIVE',
	'ART_QUALITY_LEGENDARY',
	'ART_QUALITY_UNIQUE',
] as const
