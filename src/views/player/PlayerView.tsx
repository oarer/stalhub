'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { playerQueries } from '@/queries/player/player.queries'
import { Regions } from '@/types/api.type'
import ClanHistoryView from './components/ClanHistoryView'
import ClanView from './components/ClanView'
import HeroView from './components/hero/HeroView'
import OperationsSection from './components/OperationsSection'
import PlayerGearView from './components/PlayerGearView'
import PlayerSummary from './components/PlayerSummary'
import StatsView from './components/StatsView'

export default function PlayerView({
	region,
	character,
}: {
	region: Regions
	character: string
}) {
	const { data } = useSuspenseQuery(playerQueries.get({ region, character }))
	const isRu = String(region).toUpperCase() === Regions.RU

	return (
		<main className="mx-auto max-w-360 gap-12 space-y-6 px-4 pt-42 pb-12 sm:px-6 md:px-8">
			<HeroView data={data} region={region} />
			<PlayerSummary stats={data.stats} />
			{isRu && <PlayerGearView character={character} />}
			{data.clan && <ClanView data={data.clan} />}
			<ClanHistoryView history={data.clan_history ?? []} />
			<StatsView data={data.stats} />
			<OperationsSection character={character} region={region} />
		</main>
	)
}
