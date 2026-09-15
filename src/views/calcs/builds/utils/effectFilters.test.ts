import { deepStrictEqual, strictEqual } from 'node:assert'
import { test } from 'node:test'

function expect(actual: unknown) {
	return {
		toEqual: (expected: unknown) => deepStrictEqual(actual, expected),
		toBe: (expected: unknown) => strictEqual(actual, expected),
	}
}

import type { Item } from '@/types/item.type'
import { filterItemsByEffects } from './effectFilters'

function item(
	id: string,
	value: number,
	debuff = false,
	type = 'numeric'
): Item {
	return {
		id,
		infoBlocks: [
			{
				type: 'list',
				elements: [
					{
						type,
						name: {
							type: 'translation',
							key: 'effect',
							lines: {},
							args: {},
						},
						value:
							type === 'numericVariants'
								? [value, value * 2]
								: value,
						min: value / 2,
						max: value,
						formatted: { valueColor: debuff ? 'C15252' : '00ff00' },
					},
				],
			},
		],
	} as unknown as Item
}

for (const type of ['numeric', 'range', 'numericVariants']) {
	test(`${type}: buffs descending, debuffs ascending by magnitude`, () => {
		const buffs = [
			item('small', 2, false, type),
			item('big', 10, false, type),
		]
		expect(
			filterItemsByEffects(buffs, 'ru', ['effect'], []).map((i) => i.id)
		).toEqual(['big', 'small'])
		for (const sign of [1, -1]) {
			const debuffs = [
				item('big', 10 * sign, true, type),
				item('small', 2 * sign, true, type),
			]
			expect(
				filterItemsByEffects(debuffs, 'ru', [], ['effect']).map(
					(i) => i.id
				)
			).toEqual(['small', 'big'])
		}
		expect(buffs.map((i) => i.id)).toEqual(['small', 'big'])
		expect(filterItemsByEffects(buffs, 'ru', [], [])).toBe(buffs)
	})
}
