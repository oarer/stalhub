import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import ClanPublicStatsView from '@/views/clans/ClanPublicStatsView'

export default async function ClansStatsPage() {
	const queryClient = getQueryClient()

	await queryClient.fetchQuery(clanQueries.getPublicClansStats())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ClanPublicStatsView />
		</HydrationBoundary>
	)
}
