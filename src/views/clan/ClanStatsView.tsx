'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import ClanChartsView from './ClanChartsView'
import { ClanStatsBody } from './components/stats/ClanStatsBody'

export default function ClanStatsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null
	return <ClanStatsContent clanId={clanId} />
}

function ClanStatsContent({ clanId }: { clanId: string }) {
	const { data: stats, isLoading } = useSuspenseQuery(
		clanQueries.getStats(clanId)
	)
	const { data: grenadeAllTime } = useSuspenseQuery(
		clanQueries.getGrenadeAllTime(clanId)
	)
	const { data: grenadeStages } = useSuspenseQuery(
		clanQueries.getGrenadeStages(clanId)
	)
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId))

	if (isLoading || !stats || !members || !grenadeAllTime || !grenadeStages) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<ClanStatsBody
				grenadeAllTime={grenadeAllTime}
				grenadeStages={grenadeStages}
				members={members}
				stats={stats}
			/>
			<ClanChartsView />
		</div>
	)
}
