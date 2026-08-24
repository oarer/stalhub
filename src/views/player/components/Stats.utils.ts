import type { DBStats, Stat, StatCategory } from '@/types/player.type'
import { DB_STATS_BY_ID } from '@/utils/player/StatParse'

export type PlayerStat = Stat & { meta?: DBStats }

export function enrichPlayerStats(stats: Stat[]): PlayerStat[] {
	return stats.map((stat) => ({ ...stat, meta: DB_STATS_BY_ID[stat.id] }))
}

export function groupPlayerStats(stats: PlayerStat[]) {
	const result: Partial<Record<StatCategory, PlayerStat[]>> = {}

	for (const stat of stats) {
		const category = stat.meta?.category ?? 'NONE'
		result[category] ??= []
		result[category].push(stat)
	}

	return result
}

type FilterOptions = {
	query: string
	category?: StatCategory
	getName: (stat: PlayerStat) => string
}

function normalizeSearchValue(value: string) {
	return value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase()
}

export function filterPlayerStats(
	stats: PlayerStat[],
	{ query, category, getName }: FilterOptions
) {
	const normalizedQuery = normalizeSearchValue(query.trim())

	return stats.filter((stat) => {
		const statCategory = stat.meta?.category ?? 'NONE'
		if (category && statCategory !== category) return false
		if (!normalizedQuery) return true

		return normalizeSearchValue(`${getName(stat)} ${stat.id}`).includes(
			normalizedQuery
		)
	})
}
