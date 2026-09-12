import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import BuildsPublicView from '@/views/builds/BuildsPublicView'

export default async function BuildsPage() {
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.query(buildApiQueries.list({ take: 20, page: 1 })),
		queryClient.query(itemsQueries.get({ type: 'artefact' })),
		queryClient.query(itemsQueries.get({ type: 'armor' })),
		queryClient.query(itemsQueries.get({ type: 'containers' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BuildsPublicView />
		</HydrationBoundary>
	)
}
