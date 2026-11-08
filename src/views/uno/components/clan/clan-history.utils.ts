import type { UnoHistoryItem } from '@/types/uno/uno.type'

export interface HistoryTotals {
	matches: number
	wins: number
	losses: number
	winRate: number | null
	sleeves: number
	clanMoney: number
	clanInfluence: number
}

export interface HistoryBreakdownRow {
	key: string
	matches: number
	wins: number
	losses: number
	winRate: number | null
	sleeves: number
}

export function getHistorySleeves(item: UnoHistoryItem): number {
	return item.actor?.creditedSleeves ?? item.actor?.reward?.sleeves ?? 0
}

export function sortHistoryItems(items: UnoHistoryItem[]): UnoHistoryItem[] {
	return [...items].sort((left, right) =>
		(right.time ?? right.date ?? '').localeCompare(
			left.time ?? left.date ?? ''
		)
	)
}

export function getHistoryTotals(items: UnoHistoryItem[]): HistoryTotals {
	let wins = 0
	let losses = 0
	let sleeves = 0
	let clanMoney = 0
	let clanInfluence = 0

	for (const item of items) {
		if (item.outcome === 'win') wins += 1
		else if (item.outcome === 'loss') losses += 1
		sleeves += getHistorySleeves(item)
		clanMoney += item.actor?.reward?.clanMoney ?? 0
		clanInfluence += item.actor?.reward?.clanInfluence ?? 0
	}

	return {
		matches: items.length,
		wins,
		losses,
		winRate: items.length > 0 ? wins / items.length : null,
		sleeves,
		clanMoney,
		clanInfluence,
	}
}

export function buildHistoryBreakdown(
	items: UnoHistoryItem[],
	getKey: (item: UnoHistoryItem) => string | null
): HistoryBreakdownRow[] {
	const rows = new Map<string, HistoryBreakdownRow>()

	for (const item of items) {
		const key = getKey(item)
		if (!key) continue
		const row = rows.get(key) ?? {
			key,
			matches: 0,
			wins: 0,
			losses: 0,
			winRate: null,
			sleeves: 0,
		}
		row.matches += 1
		if (item.outcome === 'win') row.wins += 1
		else if (item.outcome === 'loss') row.losses += 1
		row.sleeves += getHistorySleeves(item)
		rows.set(key, row)
	}

	return [...rows.values()]
		.map((row) => ({
			...row,
			winRate: row.matches > 0 ? row.wins / row.matches : null,
		}))
		.sort((left, right) => right.matches - left.matches)
}
