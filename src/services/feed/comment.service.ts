import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { ThreadComment } from '@/components/comments/CommentThread'
import type { PaginatedResponse } from '@/types/user.type'

export type FeedCommentTarget = 'build' | 'tier_list' | 'post' | 'art' | 'eforum'

export interface FeedCommentCreate {
	content: string
	parent_id?: number
}

function resourcePath(target: FeedCommentTarget): string {
	if (target === 'build') return 'builds'
	if (target === 'tier_list') return 'tier-lists'
	if (target === 'post') return 'posts'
	return 'arts'
}

class FeedCommentService {
	async list(
		target: FeedCommentTarget,
		id: string,
		{ take = 50, page = 1 } = {}
	): Promise<PaginatedResponse<ThreadComment>> {
		const { data } = await apiClient.get<PaginatedResponse<ThreadComment>>(
			`/api/v1/${resourcePath(target)}/${id}/comments`,
			{ params: { take, page } }
		)
		return data
	}

	async create(
		target: FeedCommentTarget,
		id: string,
		comment: FeedCommentCreate
	): Promise<ThreadComment> {
		const { data } = await apiClient.post<ThreadComment>(
			`/api/v1/${resourcePath(target)}/${id}/comments`,
			comment
		)
		return data
	}

	async delete(
		target: FeedCommentTarget,
		id: string,
		commentId: number
	): Promise<void> {
		await apiClient.delete(
			`/api/v1/${resourcePath(target)}/${id}/comments/${commentId}`
		)
	}
}

export const feedCommentService = new FeedCommentService()
