import { BarterCoins, CrimsonShell } from '@/constants/barter.const'
import type { BarterRecipeResult } from '@/types/barter.type'
import { applyDiscount } from '@/utils/barterUtils'

export type CalcCurrency = 'none' | 'coins' | 'shells'

export type CouponRank =
	| 'picklock'
	| 'newbie'
	| 'stalker'
	| 'veteran'
	| 'master'

export const COUPON_RANKS: CouponRank[] = [
	'picklock',
	'newbie',
	'stalker',
	'veteran',
	'master',
]

const colorToRank: Record<string, CouponRank | null> = {
	DEFAULT: 'picklock',
	RANK_NEWBIE: 'newbie',
	RANK_STALKER: 'stalker',
	RANK_VETERAN: 'veteran',
	RANK_MASTER: 'master',
	RANK_LEGEND: null,
	QUEST_ITEM: null,
}

export function itemRankFromColor(color?: string): CouponRank | null {
	if (!color) return null
	return colorToRank[color] ?? null
}

function coefTable(currency: CalcCurrency) {
	return currency === 'coins' ? BarterCoins : CrimsonShell
}

export function coefFor(category: string, currency: CalcCurrency): number {
	if (currency === 'none') return 1
	const itemId = category.split('/').pop() ?? ''
	return coefTable(currency)[itemId] ?? 1
}

export function effectiveAmount(
	amount: number,
	category: string,
	currency: CalcCurrency,
	discount: number
): number {
	const raw = amount * coefFor(category, currency)
	return applyDiscount(raw, discount)
}

export type OfferEvaluation = {
	index: number
	money: number
	total: number
	perItem: { item_id: string; amount: number }[]
}

export function evaluateOffer(
	offer: BarterRecipeResult,
	currency: CalcCurrency,
	couponApplies: boolean,
	discount: number
): Omit<OfferEvaluation, 'index'> {
	const d = couponApplies ? discount : 0
	const perItem = offer.items.map((item) => ({
		item_id: item.item_id,
		amount: effectiveAmount(item.amount, item.category, currency, d),
	}))
	return {
		money: Number(offer.money ?? 0),
		total: perItem.reduce((acc, cur) => acc + cur.amount, 0),
		perItem,
	}
}

export type StockEvaluation = OfferEvaluation & {
	affordable: boolean
	shortage: number
}

export function evaluateStock(
	offers: BarterRecipeResult[],
	currency: CalcCurrency,
	couponApplies: boolean,
	discount: number,
	stock: number
): { rows: StockEvaluation[]; bestIndex: number } {
	const rows: StockEvaluation[] = offers.map((offer, index) => {
		const ev = evaluateOffer(offer, currency, couponApplies, discount)
		const affordable = ev.total <= stock
		return {
			index,
			...ev,
			affordable,
			shortage: affordable ? 0 : ev.total - stock,
		}
	})
	let bestIndex = 0
	const affordable = rows.filter((r) => r.affordable)
	if (affordable.length > 0) {
		bestIndex = affordable.reduce((a, b) =>
			b.total <= a.total ? b : a
		).index
	} else if (rows.length > 0) {
		bestIndex = rows.reduce((a, b) => (b.total <= a.total ? b : a)).index
	}
	return { rows, bestIndex }
}
