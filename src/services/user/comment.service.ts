import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { ArticleComment, ArticleCommentCreate } from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class UserCommentService {
	async list(
		userId: number,
		{ take = 50, page = 1 } = {}
	): Promise<PaginatedResponse<ArticleComment>> {
		const { data } = await apiClient.get<PaginatedResponse<ArticleComment>>(
			`/api/v1/users/id/${userId}/comments`,
			{
				params: { take, page },
			}
		)
		return data
	}

	async create(
		userId: number,
		comment: ArticleCommentCreate
	): Promise<ArticleComment> {
		const { data } = await apiClient.post<ArticleComment>(
			`/api/v1/users/id/${userId}/comments`,
			comment
		)
		return data
	}

	async delete(userId: number, commentId: number): Promise<void> {
		await apiClient.delete(
			`/api/v1/users/${userId}/comments/${commentId}`
		)
	}
}

export const userCommentService = new UserCommentService()
