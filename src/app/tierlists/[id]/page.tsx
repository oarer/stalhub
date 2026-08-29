import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import TierListDetailView from '@/views/tierlists/TierListDetailView'

export default async function TierListDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.prefetchQuery(tierListQueries.get(id)),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'weapons' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'armor' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TierListDetailView />
		</HydrationBoundary>
	)
}
