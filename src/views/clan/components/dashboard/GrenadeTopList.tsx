'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import type { GrenadeStageEvent } from '@/types/clan/clan.type'
import { Section } from '../../../me/components/Section'

interface GrenadeTopEntry {
	character: string
	total: number
}

interface GrenadeTopListProps {
	latestEvent: GrenadeStageEvent | null
	grenadeTotal: number
	grenadeTop: GrenadeTopEntry[]
}

export function GrenadeTopList({
	latestEvent,
	grenadeTotal,
	grenadeTop,
}: GrenadeTopListProps) {
	const t = useTranslations()

	return (
		<Section
			icon="lucide:bomb"
			title={t('clan.dashboard.grenadesTitle', {
				total: grenadeTotal.toLocaleString(),
			})}
		>
			{latestEvent && (
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent`}
				>
					{t('clan.dashboard.grenadesLine', {
						count: latestEvent.stages.length,
						date: latestEvent.raid_date
							.split('-')
							.reverse()
							.join('.'),
						label: t(`clan.stage.${latestEvent.event_type}`),
					})}
				</p>
			)}
			{grenadeTop.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('clan.dashboard.noGrenades')}
				</p>
			) : (
				<div className="flex flex-col gap-1">
					{grenadeTop.map((g, i) => {
						const maxTotal = grenadeTop[0]?.total ?? 0
						const pct =
							maxTotal > 0 ? (g.total / maxTotal) * 100 : 0
						return (
							<div
								className="flex items-center gap-3 border-border-secondary border-b py-2 last:border-b-0"
								key={g.character}
							>
								<span
									className={`${montserrat.className} w-5 text-center font-bold text-text-accent text-xs`}
								>
									{i + 1}
								</span>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<span className="font-semibold text-sm">
											{g.character}
										</span>
										<span className="font-semibold text-sm">
											{g.total.toLocaleString()}
										</span>
									</div>
									<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-accent">
										<div
											className="h-full rounded-full bg-linear-to-r from-border-secondary to-border transition-all"
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</Section>
	)
}
