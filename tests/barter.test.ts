import { expect, test } from 'bun:test'
import type { BarterRecipeResult } from '@/types/barter.type'
import {
	effectiveAmount,
	evaluateOffer,
	evaluateStock,
} from '@/views/calcs/barter/components/calcUtils'

function offer(amount: number, money = 100): BarterRecipeResult {
	return {
		money,
		items: [
			{
				item_id: 'material',
				amount,
				category: 'barter/9dknl',
				color: 'DEFAULT',
				lines: { type: 'text', text: 'Material' },
			},
		],
	}
}

test('currency conversion happens before coupon rounding', () => {
	expect(effectiveAmount(3, 'barter/9dknl', 'coins', 25)).toBe(5)
	expect(effectiveAmount(3, 'barter/unknown', 'none', 25)).toBe(3)
	expect(effectiveAmount(1, 'barter/9dk7l', 'shells', 0)).toBe(500)
	expect(effectiveAmount(1, 'barter/9dk7l', 'coins', 0)).toBe(1)
})

test('coupon applicability leaves money unaffected and rounds each material separately', () => {
	const recipe = offer(1)
	recipe.items.push({ ...recipe.items[0], item_id: 'other' })
	expect(evaluateOffer(recipe, 'coins', true, 25)).toEqual({
		money: 100,
		total: 4,
		perItem: [
			{ item_id: 'material', amount: 2 },
			{ item_id: 'other', amount: 2 },
		],
	})
	expect(evaluateOffer(offer(3), 'coins', false, 25).total).toBe(6)
})

test('stock is affordable at exact boundary, shortages exclude money', () => {
	const result = evaluateStock([offer(5), offer(8)], 'none', false, 0, 5)
	expect(result.bestIndex).toBe(0)
	expect(result.rows.map((r) => [r.affordable, r.shortage])).toEqual([
		[true, 0],
		[false, 3],
	])
})

test('cheapest offer wins even when none is affordable; equal totals prefer last', () => {
	expect(
		evaluateStock(
			[offer(8), offer(5), offer(5, 10000)],
			'none',
			false,
			0,
			1
		).bestIndex
	).toBe(2)
	expect(evaluateStock([], 'none', false, 0, 0)).toEqual({
		rows: [],
		bestIndex: 0,
	})
})
