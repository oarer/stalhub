import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { playerQueries } from '@/queries/player/player.queries'
import { playerService } from '@/services/player/player.service'
import type { Regions } from '@/types/api.type'
import PlayerNotFoundView from '@/views/errors/playerNotFound/PlayerNotFoundView'
import PlayerView from '@/views/player'

export default async function PlayerPage({
	params,
}: {
	params: Promise<{ region: string; character: string }>
}) {
	const { region, character } = await params

	const queryClient = getQueryClient()
	const playerParams = { region: region as Regions, character }

	try {
		const data = await playerService.get(playerParams)
		queryClient.setQueryData(playerQueries.get(playerParams).queryKey, data)
	} catch {
		return <PlayerNotFoundView />
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PlayerView character={character} region={region as Regions} />
		</HydrationBoundary>
	)
}
