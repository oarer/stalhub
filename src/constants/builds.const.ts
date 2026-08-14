export const BUILD_TAGS = ['fat', 'speed', 'weight', 'combo'] as const

export type BuildTag = (typeof BUILD_TAGS)[number]

export const BUILD_SORTS = ['newest', 'stars', 'price'] as const

export type BuildSort = (typeof BUILD_SORTS)[number]
