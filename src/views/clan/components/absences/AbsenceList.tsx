'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import type { Absence } from '@/types/clan/clan.type'
import { EVENT_OPTIONS } from './absence.const'

interface AbsenceListProps {
	date: string
	absences: Absence[]
	memberName: (user_id: number) => string
}

export function AbsenceList({ date, absences, memberName }: AbsenceListProps) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
			<p
				className={`${montserrat.className} flex items-center gap-2 font-semibold text-[15px]`}
			>
				<Icon
					className="text-lg text-muted-foreground"
					icon="lucide:calendar-x"
				/>
				{t('clan.absence.listTitle', { date })}
			</p>
			{absences?.length === 0 && (
				<p className="py-4 text-center font-semibold text-md text-text-accent">
					{t('clan.absence.empty')}
				</p>
			)}
			<div className="flex flex-col gap-2">
				{absences?.map((absence) => (
					<div
						className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
						key={absence.id}
					>
						<div className="flex size-9 flex-none items-center justify-center rounded-full bg-primary/20 font-semibold">
							{memberName(absence.user_id).charAt(0)}
						</div>
						<div className="flex flex-col">
							<div className="flex gap-2">
								<p className="font-semibold text-sm">
									{memberName(absence.user_id)}
								</p>
								<div className="flex flex-wrap gap-1">
									{absence.events.map((e) => (
										<Badge
											className={montserrat.className}
											key={e.event_type}
											variant="secondary"
										>
											{t(
												EVENT_OPTIONS.find(
													(o) =>
														o.value === e.event_type
												)?.label ??
													`clan.events.${e.event_type}`
											)}
											{e.stages?.length
												? ` · ${e.stages.join(', ')}`
												: ''}
										</Badge>
									))}
								</div>
							</div>
							{absence.note && (
								<p className="font-semibold text-muted-foreground text-xs">
									{absence.note}
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
