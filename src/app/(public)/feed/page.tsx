import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { feedQueries } from '@/queries/feed/feed.queries'
import { FEED_CONTENT_TYPES } from '@/types/feed.type'
import FeedView from '@/views/feed/FeedView'

export default async function FeedPage() {
	const queryClient = getQueryClient()
	await queryClient.prefetchInfiniteQuery(
		feedQueries.list({ types: [...FEED_CONTENT_TYPES], take: 20, sort: 'new' })
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<FeedView />
		</HydrationBoundary>
	)
}
