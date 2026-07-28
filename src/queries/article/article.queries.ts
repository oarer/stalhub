import { queryOptions } from '@tanstack/react-query'

import { articleService } from '@/services/article/article.service'
import type { Article, ArticleVersion } from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArticleQueries {
	list({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<Article>>({
			queryKey: ['articles', { take, page }],
			queryFn: () => articleService.list({ take, page }),
			staleTime: 1000 * 30,
		})
	}

	publicList({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<Article>>({
			queryKey: ['articles', 'public', { take, page }],
			queryFn: () => articleService.publicList({ take, page }),
			staleTime: 1000 * 60,
		})
	}

	approved({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<Article>>({
			queryKey: ['articles', 'approved', { take, page }],
			queryFn: () =>
				articleService.list({ take, page, status: 'APPROVED' }),
			staleTime: 1000 * 60,
		})
	}

	get(id: string) {
		return queryOptions<Article>({
			queryKey: ['article', id],
			queryFn: () => articleService.get(id),
			staleTime: 1000 * 30,
		})
	}

	getVersions(id: string) {
		return queryOptions<ArticleVersion[]>({
			queryKey: ['article', id, 'versions'],
			queryFn: () => articleService.getVersions(id),
			staleTime: 1000 * 60,
		})
	}
}

export const articleQueries = new ArticleQueries()
