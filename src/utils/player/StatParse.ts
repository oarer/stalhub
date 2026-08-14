import type { Message } from '@/types/item.type'
import type { DBStats, Stat, StatCategory, StatType } from '@/types/player.type'
import dbStatsJson from './stats.json'

const dbStats: DBStats[] = dbStatsJson.map((s) => ({
	id: s.id,
	category: s.category as StatCategory,
	type: s.type as StatType,
	name: s.name as Message,
}))

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
): number | string | Date {
	const stat = stats.find(
		(s) =>
			s.id === id || s.meta?.id === id || DB_STATS_BY_ID[s.id]?.id === id
	)

	return stat?.value ?? 0
}

