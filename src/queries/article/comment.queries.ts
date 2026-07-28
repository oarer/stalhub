import { queryOptions } from '@tanstack/react-query'

import { articleCommentService } from '@/services/article/comment.service'
import type { ArticleComment } from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArticleCommentQueries {
	list(
		articleId: string,
		{ take = 50, page = 1 } = {}
	) {
		return queryOptions<PaginatedResponse<ArticleComment>>({
			queryKey: ['article', articleId, 'comments', { take, page }],
			queryFn: () =>
				articleCommentService.list(articleId, { take, page }),
			staleTime: 1000 * 15,
		})
	}
}

export const articleCommentQueries = new ArticleCommentQueries()
