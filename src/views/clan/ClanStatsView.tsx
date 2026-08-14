'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import ClanChartsView from './ClanChartsView'
import { formatKd } from './clan.utils'
import { StatCard } from './components/dashboard/StatCard'
import { PlayerList } from './components/stats/PlayerList'
import { buildPlayers } from './components/stats/stats.utils'

export default function ClanStatsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null
	return <ClanStatsContent clanId={clanId} />
}

function ClanStatsContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { data: stats, isLoading } = useSuspenseQuery(
		clanQueries.getStats(clanId)
	)
	const { data: grenadeAllTime } = useSuspenseQuery(
		clanQueries.getGrenadeAllTime(clanId)
	)
	const { data: grenadeStages } = useSuspenseQuery(
		clanQueries.getGrenadeStages(clanId)
	)
	const [selected, setSelected] = useState<string | null>(null)

	const players = useMemo(() => buildPlayers(stats), [stats])

	const grenadeTotals = useMemo(() => {
		const map = new Map<string, number>()
		for (const m of grenadeAllTime?.members ?? []) {
			map.set(m.name.trim().toLowerCase(), m.grenades)
		}
		return map
	}, [grenadeAllTime])

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	const totalBattles = stats.sessions.reduce(
		(n, s) => n + s.screenshots.length,
		0
	)
	const totalWins = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === true).length,
		0
	)
	const totalLosses = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === false).length,
		0
	)
	const clanKills = players.reduce((n, p) => n + p.kills, 0)
	const clanDeaths = players.reduce((n, p) => n + p.deaths, 0)

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				<StatCard
					icon="lucide:swords"
					label={t('clan.common.games')}
					value={totalBattles}
				/>
				<StatCard
					icon="lucide:crown"
					label={t('clan.common.wins')}
					value={totalWins}
				/>
				<StatCard
					icon="lucide:swords"
					label={t('clan.common.losses')}
					value={totalLosses}
				/>
				<StatCard
					icon="lucide:swords"
					label={t('clan.stats.clanKd')}
					value={formatKd(clanKills, clanDeaths)}
				/>
			</div>

			{players.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-background px-5 py-4">
					<Icon className="text-4xl" icon="lucide:bar-chart-3" />
					<h3 className="font-semibold text-lg">
						{t('clan.stats.emptyTitle')}
					</h3>
					<p className="font-semibold text-md">
						{t('clan.stats.emptyDesc')}
					</p>
				</div>
			) : (
				<PlayerList
					grenadeStages={grenadeStages}
					grenades={grenadeTotals}
					onSelect={setSelected}
					players={players}
					selected={selected}
				/>
			)}
			<ClanChartsView />
		</div>
	)
}
