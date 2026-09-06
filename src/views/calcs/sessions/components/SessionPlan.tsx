'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { MapEval } from '../utils/sessions'

interface SessionPlanProps {
	best: MapEval | null
	repNeeded: number
	totalMatches: number
	days: number
	targetReached: boolean
}

const row = (
	icon: string,
	label: string,
	value: string,
	highlightClass?: string
) => (
	<div className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5">
		<div className="flex items-center gap-2">
			<Icon className="text-lg text-neutral-400" icon={icon} />
			<p className="text-muted-foreground text-sm">{label}</p>
		</div>
		<Badge variant="secondary">
			<span className={`${montserrat.className} ${highlightClass ?? ''}`}>
				{value}
			</span>
		</Badge>
	</div>
)

export function SessionPlan({
	best,
	repNeeded,
	totalMatches,
	days,
	targetReached,
}: SessionPlanProps) {
	const t = useTranslations()

	if (!best || !best.map) {
		return (
			<Card.Root className="flex flex-col gap-4">
				<Card.Header>
					<Card.Title>
						<Icon
							className="text-neutral-700 text-xl dark:text-neutral-300"
							icon="lucide:route"
						/>
						<h2>{t('sessions.plan')}</h2>
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p className="text-muted-foreground text-sm">
						{t('sessions.select_maps_hint')}
					</p>
				</Card.Content>
			</Card.Root>
		)
	}

	const { profile } = best
	const earned = totalMatches * best.rep

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:route"
					/>
					<h2>{t('sessions.plan')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content className="flex flex-col gap-3">
				{targetReached ? (
					<div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
						<Icon
							className="text-green-500 text-lg"
							icon="lucide:check-circle-2"
						/>
						<p className="font-semibold text-green-700 text-sm dark:text-green-400">
							{t('sessions.already_reached')}
						</p>
					</div>
				) : (
					<>
						<div className="flex flex-col gap-1 rounded-lg bg-primary/10 px-3 py-2.5">
							<p className="flex items-center gap-2 text-muted-foreground text-sm">
								<Icon
									className="text-lg"
									icon="lucide:swords"
								/>
								{t('sessions.best_map')}
							</p>
							<p
								className={`${montserrat.className} font-bold text-lg`}
							>
								{best.map.label}
							</p>
						</div>

						<div className="flex flex-wrap gap-1.5 rounded-lg bg-card px-3 py-2.5">
							<Badge variant="secondary">
								<Icon
									className="mr-1 text-muted-foreground"
									icon="lucide:crosshair"
								/>
								<span
									className={`${montserrat.className} text-xs`}
								>
									{profile.killsTarget} {t('sessions.kills')}
								</span>
							</Badge>
							<Badge variant="secondary">
								<Icon
									className="mr-1 text-muted-foreground"
									icon="lucide:handshake"
								/>
								<span
									className={`${montserrat.className} text-xs`}
								>
									{profile.assists} {t('sessions.assists')}
								</span>
							</Badge>
							<Badge variant="secondary">
								<Icon
									className="mr-1 text-muted-foreground"
									icon="lucide:flag"
								/>
								<span
									className={`${montserrat.className} text-xs`}
								>
									{profile.caps} {t('sessions.caps')}
								</span>
							</Badge>
							<Badge variant="secondary">
								<Icon
									className="mr-1 text-muted-foreground"
									icon="lucide:eye"
								/>
								<span
									className={`${montserrat.className} text-xs`}
								>
									{profile.spots} {t('sessions.spots')}
								</span>
							</Badge>
						</div>

						{!best.maxReached && (
							<div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 dark:bg-amber-900/20">
								<Icon
									className="text-amber-500 text-lg"
									icon="lucide:alert-triangle"
								/>
								<p className="font-semibold text-amber-700 text-sm dark:text-amber-400">
									{t('sessions.max_not_reached')}
								</p>
							</div>
						)}

						{row(
							'lucide:target',
							t('sessions.rep_needed'),
							repNeeded.toLocaleString()
						)}
						{row(
							'lucide:trophy',
							t('sessions.rep_per_match'),
							best.rep.toLocaleString('en-US', {
								maximumFractionDigits: 1,
							})
						)}
						{row(
							'lucide:zap',
							t('sessions.rep_per_day'),
							best.repPerDay.toLocaleString()
						)}
						{row(
							'lucide:calendar-days',
							t('sessions.matches_per_day'),
							best.matchesPerDay.toLocaleString()
						)}
						{row(
							'lucide:list-checks',
							t('sessions.total_matches'),
							totalMatches.toLocaleString()
						)}
						{row(
							'lucide:calendar-range',
							t('sessions.days_label'),
							t('sessions.days', { count: days }),
							'font-bold'
						)}

						{best.matchesPerDay === 0 && (
							<div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-900/20">
								<Icon
									className="text-lg text-red-500"
									icon="lucide:alert-triangle"
								/>
								<p className="font-semibold text-red-700 text-sm dark:text-red-400">
									{t('sessions.not_enough_matches')}
								</p>
							</div>
						)}

						{best.repPerDay > 0 && (
							<div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
								<div className="flex items-center gap-2">
									<Icon
										className="text-green-500 text-lg"
										icon="lucide:flag-checkered"
									/>
									<p className="text-muted-foreground text-xs">
										{t('sessions.earned')}
									</p>
								</div>
								<Badge
									className="bg-green-100 ring-green-200 dark:bg-green-900/50 dark:ring-green-800"
									variant="secondary"
								>
									<span
										className={`${montserrat.className} text-green-700 dark:text-green-300`}
									>
										{earned.toLocaleString()}
										{earned > repNeeded &&
											` (+${(earned - repNeeded).toLocaleString()})`}
									</span>
								</Badge>
							</div>
						)}
					</>
				)}
			</Card.Content>
		</Card.Root>
	)
}
