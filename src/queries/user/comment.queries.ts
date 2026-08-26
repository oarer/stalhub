import { queryOptions } from '@tanstack/react-query'

import { userCommentService } from '@/services/user/comment.service'
import type { ArticleComment } from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class UserCommentQueries {
	list(userId: number, { take = 50, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<ArticleComment>>({
			queryKey: ['user', userId, 'comments', { take, page }],
			queryFn: () => userCommentService.list(userId, { take, page }),
			staleTime: 1000 * 15,
		})
	}
}

export const userCommentQueries = new UserCommentQueries()
