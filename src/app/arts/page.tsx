import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import ArtsView from '@/views/arts/ArtsView'

export default async function ArtsPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(
		artQueries.publicList({ take: 24, page: 1 })
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArtsView />
		</HydrationBoundary>
	)
}
