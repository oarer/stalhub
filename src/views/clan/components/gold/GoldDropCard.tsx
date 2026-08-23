'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { GoldDrop } from '@/types/clan/clan.type'
import { mskLabel } from './gold.utils'

interface GoldDropCardProps {
	drop: GoldDrop
	isOfficer: boolean
	isStatusPending: boolean
	isAttendeesPending: boolean
	onClaim: () => void
	onOpenAttendees: () => void
}

export function GoldDropCard({
	drop,
	isOfficer,
	isStatusPending,
	isAttendeesPending,
	onClaim,
	onOpenAttendees,
}: GoldDropCardProps) {
	const t = useTranslations()
	const claimed = drop.status === 'CLAIMED'
	return (
		<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Icon
						className={`text-xl ${claimed ? 'text-amber-500' : 'text-muted-foreground'}`}
						icon={claimed ? 'lucide:check-check' : 'lucide:coins'}
					/>
					<p
						className={`${montserrat.className} font-semibold text-sm`}
					>
						{mskLabel(drop.date)}
					</p>
					<Badge variant={claimed ? 'primary' : 'secondary'}>
						{claimed
							? t('clan.gold.claimed')
							: t('clan.gold.waiting')}
					</Badge>
					<Badge variant="secondary">
						{t('clan.gold.attendeesCount', {
							count: drop.attendees.length,
						})}
					</Badge>
				</div>
				{isOfficer && (
					<div className="flex items-center gap-1">
						{!claimed && (
							<Button
								className="gap-2"
								disabled={isStatusPending}
								onClick={onClaim}
								size="sm"
								variant="secondary"
							>
								<Icon
									className="text-sm"
									icon="lucide:check-check"
								/>
								{t('clan.gold.claimed')}
							</Button>
						)}
						<Button
							className="gap-2"
							disabled={isAttendeesPending}
							onClick={onOpenAttendees}
							size="sm"
							variant="ghost"
						>
							<Icon className="text-sm" icon="lucide:users" />
							{t('clan.gold.mark')}
						</Button>
					</div>
				)}
			</div>

			{drop.attendees.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{drop.attendees.map((a) => (
						<span
							className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-xs"
							key={a.id}
						>
							{a.member.name}
						</span>
					))}
				</div>
			)}
		</div>
	)
}
