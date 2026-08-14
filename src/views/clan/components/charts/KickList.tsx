'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { cn } from '@/lib/cn'
import type { ClanSchedule } from '@/types/clan/clan.type'
import { TOURNAMENT_DAYS } from '@/types/clan/clan.type'
import {
	ABSENCE_RATE_THRESHOLD,
	ATTENDANCE_FILTERS,
	ATTENDANCE_THRESHOLD,
	type AttendanceFilter,
	KD_REF,
	type KickRow,
} from './chart.utils'

interface KickListProps {
	rows: KickRow[]
	attendanceType: AttendanceFilter
	onAttendanceTypeChange: (value: AttendanceFilter) => void
	schedule: ClanSchedule
}

function chanceColor(chance: number) {
	if (chance >= 70) return 'bg-red-500'
	if (chance >= 40) return 'bg-orange-500'
	return 'bg-yellow-500'
}

export function KickList({
	rows,
	attendanceType,
	onAttendanceTypeChange,
	schedule,
}: KickListProps) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-background px-5 py-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Icon
						className="text-red-500 text-xl"
						icon="lucide:user-x"
					/>
					<p className="font-semibold">
						{t('clan.charts.kickTitle')}
					</p>
					<Tooltip.Root position="top">
						<Tooltip.Trigger underline={false}>
							<Icon
								className="size-4 text-text-accent"
								icon="lucide:circle-help"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<div className="flex flex-col gap-1.5 py-0.5">
								<p className="text-text-accent">
									{t('clan.charts.scheduleTooltip', {
										tournament: TOURNAMENT_DAYS,
										brawl: schedule.brawlsPerWeek,
										mandatory: schedule.brawlsMandatory
											? 'yes'
											: 'no',
									})}
								</p>
								<p>
									{t('clan.charts.kickCriteria', {
										attendance: Math.round(
											ATTENDANCE_THRESHOLD * 100
										),
										absences: Math.round(
											ABSENCE_RATE_THRESHOLD * 100
										),
									})}
								</p>
								<p>
									{t('clan.charts.kickChanceHint', {
										kd: KD_REF,
									})}
								</p>
								<p className="text-text-accent">
									{t('clan.charts.attendanceHint')}
								</p>
							</div>
						</Tooltip.Content>
					</Tooltip.Root>
					{rows.length > 0 && (
						<Badge variant="secondary">
							<span className={montserrat.className}>
								{rows.length}
							</span>
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2 rounded-xl bg-accent/40 px-2 py-1.5">
					{ATTENDANCE_FILTERS.map((f) => (
						<button
							className={cn(
								'rounded-lg px-2.5 py-1 font-semibold text-sm transition-colors',
								attendanceType === f.value
									? 'bg-accent'
									: 'text-text-accent hover:text-text'
							)}
							key={f.value}
							onClick={() => onAttendanceTypeChange(f.value)}
							type="button"
						>
							{t(f.label)}
						</button>
					))}
				</div>
			</div>

			{rows.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-10 text-text-accent">
					<Icon className="text-4xl" icon="lucide:shield-check" />
					<p className="font-bold">{t('clan.charts.noCandidates')}</p>
				</div>
			) : (
				<div className="mt-3 overflow-x-auto">
					<div className="flex min-w-160 flex-col gap-2">
						{rows.map((row) => (
							<div
								className="flex items-center gap-3 rounded-lg bg-accent/50 p-3"
								key={row.name}
							>
								<div className="flex size-9 flex-none items-center justify-center overflow-hidden rounded-full">
									{row.user ? (
										<Avatar
											height={36}
											id={row.user.id}
											username={row.user.username}
											width={36}
										/>
									) : (
										<div className="flex size-9 items-center justify-center rounded-full bg-red-500/15 font-semibold text-red-500">
											{row.name.charAt(0)}
										</div>
									)}
								</div>
								<div className="w-44 flex-none">
									<div className="flex items-center gap-1.5">
										<p className="truncate font-semibold text-sm">
											{row.name}
										</p>
										{row.user && (
											<HoverUserCard id={row.user.id}>
												<Link
													className={`${montserrat.className} truncate font-semibold text-text-accent text-xs`}
													href={`/users/${row.user.id}`}
												>
													{row.user.name}
												</Link>
											</HoverUserCard>
										)}
									</div>
									<p className="font-semibold text-xs">
										{t(`player.rank.${row.rank}`)}
									</p>
								</div>
								<div className="flex flex-1 flex-wrap items-center gap-1.5">
									<Badge variant="secondary">
										{t('clan.charts.kdBadge', {
											value: row.kd.toFixed(2),
										})}
									</Badge>
									<Badge
										className={`${montserrat.className} text-[11px]`}
										variant="secondary"
									>
										{t('clan.charts.attendanceBadge', {
											value:
												row.attendedRate === null
													? '—'
													: `${Math.round(row.attendedRate * 100)}% (${row.attended}/${row.total})`,
										})}
									</Badge>
									<Badge variant="secondary">
										{t('clan.charts.absenceBadge', {
											value:
												row.absenceRate === null
													? '—'
													: `${Math.round(row.absenceRate * 100)}% (${row.absenceDays}/${row.mandatoryDays})`,
										})}
									</Badge>
								</div>
								<div className="flex w-36 flex-none flex-col gap-1">
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-text-accent text-xs">
											{t('clan.charts.kickChanceLabel')}
										</span>
										<span className="font-semibold text-sm">
											{row.chance}%
										</span>
									</div>
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-border-secondary">
										<div
											className={cn(
												'h-full rounded-full transition-all',
												chanceColor(row.chance)
											)}
											style={{
												width: `${row.chance}%`,
											}}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
