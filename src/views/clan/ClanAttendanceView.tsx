'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Tooltip } from '@/components/ui/Tooltip'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { AttendanceStatus } from '@/types/clan/clan.type'
import ClanAbsenceView from './components/absences/ClanAbsenceView'

const STATUS_ICON: Record<AttendanceStatus, string> = {
	PRESENT: 'lucide:circle-check',
	ABSENT: 'lucide:circle-x',
	EXCUSED: 'lucide:message-square-text',
	LATE: 'lucide:clock-3',
}

const STATUS_COLOR: Record<AttendanceStatus, string> = {
	PRESENT: 'text-emerald-500',
	ABSENT: 'text-destructive',
	EXCUSED: 'text-amber-500',
	LATE: 'text-sky-500',
}

function currentMonth() {
	const parts = new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		timeZone: 'Europe/Moscow',
	}).formatToParts(new Date())
	const year = parts.find((part) => part.type === 'year')?.value
	const month = parts.find((part) => part.type === 'month')?.value
	return `${year}-${month}`
}

function shiftMonth(month: string, offset: number) {
	const [year, monthNumber] = month.split('-').map(Number)
	const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export default function ClanAttendanceView() {
	const t = useTranslations('clan.attendance')
	const locale = useLocale()
	const [month, setMonth] = useState(currentMonth)
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return (
		<AttendanceContent
			clanId={clanId}
			locale={locale}
			month={month}
			setMonth={setMonth}
			t={t}
		/>
	)
}

function AttendanceContent({
	clanId,
	locale,
	month,
	setMonth,
	t,
}: {
	clanId: string
	locale: string
	month: string
	setMonth: (month: string) => void
	t: ReturnType<typeof useTranslations<'clan.attendance'>>
}) {
	const { data } = useSuspenseQuery(
		clanQueries.getAttendanceMonth(clanId, month)
	)
	const monthLabel = new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Moscow',
	}).format(new Date(`${month}-01T12:00:00+03:00`))

	return (
		<div className="flex flex-col gap-4">
			<ClanAbsenceView />
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-bold text-2xl">{t('title')}</h1>
				<div className="flex items-center gap-2 rounded-xl bg-card p-1">
					<Button
						onClick={() => setMonth(shiftMonth(month, -1))}
						variant="secondary"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span
						className={`${montserrat.className} min-w-40 text-center font-semibold capitalize`}
					>
						{monthLabel}
					</span>
					<Button
						disabled={month >= currentMonth()}
						onClick={() => setMonth(shiftMonth(month, 1))}
						variant="secondary"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-4 rounded-xl bg-card p-3 text-sm">
				{(
					[
						'PRESENT',
						'ABSENT',
						'EXCUSED',
						'LATE',
					] as AttendanceStatus[]
				).map((status) => (
					<div className="flex items-center gap-1.5" key={status}>
						<Icon
							className={STATUS_COLOR[status]}
							icon={STATUS_ICON[status]}
						/>
						<span className="font-semibold">
							{t(`status.${status}`)}
						</span>
					</div>
				))}
			</div>

			{data.days.every((day) => day.sessions.length === 0) ? (
				<div className="rounded-xl bg-card p-10 text-center text-foreground/60">
					{t('empty')}
				</div>
			) : (
				<div className="overflow-hidden rounded-xl bg-card">
					<Table.Root className="border-collapse">
						<Table.Header>
							<Table.Row>
								<Table.Head className="sticky left-0 z-20 min-w-48 bg-card p-3">
									{t('member')}
								</Table.Head>
								{data.days.map((day) => {
									const date = new Date(
										`${day.date}T12:00:00+03:00`
									)
									return (
										<Table.Head
											className="min-w-20 p-2 text-center"
											key={day.date}
										>
											<div
												className={`${montserrat.className} font-semibold`}
											>
												{Number(day.date.slice(-2))}
											</div>
											<div className="text-foreground/50 text-xs">
												{new Intl.DateTimeFormat(
													locale,
													{
														weekday: 'short',
														timeZone:
															'Europe/Moscow',
													}
												).format(date)}
											</div>
										</Table.Head>
									)
								})}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{data.members.map((member) => (
								<Table.Row key={member.name}>
									<Table.Head
										className="sticky left-0 z-10 h-auto min-w-48 bg-card p-3"
										scope="row"
									>
										{member.name}
									</Table.Head>
									{data.days.map((day) => (
										<Table.Cell
											className="text-center"
											key={day.date}
										>
											<div className="flex justify-center gap-1">
												{(
													member.days[day.date] ?? []
												).map((entry) => {
													const session =
														day.sessions.find(
															(session) =>
																session.id ===
																entry.session_id
														)

													const sessionLabel = session
														? [
																t(
																	`type.${session.type}`
																),
																session.stage_number !=
																	null &&
																	`#${session.stage_number}`,
															]
																.filter(Boolean)
																.join(' · ')
														: `#${entry.session_id}`

													const statusLabel = t(
														`status.${entry.status}`
													)

													const label = [
														sessionLabel,
														statusLabel,
														entry.note,
													]
														.filter(Boolean)
														.join(' — ')

													return (
														<Tooltip.Root
															key={
																entry.session_id
															}
														>
															<Tooltip.Trigger
																asChild
															>
																<button
																	aria-label={
																		label
																	}
																	className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
																	type="button"
																>
																	<Icon
																		className={`text-xl ${STATUS_COLOR[entry.status]}`}
																		icon={
																			STATUS_ICON[
																				entry
																					.status
																			]
																		}
																	/>
																</button>
															</Tooltip.Trigger>
															<Tooltip.Content>
																{label}
															</Tooltip.Content>
														</Tooltip.Root>
													)
												})}
											</div>
										</Table.Cell>
									))}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			)}
		</div>
	)
}
