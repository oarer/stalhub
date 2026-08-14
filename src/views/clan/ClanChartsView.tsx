'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { mskDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import {
	ABSENCE_LOOKBACK_DAYS,
	type AttendanceFilter,
	buildKickRows,
	buildPlayers,
	buildSessionResults,
	buildSquadRows,
	type Metric,
	playerKd,
	playerKda,
} from './components/charts/chart.utils'
import { KickList } from './components/charts/KickList'
import { SessionResultsChart } from './components/charts/SessionResultsChart'
import { SquadKdChart } from './components/charts/SquadKdChart'
import { TopPlayersChart } from './components/charts/TopPlayersChart'

export default function ClanChartsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanChartsContent clanId={clanId} />
}

function ClanChartsContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'
	const [topCount, setTopCount] = useState(10)
	const [metric, setMetric] = useState<Metric>('kd')
	const [attendanceType, setAttendanceType] =
		useState<AttendanceFilter>('ALL')

	const { data: settings } = useSuspenseQuery(clanQueries.getSettings())
	const schedule = settings.schedule

	const from = useMemo(() => {
		const d = new Date()
		d.setUTCDate(d.getUTCDate() - ABSENCE_LOOKBACK_DAYS)
		return mskDate(d)
	}, [])
	const to = mskDate()

	const queryClient = getQueryClient()

	useEffect(() => {
		for (const type of ['ALL', 'TOURNAMENT', 'BRAWL'] as const) {
			queryClient.prefetchQuery(
				clanQueries.getAttendanceSummary(clanId, type, from)
			)
		}
	}, [queryClient, clanId, from])

	const { data: stats } = useSuspenseQuery(clanQueries.getStats(clanId))
	const { data: attendance } = useSuspenseQuery(
		clanQueries.getAttendanceSummary(clanId, attendanceType, from)
	)
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId))
	const { data: squads } = useSuspenseQuery(clanQueries.getSquads(clanId))
	const { data: grenades } = useSuspenseQuery(
		clanQueries.getGrenadeStages(clanId)
	)
	const { data: absences } = useSuspenseQuery(
		clanQueries.getAbsencesRange(clanId, from, to)
	)

	const sessionResults = useMemo(() => buildSessionResults(stats), [stats])
	const players = useMemo(() => buildPlayers(stats), [stats])
	const squadRows = useMemo(
		() => buildSquadRows(squads ?? [], players),
		[squads, players]
	)

	const grenadesByName = useMemo(() => {
		const map = new Map<string, number>()
		for (const event of grenades?.events ?? []) {
			for (const m of event.total ?? []) {
				map.set(
					m.name.trim().toLowerCase(),
					(map.get(m.name.trim().toLowerCase()) ?? 0) + m.grenades
				)
			}
		}
		return map
	}, [grenades])

	const topPlayers = useMemo(() => {
		return players
			.map((p) => ({
				name: p.name,
				value:
					metric === 'kd'
						? playerKd(p)
						: metric === 'kda'
							? playerKda(p)
							: metric === 'kills'
								? p.kills
								: (grenadesByName.get(
										p.name.trim().toLowerCase()
									) ?? 0),
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, topCount)
	}, [players, grenadesByName, metric, topCount])

	const kickRows = useMemo(
		() =>
			buildKickRows({
				members: members ?? [],
				attendance,
				statsPlayers: players,
				absences: (absences ?? []).map((a) => ({
					userId: a.userId,
					date: a.date,
					mandatory:
						a.events?.some(
							(e) =>
								e.eventType === 'TOURNAMENT' ||
								(e.eventType === 'BRAWL' &&
									schedule.brawlsMandatory)
						) ?? false,
				})),
				schedule,
			}),
		[members, attendance, players, absences, schedule]
	)

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2 rounded-xl bg-background px-2 py-1.5">
					{([5, 10, 35] as const).map((n) => (
						<Button
							className={cn(
								'font-semibold',
								topCount === n && 'bg-accent'
							)}
							key={n}
							onClick={() => setTopCount(n)}
							size={'sm'}
							type="button"
							variant={'ghost'}
						>
							{n === 35
								? t('clan.charts.topAll')
								: t('clan.charts.topCount', { n })}
						</Button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SessionResultsChart
					isDark={isDark}
					sessionResults={sessionResults}
				/>
				<SquadKdChart isDark={isDark} squadRows={squadRows} />
				<TopPlayersChart
					isDark={isDark}
					metric={metric}
					onMetricChange={setMetric}
					topCount={topCount}
					topPlayers={topPlayers}
				/>
			</div>
			<Alert.Root variant={'warning'}>
				<Alert.Title>{t('clan.charts.testFeatureTitle')}</Alert.Title>
				<Alert.Description>
					{t('clan.charts.testFeatureDesc')}
				</Alert.Description>
			</Alert.Root>
			<KickList
				attendanceType={attendanceType}
				onAttendanceTypeChange={setAttendanceType}
				rows={kickRows}
				schedule={schedule}
			/>
		</div>
	)
}
