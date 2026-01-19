import type { Message } from '@/types/item.type'
import dbStatsJson from './stats.json'
import type { DBStats, Stat, StatCategory, StatType } from '@/types/player.type'

const dbStats: DBStats[] = dbStatsJson.map((s) => ({
	id: s.id,
	category: s.category as StatCategory,
	type: s.type as StatType,
	name: s.name as Message,
}))

export const STATS_MAP = dbStats.reduce(
	(acc, s) => {
		acc[s.id] = s.name
		return acc
	},
	{} as Record<DBStats['id'], Message>
)

export const DB_STATS_BY_ID = dbStats.reduce(
	(acc, s) => {
		acc[s.id] = s
		return acc
	},
	{} as Record<DBStats['id'], DBStats>
)

export function getStatValue(
	stats: (Stat & { meta?: DBStats })[],
	id: string
): number {
	const stat = stats.find(
		(s) =>
			s.id === id || s.meta?.id === id || DB_STATS_BY_ID[s.id]?.id === id
	)

	if (!stat) return 0

	if (typeof stat.value !== 'number') {
		return 0
	}

	return stat.value
}

export type StatKey = keyof typeof STATS_MAP
