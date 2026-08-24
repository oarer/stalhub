'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { getLocale } from '@/lib/getLocale'
import type { Stat, StatCategory } from '@/types/player.type'
import { decimalConfig } from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import type { PlayerStat } from './Stats.utils'

type TFunction = ReturnType<typeof useTranslations>

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
			const formatted = (Number(value) / config.divisor).toLocaleString(
				locale,
				{
					maximumFractionDigits: config.precision,
					minimumFractionDigits: config.precision,
				}
			)
			return config.unit
				? `${formatted} ${t(`unit.${config.unit}`)}`
				: formatted
		}
		case 'DURATION': {
			const hours = Number(value) / (1000 * 60 * 60)
			return `${hours.toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('unit.hours')}`
		}
		case 'DATE': {
			const date = value instanceof Date ? value : new Date(value)
			return Number.isNaN(date.getTime())
				? String(value)
				: date.toLocaleDateString(locale)
		}
		default:
			return String(value)
	}
}

type StatsSectionProps = {
	title: StatCategory
	icon: string
	stats: PlayerStat[]
}

export function StatsSection({ title, icon, stats }: StatsSectionProps) {
	const locale = getLocale()
	const t = useTranslations()
	if (stats.length === 0) return null

	return (
		<section aria-labelledby={`stats-${title}`} className="space-y-3">
			<div className="flex items-center gap-2">
				<div className="rounded-lg bg-primary/15 p-1.5 text-primary">
					<Icon aria-hidden="true" icon={icon} />
				</div>
				<h3 className="font-semibold text-lg" id={`stats-${title}`}>
					{t(`player.category.${title}`)}
				</h3>
				<span
					className={`${montserrat.className} text-muted-foreground text-xs`}
				>
					{stats.length}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{stats.map((stat) => {
					const name =
						messageToString(stat.meta?.name, locale) || stat.id
					return (
						<div
							className="min-w-0 rounded-lg border border-muted bg-card/60 px-3 py-2.5 transition-colors hover:border-primary/40"
							key={stat.id}
						>
							<p
								className="truncate font-semibold text-muted-foreground text-sm"
								title={name}
							>
								{name}
							</p>
							<p
								className={`${montserrat.className} wrap-break-word font-semibold text-base`}
							>
								{formatStatValue(stat, locale, t)}
							</p>
							{!stat.meta && (
								<code
									className="block truncate text-muted-foreground text-xs"
									title={stat.id}
								>
									{stat.id}
								</code>
							)}
						</div>
					)
				})}
			</div>
		</section>
	)
}
