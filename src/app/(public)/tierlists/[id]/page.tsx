import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import TierListDetailView from '@/views/tierlists/TierListDetailView'

export default async function TierListDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.query(tierListQueries.get(id)),
		queryClient.query(itemsQueries.get({ type: 'weapons' })),
		queryClient.query(itemsQueries.get({ type: 'armor' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TierListDetailView />
		</HydrationBoundary>
	)
}
