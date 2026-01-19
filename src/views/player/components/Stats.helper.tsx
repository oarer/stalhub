import { useTranslation } from 'react-i18next'

import type { TFunction } from 'i18next'

import { montserrat } from '@/app/fonts'
import { getLocale } from '@/lib/getLocale'
import type { DBStats, Stat, StatCategory } from '@/types/player.type'
import { decimalConfig } from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import { DB_STATS_BY_ID } from '@/utils/player/StatParse'

export function groupPlayerStats(stats: Stat[]) {
	const result: Record<string, (Stat & { meta?: DBStats })[]> = {}

	for (const stat of stats) {
		const meta = DB_STATS_BY_ID[stat.id]
		const category = meta?.category ?? 'NONE'

		if (!result[category]) {
			result[category] = []
		}

		result[category].push({ ...stat, meta })
	}

	return result
}

function formatStatValue(stat: Stat, locale: string, t: TFunction) {
	const { value, type, id } = stat

	switch (type) {
		case 'INTEGER':
			return Number(value).toLocaleString(locale)

		case 'DECIMAL': {
			const config = decimalConfig[id] ?? {
				divisor: 100000,
				precision: 2,
				unit: 'km',
			}

			const decimalValue = Number(value) / config.divisor
			const formatted = decimalValue.toFixed(config.precision)

			return config.unit
				? `${formatted} ${t(`unit.${config.unit}`)}`
				: formatted
		}

		case 'DURATION':
			return (Number(value) / (1000 * 60 * 60)).toFixed(0)

		case 'DATE':
			return value instanceof Date
				? value.toLocaleDateString(locale)
				: new Date(value).toLocaleDateString(locale)

		default:
			return String(value)
	}
}

export function StatsSection({
	title,
	stats,
}: {
	title: StatCategory
	stats: (Stat & { meta?: DBStats })[]
}) {
	const locale = getLocale()
	const { t } = useTranslation()

	if (!stats || stats.length === 0) return null

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<h3 className="text-lg font-semibold">
					{t(`player.category.${title}`)}
				</h3>
			</div>

			<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2 lg:grid-cols-3">
				{stats.map((stat) => (
					<div className="space-y-1" key={stat.id}>
						<p className="text-md font-semibold">
							{messageToString(stat.meta?.name, locale)}
						</p>

						<p
							className={`${montserrat.className} text-sm font-medium`}
						>
							{formatStatValue(stat, locale, t)}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
