import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { feedService } from '@/services/feed/feed.service'
import type { FeedContentType, FeedResponse, FeedSort } from '@/types/feed.type'

class FeedQueries {
	list({
		types,
		categories,
		take = 20,
		sort = 'new',
	}: {
		types?: FeedContentType[]
		categories?: number[]
		take?: number
		sort?: FeedSort
	} = {}) {
		return infiniteQueryOptions<FeedResponse>({
			queryKey: ['feed', { types, categories, take, sort }] as const,
			initialPageParam: 1,
			queryFn: ({ pageParam }) =>
				feedService.list({
					types,
					categories,
					take,
					sort,
					page: pageParam as number,
				}),
			getNextPageParam: (lastPage) => {
				const loaded = lastPage.page * lastPage.take
				return loaded < lastPage.total_count
					? lastPage.page + 1
					: undefined
			},
			staleTime: 1000 * 30,
		})
	}

	categories() {
		return queryOptions({
			queryKey: ['feed', 'categories'],
			queryFn: () => feedService.categories(),
			staleTime: 1000 * 60,
		})
	}
}

export const feedQueries = new FeedQueries()
