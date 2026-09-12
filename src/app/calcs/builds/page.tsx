import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { BuildsView } from '@/views/calcs/builds/model'

export default async function BuildsPage() {
	const queryClient = getQueryClient()

	await queryClient.query(itemsQueries.get({ type: 'armor' }))
	await queryClient.query(itemsQueries.get({ type: 'containers' }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BuildsView />
		</HydrationBoundary>
	)
}
