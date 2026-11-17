import { queryOptions } from '@tanstack/react-query'
import { adminFeedCategoriesService } from '@/services/admin/feed-categories.service'

class AdminFeedCategoriesQueries {
	list() {
		return queryOptions({
			queryKey: ['admin', 'feed-categories'],
			queryFn: () => adminFeedCategoriesService.list(),
		})
	}
}

export const adminFeedCategoriesQueries = new AdminFeedCategoriesQueries()
