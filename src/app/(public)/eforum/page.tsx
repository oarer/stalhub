import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { devTrackerQueries } from '@/queries/eforum/eforum.queries'
import EForumFeed from '@/views/eforum/EForumFeed'

export default async function DevTrackerPage() {
	const queryClient = getQueryClient()

	await Promise.allSettled([
		queryClient.fetchQuery(devTrackerQueries.feed({ limit: 20 })),
		queryClient.fetchQuery(devTrackerQueries.authors()),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EForumFeed />
		</HydrationBoundary>
	)
}
