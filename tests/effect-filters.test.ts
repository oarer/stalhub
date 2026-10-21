import { describe, expect, test } from 'bun:test'
import type { InfoElement } from '@/types/item.type'
import {
	buildPositiveNegativeOptions,
	filterItemsByEffects,
} from '@/views/calcs/builds/utils/effectFilters'
import { item, numeric, translation } from './fixtures'

function debuff(key: string, value: number): InfoElement {
	return {
		type: 'numeric',
		name: translation(key),
		value,
		formatted: { valueColor: '#C15252' },
	}
}

const ids = (items: ReturnType<typeof item>[]) => items.map((entry) => entry.id)

describe('effect filters', () => {
	test('sorts boosts by selected buff magnitude without mutating the catalog', () => {
		const items = [
			item('weak', [numeric('speed', 2)]),
			item('strong', [numeric('speed', 10)]),
			item('other', [numeric('health', 100)]),
		]
		expect(ids(filterItemsByEffects(items, 'en', ['speed'], []))).toEqual([
			'strong',
			'weak',
		])
		expect(ids(items)).toEqual(['weak', 'strong', 'other'])
		expect(filterItemsByEffects(items, 'en', [], [])).toBe(items)
	})

	test('sorts debuffs by least magnitude and distinguishes buff and debuff colors', () => {
		const items = [
			item('large', [debuff('speed', -10)]),
			item('small', [debuff('speed', -2)]),
			item('buff', [numeric('speed', 20)]),
		]
		expect(ids(filterItemsByEffects(items, 'en', [], ['speed']))).toEqual([
			'small',
			'large',
		])
		expect(ids(filterItemsByEffects(items, 'en', ['speed'], []))).toEqual([
			'buff',
		])
	})

	test('uses selected effect order to break ties and then prefers smaller debuffs', () => {
		const items = [
			item('secondary', [
				numeric('speed', 5),
				numeric('health', 10),
				debuff('damage', -1),
			]),
			item('worst', [
				numeric('speed', 5),
				numeric('health', 20),
				debuff('damage', -8),
			]),
			item('best', [
				numeric('speed', 5),
				numeric('health', 20),
				debuff('damage', -2),
			]),
			item('primary', [
				numeric('speed', 10),
				numeric('health', 1),
				debuff('damage', -20),
			]),
		]
		expect(
			ids(
				filterItemsByEffects(
					items,
					'en',
					['speed', 'health'],
					['damage']
				)
			)
		).toEqual(['primary', 'best', 'worst', 'secondary'])
	})

	test('compares ranges at maximum quality and variants at base upgrade', () => {
		const items = [
			item('range', [
				{ type: 'range', name: translation('speed'), min: 1, max: 6 },
			]),
			item('variants', [
				{
					type: 'numericVariants',
					name: translation('speed'),
					value: [8, 40],
				},
			]),
			item('paired', [
				{
					type: 'numericVariants',
					name: translation('speed'),
					value: [
						[1, 10],
						[2, 80],
					],
				},
			]),
		]
		expect(ids(filterItemsByEffects(items, 'en', ['speed'], []))).toEqual([
			'paired',
			'variants',
			'range',
		])
	})

	test('offers effects but excludes boost duration and other service statistics', () => {
		const items = [
			item('boost', [
				numeric('speed', 2),
				debuff('damage', -5),
				numeric('stalker.tooltip.medicine.info.duration', 60),
				numeric('stalker.tooltip.medicine.info.priority', 10),
			]),
		]
		const options = buildPositiveNegativeOptions(items, 'en')
		expect(options.positiveOptions.map((option) => option.value)).toEqual([
			'speed',
		])
		expect(options.negativeOptions.map((option) => option.value)).toEqual([
			'damage',
		])
	})
})
