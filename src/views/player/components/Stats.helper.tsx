'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { getLocale } from '@/lib/getLocale'
import type { StatCategory } from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import { formatStatValue } from './playerStatFormat'
import type { PlayerStat } from './Stats.utils'

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
				<span className={`font-mono text-muted-foreground text-xs`}>
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
								className={`wrap-break-word font-mono font-semibold text-base`}
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
