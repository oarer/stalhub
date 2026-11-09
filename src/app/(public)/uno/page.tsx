import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import { LEADERBOARD_LIMIT } from '@/views/uno/components/leaderboard/leaderboard.const'
import UnoLeaderboardView from '@/views/uno/UnoLeaderboardView'

export default async function UnoPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const query = await searchParams
	const queryValue = (value: string | string[] | undefined) =>
		Array.isArray(value) ? value[0] : value
	const season = queryValue(query.season) || undefined
	const params = { season, limit: LEADERBOARD_LIMIT }

	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(unoQueries.leaderboard(params))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoLeaderboardView season={season} />
		</HydrationBoundary>
	)
}
