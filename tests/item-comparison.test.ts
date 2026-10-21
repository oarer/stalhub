import { describe, expect, test } from 'bun:test'
import type { ItemListing } from '@/types/api.type'
import { InfoColor } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import {
	clampSharpening,
	createSelection,
	getCatalogStatus,
	getComparisonCandidates,
	getRootCategory,
	isSameRootCategory,
	parseListingPath,
	resolveSelection,
	validateComparisonTarget,
} from '@/views/items/components/itemComparisonUtils'

const listing = (data: string, color = InfoColor.DEFAULT): ItemListing => ({
	data,
	icon: data.replace('/items/', '/icons/').replace('.json', '.png'),
	name: { ru: data, en: data },
	color,
})

const catalog: ItemListing[] = [
	listing('/items/armor/combat/aaa.json'),
	listing('/items/armor/scientist/bbb.json'),
	listing('/items/armor/combined/ccc.json'),
	listing('/items/armor/clothes/ddd.json'),
	listing('/items/weapon/pistol/eee.json'),
	listing('/items/weapon/melee/fff.json'),
	listing('/items/backpacks/ggg.json'),
]

describe('parseListingPath', () => {
	test('parses catalog data path', () => {
		expect(parseListingPath('/items/armor/combat/abc.json')).toEqual({
			category: 'armor/combat',
			id: 'abc',
			githubUrl: 'armor/combat/abc.json',
		})
	})

	test('accepts single-segment categories and bare github urls', () => {
		expect(parseListingPath('/items/backpacks/x1.json')?.category).toBe(
			'backpacks'
		)
		expect(parseListingPath('armor/combat/abc.json')?.githubUrl).toBe(
			'armor/combat/abc.json'
		)
	})

	test.each([
		undefined,
		null,
		'',
		'/items/abc.json',
		'/items/armor/combat/abc',
		'/items/armor/../abc.json',
		'/items/armor//abc.json',
		'/items/armor/a b.json',
		'/items/armor/combat/.json',
	])('rejects %p', (value) => {
		expect(parseListingPath(value)).toBeNull()
	})
})

describe('root category', () => {
	test('extracts the first segment', () => {
		expect(getRootCategory('armor/combat')).toBe('armor')
		expect(getRootCategory('/weapon/pistol')).toBe('weapon')
		expect(getRootCategory('backpacks')).toBe('backpacks')
		expect(getRootCategory('')).toBe('')
		expect(getRootCategory(undefined)).toBe('')
	})

	test('armor subcategories match, armor and weapon do not', () => {
		expect(isSameRootCategory('armor/combat', 'armor/scientist')).toBe(true)
		expect(isSameRootCategory('armor', 'armor/combat')).toBe(true)
		expect(isSameRootCategory('armor/combat', 'weapon/pistol')).toBe(false)
		expect(isSameRootCategory('armor', 'weapon')).toBe(false)
		expect(isSameRootCategory('', '')).toBe(false)
	})
})

describe('getComparisonCandidates', () => {
	test('keeps only the same root category and excludes the source', () => {
		const result = getComparisonCandidates(catalog, {
			category: 'armor/combat',
			id: 'aaa',
		})
		expect(result.map((c) => c.githubUrl)).toEqual([
			'armor/scientist/bbb.json',
			'armor/combined/ccc.json',
			'armor/clothes/ddd.json',
		])
	})

	test('does not mix armor and weapon', () => {
		const weapons = getComparisonCandidates(catalog, {
			category: 'weapon/pistol',
			id: 'eee',
		})
		expect(weapons.map((c) => c.id)).toEqual(['fff'])
	})

	test('maps entries to picker items usable by ItemsList', () => {
		const [first] = getComparisonCandidates(catalog, {
			category: 'armor/combat',
			id: 'zzz',
		})
		expect(first.item.id).toBe(first.id)
		expect(first.item.category).toBe('armor/combat')
		expect(first.item.infoBlocks).toEqual([])
		expect(messageToString(first.item.name, 'en')).toBe(
			'/items/armor/combat/aaa.json'
		)
		expect(messageToString(first.item.name, 'ko')).toBe(
			'/items/armor/combat/aaa.json'
		)
	})

	test('ignores non-string name lines', () => {
		const odd = {
			data: '/items/armor/combat/odd.json',
			icon: '',
			name: { en: 'Odd', ru: 5 },
			color: InfoColor.DEFAULT,
		} as unknown as ItemListing
		const [entry] = getComparisonCandidates([odd], {
			category: 'armor/scientist',
			id: 'src',
		})
		expect(entry.item.name).toMatchObject({ lines: { en: 'Odd' } })
		expect(messageToString(entry.item.name, 'ru')).toBe('Odd')
	})

	test('falls back to default color when the catalog entry has none', () => {
		const noColor = {
			data: '/items/armor/combat/nocolor.json',
			icon: '',
			name: { en: 'x' },
		} as unknown as ItemListing
		const [entry] = getComparisonCandidates([noColor], {
			category: 'armor/scientist',
			id: 'src',
		})
		expect(entry.item.color).toBe(InfoColor.DEFAULT)
	})

	test('drops malformed entries and duplicate ids', () => {
		const result = getComparisonCandidates(
			[
				listing('/items/armor/combat/dup.json'),
				listing('/items/armor/scientist/dup.json'),
				{ data: 'oops' } as ItemListing,
				null as unknown as ItemListing,
			],
			{ category: 'armor/combined', id: 'src' }
		)
		expect(result.map((c) => c.githubUrl)).toEqual([
			'armor/combat/dup.json',
		])
	})

	test('returns nothing without a catalog or a source category', () => {
		const source = { category: 'armor/combat', id: 'aaa' }
		expect(getComparisonCandidates(null, source)).toEqual([])
		expect(getComparisonCandidates(undefined, source)).toEqual([])
		expect(
			getComparisonCandidates(catalog, { category: '', id: 'aaa' })
		).toEqual([])
	})
})

describe('validateComparisonTarget', () => {
	const source = { category: 'armor/combat', id: 'aaa' }

	test('accepts a different item of the same root category', () => {
		expect(
			validateComparisonTarget(source, {
				category: 'armor/scientist',
				id: 'bbb',
			})
		).toBe('ok')
	})

	test('rejects another root category from the loaded JSON', () => {
		expect(
			validateComparisonTarget(source, {
				category: 'weapon/pistol',
				id: 'eee',
			})
		).toBe('category-mismatch')
	})

	test('rejects the source itself and missing targets', () => {
		expect(
			validateComparisonTarget(source, {
				category: 'armor/combat',
				id: 'aaa',
			})
		).toBe('same-item')
		expect(validateComparisonTarget(source, null)).toBe('missing')
		expect(validateComparisonTarget(source, undefined)).toBe('missing')
	})
})

describe('getCatalogStatus', () => {
	test('loading until items or an error arrive', () => {
		expect(
			getCatalogStatus({
				hasItems: false,
				error: null,
				candidateCount: 0,
			})
		).toBe('loading')
	})

	test('error only without items; stale items win over an error', () => {
		expect(
			getCatalogStatus({ hasItems: false, error: 'x', candidateCount: 0 })
		).toBe('error')
		expect(
			getCatalogStatus({ hasItems: true, error: 'x', candidateCount: 3 })
		).toBe('ready')
	})

	test('empty when loaded catalog has no candidates', () => {
		expect(
			getCatalogStatus({ hasItems: true, error: null, candidateCount: 0 })
		).toBe('empty')
	})
})

describe('selection state', () => {
	test('clampSharpening bounds and sanitizes', () => {
		expect(clampSharpening(-3)).toBe(0)
		expect(clampSharpening(7.9)).toBe(7)
		expect(clampSharpening(99)).toBe(15)
		expect(clampSharpening(Number.NaN)).toBe(0)
	})

	test('selection is kept for the same source', () => {
		const selection = {
			...createSelection('armor/combat/aaa.json', 3),
			targetUrl: 'armor/scientist/bbb.json',
		}
		expect(resolveSelection(selection, 'armor/combat/aaa.json', 0)).toBe(
			selection
		)
	})

	test('selection and sharpening reset when the source changes', () => {
		const selection = {
			...createSelection('armor/combat/aaa.json', 3),
			sharpening: 9,
			targetUrl: 'armor/scientist/bbb.json',
		}
		expect(resolveSelection(selection, 'armor/combat/zzz.json', 2)).toEqual(
			{
				sourceUrl: 'armor/combat/zzz.json',
				targetUrl: null,
				sharpening: 2,
			}
		)
	})
})
