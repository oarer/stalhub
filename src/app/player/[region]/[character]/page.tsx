import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { playerQueries } from '@/queries/player/player.queries'
import type { Regions } from '@/types/api.type'
import PlayerView from '@/views/player'

export default async function PlayerPage({
	params,
}: {
	params: Promise<{ region: string; character: string }>
}) {
	const { region, character } = await params

	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(
		playerQueries.get({ region: region as Regions, character })
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PlayerView character={character} region={region as Regions} />
		</HydrationBoundary>
	)
}
