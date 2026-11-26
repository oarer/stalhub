'use client'

import { useTranslations } from 'next-intl'
import type { GrenadeStageEvent } from '@/types/clan/clan.type'
import { Section } from '../../../me/components/Section'

interface GrenadeTopEntry {
	character: string
	total: number
}

interface GrenadeTopListProps {
	latestEvent: GrenadeStageEvent | null
	grenadeTop: GrenadeTopEntry[]
}

export function GrenadeTopList({
	latestEvent,
	grenadeTop,
}: GrenadeTopListProps) {
	const t = useTranslations()

	return (
		<Section icon="lucide:bomb" title={t('clan.dashboard.grenadesTitle')}>
			{latestEvent && (
				<p
					className={`text-foreground font-mono text-[13px] font-medium`}
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
				<p className="text-foreground text-sm font-medium">
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
								className="border-muted flex items-center gap-3 border-b py-2 last:border-b-0"
								key={g.character}
							>
								<span
									className={`text-foreground w-5 text-center font-mono text-xs font-medium`}
								>
									{i + 1}
								</span>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">
											{g.character}
										</span>
										<span
											className={`font-mono text-sm font-medium`}
										>
											{g.total.toLocaleString()}
										</span>
									</div>
									<div className="bg-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
										<div
											className="from-muted/50 to-primary h-full rounded-full bg-linear-to-r transition-all"
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
