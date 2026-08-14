'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { playerQueries } from '@/queries/player/player.queries'
import type { Regions } from '@/types/api.type'
import ClanHistoryView from './components/ClanHistoryView'
import ClanView from './components/ClanView'
import HeroView from './components/hero/HeroView'
import StatsView from './components/StatsView'

export default function PlayerView({
	region,
	character,
}: {
	region: Regions
	character: string
}) {
	const { data } = useSuspenseQuery(playerQueries.get({ region, character }))

	return (
		<main className="mx-auto max-w-360 gap-12 space-y-6 px-4 pt-42 pb-12 sm:px-6 md:px-8">
			<HeroView data={data} />
			{data.clan && <ClanView data={data.clan} />}
			<ClanHistoryView history={data.clan_history ?? []} />
			<StatsView data={data.stats} />
		</main>
	)
}
