import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminAutoBanList,
	AdminModerationArticleList,
	AdminModerationCommentList,
	AdminMultiaccountEntry,
} from '@/types/admin.type'

class AdminModerationService {
	async articleQueue(
		params: { take?: number; page?: number; status?: string } = {}
	) {
		const { data } = await apiClient.get<AdminModerationArticleList>(
			'/api/v1/admin/moderation/articles',
			{ params }
		)
		return data
	}

	async autoBans(params: { take?: number; page?: number } = {}) {
		const { data } = await apiClient.get<AdminAutoBanList>(
			'/api/v1/admin/moderation/auto-bans',
			{ params }
		)
		return data
	}

	async clearAutoBan(userId: number) {
		const { data } = await apiClient.post<{ success: boolean }>(
			'/api/v1/admin/moderation/auto-bans/clear',
			{ user_id: userId }
		)
		return data
	}

	async multiaccounts(days = 30) {
		const { data } = await apiClient.get<{
			data: AdminMultiaccountEntry[]
			total_count: number
		}>('/api/v1/admin/moderation/multiaccounts', { params: { days } })
		return data
	}

	async comments(params: { take?: number; page?: number } = {}) {
		const { data } = await apiClient.get<AdminModerationCommentList>(
			'/api/v1/admin/moderation/comments',
			{ params }
		)
		return data
	}

	async deleteComment(commentId: number) {
		const { data } = await apiClient.delete<{ success: boolean }>(
			`/api/v1/admin/moderation/comments/${commentId}`
		)
		return data
	}
}

export const adminModerationService = new AdminModerationService()
