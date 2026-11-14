import { queryOptions } from '@tanstack/react-query'
import type { ThreadComment } from '@/components/comments/CommentThread'
import {
	type FeedCommentTarget,
	feedCommentService,
} from '@/services/feed/comment.service'
import type { PaginatedResponse } from '@/types/user.type'

class FeedCommentQueries {
	list(target: FeedCommentTarget, id: string, { take = 50, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<ThreadComment>>({
			queryKey: ['feed', target, id, 'comments', { take, page }],
			queryFn: () => feedCommentService.list(target, id, { take, page }),
			staleTime: 1000 * 15,
		})
	}
}

export const feedCommentQueries = new FeedCommentQueries()
