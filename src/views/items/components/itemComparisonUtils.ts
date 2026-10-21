import type { ItemListing } from '@/types/api.type'
import { InfoColor, type Item } from '@/types/item.type'

const SEGMENT_RE = /^[A-Za-z0-9_-]+$/

export type ItemRef = { category: string; id: string }

export type ListingPath = ItemRef & { githubUrl: string }

export type ComparisonCandidate = ListingPath & { item: Item }

export type CatalogStatus = 'loading' | 'error' | 'empty' | 'ready'

export type ComparisonState = {
	items: ListingPath[]
	sharpening: number
}

export const MAX_SHARPENING = 15
export const MAX_COMPARISON_ITEMS = 4

const parseListingSegments = (
	data: string | null | undefined,
	withExtension: boolean
): ListingPath | null => {
	if (typeof data !== 'string') return null

	let path = data.trim().replace(/^\/+/, '')
	if (path.startsWith('items/')) path = path.slice('items/'.length)
	if (withExtension && !path.endsWith('.json')) return null
	if (path.endsWith('.json')) path = path.slice(0, -'.json'.length)

	const segments = path.split('/')
	if (segments.length < 2) return null
	if (!segments.every((s) => SEGMENT_RE.test(s))) return null

	const id = segments[segments.length - 1]
	const category = segments.slice(0, -1).join('/')

	return { category, id, githubUrl: `${category}/${id}.json` }
}

export const parseListingPath = (
	data: string | null | undefined
): ListingPath | null => parseListingSegments(data, true)

export const parseItemRef = (
	data: string | null | undefined
): ListingPath | null => parseListingSegments(data, false)

export const toComparisonParam = (ref: ItemRef): string =>
	`${ref.category}/${ref.id}`

const dedupeItems = (items: ListingPath[]): ListingPath[] => {
	const seen = new Set<string>()
	const out: ListingPath[] = []

	for (const item of items) {
		if (seen.has(item.id)) continue
		seen.add(item.id)
		out.push(item)
		if (out.length >= MAX_COMPARISON_ITEMS) break
	}

	return out
}

export const parseComparisonState = (
	params: URLSearchParams
): ComparisonState => {
	const fromParams = params
		.getAll('items')
		.map((value) => parseItemRef(value))
		.filter((item): item is ListingPath => !!item)

	const legacy = [params.get('a'), params.get('b')]
		.map((value) => parseItemRef(value))
		.filter((item): item is ListingPath => !!item)

	return {
		items: dedupeItems(fromParams.length > 0 ? fromParams : legacy),
		sharpening: clampSharpening(Number(params.get('sharpening') ?? 0)),
	}
}

export const serializeComparisonState = (state: ComparisonState): string => {
	const params = new URLSearchParams()

	for (const item of state.items.slice(0, MAX_COMPARISON_ITEMS)) {
		params.append('items', toComparisonParam(item))
	}

	if (state.sharpening > 0) {
		params.set('sharpening', String(clampSharpening(state.sharpening)))
	}

	return params.toString()
}

export const getRootCategory = (category: string | null | undefined): string =>
	(category ?? '').trim().replace(/^\/+/, '').split('/')[0] ?? ''

export const isSameRootCategory = (
	a: string | null | undefined,
	b: string | null | undefined
): boolean => {
	const rootA = getRootCategory(a)
	return rootA !== '' && rootA === getRootCategory(b)
}

const toPickerItem = (
	{ category, id, githubUrl }: ListingPath,
	entry: ItemListing
): Item => ({
	id,
	category,
	name: {
		type: 'translation',
		key: githubUrl,
		args: {},
		lines: Object.fromEntries(
			Object.entries(entry.name ?? {}).filter(
				(line): line is [string, string] => typeof line[1] === 'string'
			)
		),
	},
	color: entry.color ?? InfoColor.DEFAULT,
	infoBlocks: [],
})

export const getComparisonCandidates = (
	listing: readonly ItemListing[] | null | undefined,
	source?: ItemRef | null,
	exclude?: readonly ItemRef[] | null
): ComparisonCandidate[] => {
	if (!Array.isArray(listing)) return []

	const sourceRoot = source ? getRootCategory(source.category) : ''
	if (source && !sourceRoot) return []

	const excludedIds = new Set<string>()
	if (source?.id) excludedIds.add(source.id)
	for (const item of exclude ?? []) {
		if (item?.id) excludedIds.add(item.id)
	}

	const out: ComparisonCandidate[] = []

	for (const entry of listing) {
		const path = parseListingPath(entry?.data)
		if (!path) continue
		if (sourceRoot && getRootCategory(path.category) !== sourceRoot)
			continue
		if (excludedIds.has(path.id)) continue

		excludedIds.add(path.id)
		out.push({ ...path, item: toPickerItem(path, entry) })
	}

	return out
}

export const getCatalogStatus = ({
	hasItems,
	error,
	candidateCount,
}: {
	hasItems: boolean
	error: string | null | undefined
	candidateCount: number
}): CatalogStatus => {
	if (!hasItems) return error ? 'error' : 'loading'
	return candidateCount === 0 ? 'empty' : 'ready'
}

export const clampSharpening = (value: number): number => {
	if (!Number.isFinite(value)) return 0
	return Math.min(MAX_SHARPENING, Math.max(0, Math.trunc(value)))
}
