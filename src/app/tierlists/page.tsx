import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import TierListsView from '@/views/tierlists/TierListsView'

export default async function TierListsPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(
		tierListQueries.list({ take: 24, page: 1 })
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TierListsView />
		</HydrationBoundary>
	)
}
