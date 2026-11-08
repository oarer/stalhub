import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import { LEADERBOARD_LIMIT } from '@/views/uno/components/leaderboard/leaderboard.const'
import UnoLeaderboardView from '@/views/uno/UnoLeaderboardView'

export default async function UnoPage() {
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(
		unoQueries.leaderboard({ limit: LEADERBOARD_LIMIT })
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoLeaderboardView />
		</HydrationBoundary>
	)
}
