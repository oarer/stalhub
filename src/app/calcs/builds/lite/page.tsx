import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import BuildsLiteView from '@/views/calcs/builds/lite/BuildsLite'

export default async function BuildsLitePage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(itemsQueries.get({ type: 'armor' }))
	await queryClient.prefetchQuery(itemsQueries.get({ type: 'containers' }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BuildsLiteView />
		</HydrationBoundary>
	)
}
