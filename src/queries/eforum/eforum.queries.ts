import { queryOptions } from '@tanstack/react-query'
import { devTrackerService } from '@/services/eforum/eforum.service'
import type {
	EForumComment,
	EForumParams,
	EForumResponse,
} from '@/types/eforum.type'

class DevTrackerQueries {
	feed(params: EForumParams = {}) {
		return queryOptions<EForumResponse>({
			queryKey: ['eforum', 'feed', params],
			queryFn: () => devTrackerService.feed(params),
			staleTime: 1000 * 60,
			refetchInterval: 1000 * 60 * 2,
		})
	}

	byId(postId: string) {
		return queryOptions<EForumComment>({
			queryKey: ['eforum', 'post', postId],
			queryFn: () => devTrackerService.getById(postId),
			staleTime: 1000 * 60 * 10,
		})
	}

	authors() {
		return queryOptions({
			queryKey: ['eforum', 'authors'],
			queryFn: () => devTrackerService.authors(),
			staleTime: 1000 * 60 * 60,
		})
	}
}

export const devTrackerQueries = new DevTrackerQueries()
