import { queryOptions } from '@tanstack/react-query'

import { adminFeedSourcesService } from '@/services/admin/feed-sources.service'

class AdminFeedSourcesQueries {
	list() {
		return queryOptions({
			queryKey: ['admin', 'feed-sources'],
			queryFn: () => adminFeedSourcesService.list(),
		})
	}
}

export const adminFeedSourcesQueries = new AdminFeedSourcesQueries()
