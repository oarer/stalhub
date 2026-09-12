import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { playerQueries } from '@/queries/player/player.queries'
import PlayerSearchView from '@/views/player-search'

export default async function PlayerSearchPage() {
	const queryClient = getQueryClient()

	await Promise.allSettled([
		queryClient.query(playerQueries.getPopular()),
		queryClient.query(playerQueries.getRecent()),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PlayerSearchView />
		</HydrationBoundary>
	)
}
