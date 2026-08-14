import type { Item } from '@/types/arsenal.type'
import type { Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export type ArsenalRow = Item & {
	neededCount: number
	totalPrice: number
	totalWeight: number
	days: number
	limitExceeded: boolean
}

function getItemKey(item: Item, locale: Locale) {
	return `${messageToString(item.name, locale)}-${item.currentPrice}`
}

function calculateNeededItems(
	items: Item[],
	targetReputation: number,
	locale: Locale
) {
	const counts: Record<string, number> = {}

	if (targetReputation <= 0) return counts

	for (const item of items) {
		const key = getItemKey(item, locale)

		if (item.reputation <= 0) {
			counts[key] = 0
			continue
		}

		counts[key] = Math.ceil(targetReputation / item.reputation)
	}

	return counts
}

export function calculateReputationCoverage(
	items: Item[],
	targetReputation: number
) {
	const limitedMaxRep = items.reduce((sum, item) => {
		const limit = Number(item.limit ?? 0)
		const reputation = Number(item.reputation ?? 0)

		if (limit > 0 && reputation > 0) return sum + limit * reputation

		return sum
	}, 0)

	return {
		limitedMaxRep,
		remaining: Math.max(0, targetReputation - limitedMaxRep),
	}
}

export function buildArsenalRows(
	items: Item[],
	targetReputation: number,
	locale: Locale
): ArsenalRow[] {
	const counts = calculateNeededItems(items, targetReputation, locale)
	return items.map((item) => {
		const neededCount = counts[getItemKey(item, locale)] ?? 0
		const limit = Number(item.limit ?? 0)
		const isLimited = limit > 0
		const days =
			isLimited && neededCount > 0 ? Math.ceil(neededCount / limit) : 1

		return {
			...item,
			currentPrice: Number(item.currentPrice ?? 0),
			reputation: Number(item.reputation ?? 0),
			weight: Number(item.weight ?? 0),
			limit: isLimited ? limit : undefined,
			neededCount,
			days,
			limitExceeded: isLimited && neededCount > limit,
			totalPrice: neededCount * Number(item.currentPrice ?? 0),
			totalWeight: neededCount * Number(item.weight ?? 0),
		}
	})
}
