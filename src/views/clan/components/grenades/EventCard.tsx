'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import type { GrenadeBoxEntry, GrenadeStageEvent } from '@/types/clan/clan.type'

function formatDate(raidDate: string) {
	const [y, m, d] = raidDate.split('-')
	return `${d}.${m}.${y}`
}

function BoxesSummary({ boxes }: { boxes: GrenadeBoxEntry[] }) {
	const t = useTranslations()
	if (boxes.length === 0) return null

	const grouped = boxes.reduce(
		(acc, b) => {
			acc[b.type] = (acc[b.type] ?? 0) + b.count
			return acc
		},
		{} as Record<string, number>
	)

	const totalGrenades = boxes.reduce((s, b) => s + b.count * 10, 0)

	return (
		<div className="flex flex-wrap items-center gap-2">
			{Object.entries(grouped).map(([type, count]) => (
				<Badge key={type} variant="secondary">
					{type}: {count} {t('clan.grenades.boxes')}
				</Badge>
			))}
			<Badge variant="secondary">
				{t('clan.grenades.totalGrenades', {
					count: totalGrenades,
				})}
			</Badge>
		</div>
	)
}

export function EventCard({ event }: { event: GrenadeStageEvent }) {
	const t = useTranslations()
	const members = event.total
	const maxTotal = members[0]?.grenades ?? 0
	const cols = event.stages.length

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-background px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:bomb" />
				{t(`clan.stage.${event.event_type}`) || event.event_type} —{' '}
				{formatDate(event.raid_date)}
				<Badge variant="secondary">
					{t('clan.grenades.stageCount', { count: cols })}
				</Badge>
			</div>
			<BoxesSummary boxes={event.boxes} />
			{members.length === 0 ? (
				<p className="py-2 text-neutral-500 text-sm">
					{t('clan.grenades.noData')}
				</p>
			) : (
				<div className="mt-2 flex flex-col gap-1">
					<div
						className="grid items-center gap-2 border-border-secondary border-b px-2 py-1 font-semibold text-neutral-500 text-xs"
						style={{
							gridTemplateColumns: `minmax(0, 1.4fr) repeat(${cols}, minmax(2.5rem, 1fr)) auto`,
						}}
					>
						<span>{t('clan.grenades.player')}</span>
						{event.stages.map((s) => (
							<span className="text-center" key={s.stage}>
								{t('clan.grenades.stage', {
									stage: s.stage,
								})}
							</span>
						))}
						<span className="text-right">
							{t('clan.grenades.total')}
						</span>
					</div>
					{members.map((m) => {
						const row = event.stages.map((s) => {
							const found = s.members.find(
								(sm) => sm.name === m.name
							)
							return found?.grenades ?? 0
						})
						const playerBoxes = event.boxes.filter(
							(b) => b.name === m.name
						)
						const playerBoxGrenades =
							playerBoxes.reduce((s, b) => s + b.count * 10, 0)
						return (
							<div
								className="grid items-center gap-2 border-border-secondary border-b px-2 py-2 last:border-b-0"
								key={m.name}
								style={{
									gridTemplateColumns: `minmax(0, 1.4fr) repeat(${cols}, minmax(2.5rem, 1fr)) auto`,
								}}
							>
								<div className="min-w-0 truncate">
									<span className="font-semibold text-sm">
										{m.name}
									</span>
									{playerBoxGrenades > 0 && (
										<span className="ml-1 text-neutral-500 text-xs">
											({playerBoxGrenades}{' '}
											{t('clan.grenades.fromBoxes')})
										</span>
									)}
								</div>
								{row.map((g, i) => (
									<span
										className="text-center font-semibold text-sm tabular-nums"
										key={i}
									>
										{g}
									</span>
								))}
								<span className="flex items-center gap-1.5">
									<span className="text-right font-semibold text-sm tabular-nums">
										{m.grenades}
									</span>
									<div className="h-1.5 w-14 overflow-hidden rounded-full bg-accent">
										<div
											className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400"
											style={{
												width: `${
													maxTotal > 0
														? (
																m.grenades /
																	maxTotal
															) * 100
														: 0
												}%`,
											}}
										/>
									</div>
								</span>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
