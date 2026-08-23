import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	ArticleComment,
	ArticleCommentCreate,
} from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArticleCommentService {
	async list(
		articleId: string,
		{ take = 20, page = 1 } = {}
	): Promise<PaginatedResponse<ArticleComment>> {
		const { data } = await apiClient.get<PaginatedResponse<ArticleComment>>(`/api/v1/articles/${articleId}/comments`, {
			params: { take, page },
		})
		return data
	}

	async create(
		articleId: string,
		comment: ArticleCommentCreate
	): Promise<ArticleComment> {
		const { data } = await apiClient.post<ArticleComment>(
			`/api/v1/articles/${articleId}/comments`,
			comment
		)
		return data
	}

	async delete(articleId: string, commentId: number): Promise<void> {
		await apiClient.delete(
			`/api/v1/articles/${articleId}/comments/${commentId}`
		)
	}
}

export const articleCommentService = new ArticleCommentService()
