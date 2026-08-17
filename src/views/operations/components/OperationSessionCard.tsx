'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { OperationSession } from '@/types/operations/operation.type'

export function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = Math.round(seconds % 60)
	if (mins <= 0) return `${secs}s`
	return `${mins}m ${secs}s`
}

export default function OperationSessionCard({
	session,
}: {
	session: OperationSession
}) {
	const t = useTranslations()

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 items-center gap-2">
						<Icon
							className="shrink-0 text-xl"
							icon="lucide:siren"
						/>
						<h2 className="truncate font-semibold">
							{t('player.operations.type.' + session.map)}
						</h2>
					</div>
					<Badge>
						{t('player.operations.difficulty')}{' '}
						<span className={`${montserrat.className}`}>
							{session.difficulty}
						</span>
					</Badge>
				</div>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-accent">
					<span
						className={`${montserrat.className} flex items-center gap-1 text-xs`}
					>
						<Icon className="text-base" icon="lucide:calendar" />
						{formatDate(session.startTime, 'datetime')}
					</span>
					<span
						className={`${montserrat.className} flex items-center gap-1 text-xs`}
					>
						<Icon className="text-base" icon="lucide:timer" />
						{formatDuration(session.sessionDurationSeconds)}
					</span>
					<span className="flex items-center gap-1">
						<Icon className="text-base" icon="lucide:gift" />
						{session.difficultyReward}
					</span>
					<span className="flex items-center gap-1">
						<Icon className="text-base" icon="lucide:users" />
						{t('player.operations.participants', {
							count: session.participants.length,
						})}
					</span>
				</div>

				{session.participants.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{session.participants.map((p) => (
							<span
								className="rounded-md bg-background px-1.5 py-0.5 font-semibold text-text-accent text-xs"
								key={p.username}
							>
								{p.username}
							</span>
						))}
					</div>
				)}
			</Card.Content>
		</Card.Root>
	)
}
