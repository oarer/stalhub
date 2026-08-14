'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { dateSince } from '@/lib/time'
import type { Session } from '@/types/user.type'
import { Section } from '../Section'

export function SessionsSection({
	sessions,
	onDelete,
	onDeleteAll,
}: {
	sessions: Session[] | undefined
	onDelete: (id: number) => void
	onDeleteAll: () => void
}) {
	const t = useTranslations()

	return (
		<Section
			className="relative"
			icon="lucide:laptop"
			title={t('me.settings.sessions')}
		>
			{sessions && sessions.length > 1 && (
				<Button
					className="absolute top-4 right-4 ring-0"
					onClick={onDeleteAll}
					size="sm"
					variant="danger"
				>
					{t('me.settings.endAll')}
				</Button>
			)}

			<div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
				{sessions?.map((session) => (
					<div
						className={cn(
							'flex flex-col gap-2 rounded-lg bg-background p-4',
							session.is_self && 'border-2 border-border/50'
						)}
						key={session.id}
					>
						<div className="flex flex-col gap-1">
							<span
								className={`${montserrat.className} font-semibold text-sm`}
							>
								{session.browser} · {session.browser_version}
							</span>
						</div>
						{session.ip && (
							<p
								className={`${montserrat.className} font-semibold text-text-accent text-xs`}
							>
								IP:{' '}
								<span className="blur-xs transition-all hover:blur-none">
									{session.ip}
								</span>
							</p>
						)}
						<p
							className={`${montserrat.className} font-semibold text-text-accent text-xs`}
						>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{dateSince(session.last_accessed, t)}{' '}
									{t('me.settings.ago')}
								</Tooltip.Trigger>
								<Tooltip.Content>
									{formatDate(session.last_accessed)}
								</Tooltip.Content>
							</Tooltip.Root>
						</p>
						<Button
							className="w-full py-1"
							onClick={() => onDelete(session.id)}
							variant="danger"
						>
							<Icon
								className="text-lg text-red-400"
								icon="lucide:x"
							/>
						</Button>
					</div>
				))}
			</div>
		</Section>
	)
}
