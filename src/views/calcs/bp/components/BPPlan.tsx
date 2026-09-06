'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { BPPlan as BPPlanData } from '../utils/bp'

interface BPPlanProps {
	plan: BPPlanData
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

export function BPPlan({ plan }: BPPlanProps) {
	const t = useTranslations()

	const reached = plan.neededXP <= 0

	if (reached) {
		return (
			<Card.Root className="flex flex-col gap-4">
				<Card.Header>
					<Card.Title>
						<Icon
							className="text-neutral-700 text-xl dark:text-neutral-300"
							icon="lucide:route"
						/>
						<h2>{t('bp.plan')}</h2>
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
						<Icon
							className="text-green-500 text-lg"
							icon="lucide:check-circle-2"
						/>
						<p className="font-semibold text-green-700 text-sm dark:text-green-400">
							{plan.donationLevels > 0
								? t('bp.reached_with_donation')
								: t('bp.reached')}
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		)
	}

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:route"
					/>
					<h2>{t('bp.plan')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-1.5 rounded-lg bg-primary/10 px-3 py-2.5">
					<Badge variant="secondary">
						<span className={`${montserrat.className} text-xs`}>
							{plan.currentLevel} → {plan.targetLevel}{' '}
							{t('bp.levels')}
						</span>
					</Badge>
					{plan.donationLevels > 0 && (
						<Badge
							className="bg-green-100 ring-green-200 dark:bg-green-900/50 dark:ring-green-800"
							variant="secondary"
						>
							<span className={`${montserrat.className} text-xs`}>
								{t('bp.donation_levels', {
									count: plan.donationLevels,
								})}
							</span>
						</Badge>
					)}
				</div>

				{row(
					'lucide:target',
					t('bp.xp_needed'),
					plan.neededXP.toLocaleString()
				)}
				{row(
					'lucide:list-checks',
					t('bp.tasks_per_day'),
					plan.tasksPerDay.toLocaleString()
				)}
				{row(
					'lucide:flame',
					t('bp.xp_per_day'),
					plan.xpPerDay.toLocaleString()
				)}
				{row(
					'lucide:calendar-range',
					t('bp.days_to_level'),
					t('bp.days', { count: plan.daysNeeded }),
					'font-bold'
				)}
				{row(
					'lucide:calendar-x',
					t('bp.days_left'),
					t('bp.days', { count: plan.daysLeft }),
					plan.reachable ? '' : 'text-destructive'
				)}

				{plan.reachable ? (
					<div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
						<Icon
							className="text-green-500 text-lg"
							icon="lucide:check-circle-2"
						/>
						<p className="font-semibold text-green-700 text-sm dark:text-green-400">
							{t('bp.reachable')}
						</p>
					</div>
				) : (
					<div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-900/20">
						<Icon
							className="text-destructive text-lg"
							icon="lucide:alert-triangle"
						/>
						<p
							className={`${montserrat.className} font-semibold text-destructive text-sm`}
						>
							{t('bp.not_reachable', {
								daysNeeded: plan.daysNeeded,
								daysLeft: plan.daysLeft,
							})}
						</p>
					</div>
				)}

				{plan.loadBonus > 0 && (
					<div className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5">
						<div className="flex items-center gap-2">
							<Icon
								className="text-lg text-neutral-400"
								icon="lucide:zap"
							/>
							<p className="text-muted-foreground text-sm">
								{t('bp.load_bonus')}
							</p>
						</div>
						<Badge
							className="bg-green-100 ring-green-200 dark:bg-green-900/50 dark:ring-green-800"
							variant="secondary"
						>
							<span
								className={`${montserrat.className} text-green-700 dark:text-green-300`}
							>
								+{plan.loadBonus.toLocaleString()}
							</span>
						</Badge>
					</div>
				)}

				{plan.boostBonus > 0 && (
					<div className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5">
						<div className="flex items-center gap-2">
							<Icon
								className="text-lg text-neutral-400"
								icon="lucide:rocket"
							/>
							<p className="text-muted-foreground text-sm">
								{t('bp.boost_bonus')}
							</p>
						</div>
						<Badge variant="secondary">
							<span
								className={`${montserrat.className} text-green-700 dark:text-green-300`}
							>
								+{plan.boostBonus.toLocaleString()}
							</span>
						</Badge>
					</div>
				)}

				{plan.daysWithoutOverload !== plan.daysNeeded && (
					<div className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5">
						<div className="flex items-center gap-2">
							<Icon
								className="text-lg text-neutral-400"
								icon="lucide:clock"
							/>
							<p className="text-muted-foreground text-sm">
								{t('bp.without_overloads')}
							</p>
						</div>
						<Badge variant="secondary">
							<span
								className={`${montserrat.className} text-muted-foreground`}
							>
								{t('bp.days', {
									count: plan.daysWithoutOverload,
								})}
							</span>
						</Badge>
					</div>
				)}
			</Card.Content>
		</Card.Root>
	)
}
