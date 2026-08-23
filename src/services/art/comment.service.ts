import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { ArtComment, ArtCommentCreate } from '@/types/art.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArtCommentService {
	async list(
		artId: string,
		{ take = 50, page = 1 } = {}
	): Promise<PaginatedResponse<ArtComment>> {
		const { data } = await apiClient.get<PaginatedResponse<ArtComment>>(`/api/v1/arts/${artId}/comments`, {
			params: { take, page },
		})
		return data
	}

	async create(
		artId: string,
		comment: ArtCommentCreate
	): Promise<ArtComment> {
		const { data } = await apiClient.post<ArtComment>(
			`/api/v1/arts/${artId}/comments`,
			comment
		)
		return data
	}

	async delete(artId: string, commentId: number): Promise<void> {
		await apiClient.delete(`/api/v1/arts/${artId}/comments/${commentId}`)
	}
}

export const artCommentService = new ArtCommentService()
