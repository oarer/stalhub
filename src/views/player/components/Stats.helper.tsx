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
				<div className="bg-primary/15 text-primary rounded-lg p-1.5">
					<Icon aria-hidden="true" icon={icon} />
				</div>
				<h3 className="text-lg font-semibold" id={`stats-${title}`}>
					{t(`player.category.${title}`)}
				</h3>
				<span className={`text-muted-foreground font-mono text-xs`}>
					{stats.length}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{stats.map((stat) => {
					const name =
						messageToString(stat.meta?.name, locale) || stat.id
					return (
						<div
							className="border-muted bg-card/60 hover:border-primary/40 min-w-0 rounded-lg border px-3 py-2.5 transition-colors"
							key={stat.id}
						>
							<p
								className="text-muted-foreground truncate text-sm font-semibold"
								title={name}
							>
								{name}
							</p>
							<p
								className={`font-mono text-base font-semibold wrap-break-word`}
							>
								{formatStatValue(stat, locale, t)}
							</p>
							{!stat.meta && (
								<code
									className="text-muted-foreground block truncate text-xs"
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
