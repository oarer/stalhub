import { describe, expect, test } from 'bun:test'
import type { ItemListing } from '@/types/api.type'
import type { InfoElement, Item, Message } from '@/types/item.type'
import { InfoColor } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { getComparisonDirection } from '@/views/items/components/comparison/comparisonDirection'
import {
	buildComparisonSections,
	countDifferences,
} from '@/views/items/components/comparison/comparisonStats'
import {
	getCatalogStatus,
	getComparisonCandidates,
	getRootCategory,
	isSameRootCategory,
	MAX_COMPARISON_ITEMS,
	parseComparisonState,
	parseItemRef,
	parseListingPath,
	serializeComparisonState,
	toComparisonParam,
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

describe('item refs and url state', () => {
	test('parses refs with and without the json extension', () => {
		expect(parseItemRef('armor/combat/aaa')).toEqual({
			category: 'armor/combat',
			id: 'aaa',
			githubUrl: 'armor/combat/aaa.json',
		})
		expect(parseItemRef('/items/armor/combat/aaa.json')?.githubUrl).toBe(
			'armor/combat/aaa.json'
		)
		expect(parseItemRef('armor')).toBeNull()
		expect(parseItemRef(null)).toBeNull()
	})

	test('serializes and parses multiple items', () => {
		const a = parseItemRef('armor/combat/aaa')
		const b = parseItemRef('armor/scientist/bbb')
		if (!a || !b) throw new Error('bad fixture')

		const state = { items: [a, b], sharpening: 7 }

		expect(toComparisonParam({ category: 'armor/combat', id: 'aaa' })).toBe(
			'armor/combat/aaa'
		)
		expect(serializeComparisonState(state)).toBe(
			'items=armor%2Fcombat%2Faaa&items=armor%2Fscientist%2Fbbb&sharpening=7'
		)

		const parsed = parseComparisonState(
			new URLSearchParams(serializeComparisonState(state))
		)
		expect(parsed.items.map((item) => item.githubUrl)).toEqual([
			'armor/combat/aaa.json',
			'armor/scientist/bbb.json',
		])
		expect(parsed.sharpening).toBe(7)
	})

	test('parses legacy a and b params', () => {
		const parsed = parseComparisonState(
			new URLSearchParams('a=armor/combat/aaa&b=weapon/pistol/bbb')
		)
		expect(parsed.items.map((item) => item.githubUrl)).toEqual([
			'armor/combat/aaa.json',
			'weapon/pistol/bbb.json',
		])
	})

	test('deduplicates and caps the number of items', () => {
		const params = new URLSearchParams()
		for (const id of ['aaa', 'aaa', 'bbb', 'ccc', 'ddd', 'eee']) {
			params.append('items', `armor/combat/${id}`)
		}
		const parsed = parseComparisonState(params)
		expect(parsed.items).toHaveLength(MAX_COMPARISON_ITEMS)
		expect(parsed.items.map((item) => item.id)).toEqual([
			'aaa',
			'bbb',
			'ccc',
			'ddd',
		])
	})

	test('clamps sharpening and omits empty values', () => {
		expect(
			parseComparisonState(
				new URLSearchParams('a=armor/combat/aaa&sharpening=99')
			).sharpening
		).toBe(15)
		expect(
			serializeComparisonState({
				items: [],
				sharpening: 0,
			})
		).toBe('')
	})
})

describe('catalog without a selected source', () => {
	test('returns every item and excludes the other slot', () => {
		const all = getComparisonCandidates(catalog, null)
		expect(all.map((c) => c.githubUrl)).toEqual([
			'armor/combat/aaa.json',
			'armor/scientist/bbb.json',
			'armor/combined/ccc.json',
			'armor/clothes/ddd.json',
			'weapon/pistol/eee.json',
			'weapon/melee/fff.json',
			'backpacks/ggg.json',
		])

		const withoutA = getComparisonCandidates(catalog, null, [
			{ category: 'armor/combat', id: 'aaa' },
			{ category: 'armor/scientist', id: 'bbb' },
		])
		expect(withoutA.map((c) => c.id)).not.toContain('aaa')
		expect(withoutA.map((c) => c.id)).not.toContain('bbb')
	})
})

const message = (text: string): Message => ({
	type: 'translation',
	key: text,
	args: {},
	lines: { ru: text, en: text },
})

const makeItem = (id: string, elements: InfoElement[]): Item => ({
	id,
	category: 'armor/combat',
	name: message(id),
	color: InfoColor.DEFAULT,
	infoBlocks: [
		{
			type: 'list',
			title: message('Armor stats'),
			elements,
		},
	],
})

const numeric = (name: string, value: number): InfoElement => ({
	type: 'numeric',
	name: message(name),
	value,
})

describe('getComparisonDirection', () => {
	test('detects higher and lower is better stats', () => {
		expect(getComparisonDirection('core.tooltip.info.weight')).toBe('lower')
		expect(
			getComparisonDirection('weapon.tooltip.weapon.info.spread')
		).toBe('lower')
		expect(
			getComparisonDirection('weapon.tooltip.weapon.info.reload_time')
		).toBe('lower')
		expect(
			getComparisonDirection('core.tooltip.stat_name.damage_type.direct')
		).toBe('higher')
		expect(
			getComparisonDirection('weapon.tooltip.weapon.info.rate_of_fire')
		).toBe('higher')
		expect(
			getComparisonDirection('weapon.stat_factor.reload_modifier')
		).toBe('higher')
		expect(
			getComparisonDirection('weapon.stat_factor.shoot_factor_decrement')
		).toBe('higher')
		expect(getComparisonDirection('some.unknown.stat')).toBeNull()
	})
})

describe('buildComparisonSections', () => {
	test('aligns stats and finds best and worst values', () => {
		const a = makeItem('a', [numeric('Damage', 100), numeric('Weight', 5)])
		const b = makeItem('b', [
			numeric('Damage', 120),
			numeric('Weight', 4),
			numeric('Durability', 50),
		])

		const sections = buildComparisonSections([a, b], 0, 'en')
		expect(sections).toHaveLength(1)
		expect(sections[0].rows.map((row) => row.label)).toEqual([
			'Damage',
			'Weight',
			'Durability',
		])

		const damage = sections[0].rows[0]
		expect(damage.values[0]?.text).toBe('100')
		expect(damage.values[1]?.text).toBe('120')
		expect(damage.best).toEqual([1])
		expect(damage.worst).toEqual([0])

		const weight = sections[0].rows[1]
		expect(weight.best).toEqual([1])
		expect(weight.worst).toEqual([0])

		const durability = sections[0].rows[2]
		expect(durability.values[0]).toBeNull()
		expect(durability.values[1]?.text).toBe('50')
		expect(durability.best).toEqual([])
		expect(durability.worst).toEqual([])
		expect(durability.changed).toBe(true)

		expect(countDifferences(sections)).toBe(3)
	})

	test('marks tied best and worst values across several items', () => {
		const items = [
			makeItem('a', [numeric('Damage', 100)]),
			makeItem('b', [numeric('Damage', 120)]),
			makeItem('c', [numeric('Damage', 120)]),
		]

		const [section] = buildComparisonSections(items, 0, 'en')
		expect(section.rows[0].values).toHaveLength(3)
		expect(section.rows[0].best).toEqual([1, 2])
		expect(section.rows[0].worst).toEqual([0])
	})

	test('does not highlight stats without a known direction', () => {
		const a = makeItem('a', [numeric('Protection', 100)])
		const b = makeItem('b', [numeric('Protection', 120)])

		const [section] = buildComparisonSections([a, b], 0, 'en')
		expect(section.rows[0].direction).toBeNull()
		expect(section.rows[0].best).toEqual([])
		expect(section.rows[0].worst).toEqual([])
		expect(section.rows[0].changed).toBe(true)
	})

	test('uses the selected sharpening level for variants', () => {
		const a = makeItem('a', [
			{
				type: 'numericVariants',
				name: message('Damage'),
				value: [10, 20, 30],
			},
		])
		const b = makeItem('b', [
			{
				type: 'numericVariants',
				name: message('Damage'),
				value: [15, 25, 35],
			},
		])

		const [section] = buildComparisonSections([a, b], 2, 'en')
		expect(section.rows[0].values[0]?.text).toBe('30')
		expect(section.rows[0].values[1]?.text).toBe('35')
		expect(section.rows[0].best).toEqual([1])
	})

	test('prefers detailed grouped blocks over compact duplicates', () => {
		const grouped = (id: string, value: number): Item => ({
			id,
			category: 'armor/combat',
			name: message(id),
			color: InfoColor.DEFAULT,
			infoBlocks: [
				{
					type: 'grouped',
					compact: [
						{
							type: 'list',
							title: message('Basic'),
							elements: [numeric('Damage', value)],
						},
					],
					detailed: [
						{
							type: 'list',
							title: message('Damage'),
							elements: [
								numeric('Damage', value),
								numeric('Weight', value / 10),
							],
						},
					],
				},
			],
		})

		const sections = buildComparisonSections(
			[grouped('a', 100), grouped('b', 120)],
			0,
			'en'
		)

		expect(sections.map((section) => section.title)).toEqual(['Damage'])
		expect(sections[0].rows.map((row) => row.label)).toEqual([
			'Damage',
			'Weight',
		])
		expect(sections[0].rows[0].best).toEqual([1])
	})

	test('marks identical stats as unchanged', () => {
		const a = makeItem('a', [numeric('Damage', 100)])
		const b = makeItem('b', [numeric('Damage', 100)])

		const sections = buildComparisonSections([a, b], 0, 'en')
		expect(sections[0].rows[0].changed).toBe(false)
		expect(sections[0].rows[0].best).toEqual([])
		expect(sections[0].rows[0].worst).toEqual([])
		expect(countDifferences(sections)).toBe(0)
	})
})
