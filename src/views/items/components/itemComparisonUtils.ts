import type { ItemListing } from '@/types/api.type'
import { InfoColor, type Item } from '@/types/item.type'

const SEGMENT_RE = /^[A-Za-z0-9_-]+$/

export type ItemRef = { category: string; id: string }

export type ListingPath = ItemRef & { githubUrl: string }

export type ComparisonCandidate = ListingPath & { item: Item }

export type ComparisonSelection = {
	sourceUrl: string
	targetUrl: string | null
	sharpening: number
}

export type TargetValidation =
	| 'ok'
	| 'missing'
	| 'same-item'
	| 'category-mismatch'

export type CatalogStatus = 'loading' | 'error' | 'empty' | 'ready'

export const MAX_SHARPENING = 15

export const parseListingPath = (
	data: string | null | undefined
): ListingPath | null => {
	if (typeof data !== 'string') return null

	let path = data.trim().replace(/^\/+/, '')
	if (path.startsWith('items/')) path = path.slice('items/'.length)
	if (!path.endsWith('.json')) return null

	const segments = path.slice(0, -'.json'.length).split('/')
	if (segments.length < 2) return null
	if (!segments.every((s) => SEGMENT_RE.test(s))) return null

	const id = segments[segments.length - 1]
	const category = segments.slice(0, -1).join('/')

	return { category, id, githubUrl: `${category}/${id}.json` }
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
	source: ItemRef
): ComparisonCandidate[] => {
	if (!Array.isArray(listing)) return []

	const sourceRoot = getRootCategory(source.category)
	if (!sourceRoot) return []

	const seen = new Set<string>([source.id])
	const out: ComparisonCandidate[] = []

	for (const entry of listing) {
		const path = parseListingPath(entry?.data)
		if (!path) continue
		if (getRootCategory(path.category) !== sourceRoot) continue
		if (seen.has(path.id)) continue

		seen.add(path.id)
		out.push({ ...path, item: toPickerItem(path, entry) })
	}

	return out
}

export const validateComparisonTarget = (
	source: ItemRef,
	target: ItemRef | null | undefined
): TargetValidation => {
	if (!target?.id || !target.category) return 'missing'
	if (target.id === source.id) return 'same-item'
	if (!isSameRootCategory(source.category, target.category))
		return 'category-mismatch'
	return 'ok'
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

export const createSelection = (
	sourceUrl: string,
	sharpening = 0
): ComparisonSelection => ({
	sourceUrl,
	targetUrl: null,
	sharpening: clampSharpening(sharpening),
})

export const resolveSelection = (
	selection: ComparisonSelection,
	sourceUrl: string,
	initialSharpening = 0
): ComparisonSelection =>
	selection.sourceUrl === sourceUrl
		? selection
		: createSelection(sourceUrl, initialSharpening)
