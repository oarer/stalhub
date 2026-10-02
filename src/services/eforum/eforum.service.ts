import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	EForumAuthorsResponse,
	EForumComment,
	EForumParams,
	EForumResponse,
} from '@/types/eforum.type'

class DevTrackerService {
	async feed(
		params: EForumParams = {}
	): Promise<EForumResponse> {
		const { data } = await apiClient.get<EForumResponse>(
			'/api/v1/eforum/latest',
			{ params }
		)
		return data
	}

	async getById(postId: string): Promise<EForumComment> {
		const { data } = await apiClient.get<EForumComment>(
			`/api/v1/eforum/post/${postId}`
		)
		return data
	}

	async authors(): Promise<EForumAuthorsResponse> {
		const { data } = await apiClient.get<EForumAuthorsResponse>(
			'/api/v1/eforum/authors'
		)
		return data
	}
}

export const devTrackerService = new DevTrackerService()
