import type { Item } from '@/types/arsenal.type'
import type { Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export type ArsenalRow = Item & {
	neededCount: number
	totalPrice: number
	totalWeight: number
}

function getItemKey(item: Item, locale: Locale) {
	return `${messageToString(item.name, locale)}-${item.currentPrice}`
}

export function calculateNeededItems(
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

export function buildArsenalRows(
	items: Item[],
	targetReputation: number,
	locale: Locale
): ArsenalRow[] {
	const counts = calculateNeededItems(items, targetReputation, locale)
return items.map((item) => {
  const neededCount = counts[getItemKey(item, locale)] ?? 0

  return {
    ...item,
    currentPrice: Number(item.currentPrice ?? 0),
    reputation: Number(item.reputation ?? 0),
    weight: Number(item.weight ?? 0),
    neededCount,
    totalPrice: neededCount * Number(item.currentPrice ?? 0),
    totalWeight: neededCount * Number(item.weight ?? 0),
  }
})
}
