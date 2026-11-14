import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminAchievement,
	AdminCreateAchievement,
	AdminUpdateAchievement,
	UserAchievement,
} from '@/types/achievement.type'

class AdminAchievementService {
	async list(): Promise<AdminAchievement[]> {
		const { data } = await apiClient.get<AdminAchievement[]>(
			'/api/v1/admin/achievements'
		)
		return data
	}

	async get(id: number): Promise<AdminAchievement> {
		const { data } = await apiClient.get<AdminAchievement>(
			`/api/v1/admin/achievements/${id}`
		)
		return data
	}

	async create(data: AdminCreateAchievement): Promise<AdminAchievement> {
		const response = await apiClient.post<AdminAchievement>(
			'/api/v1/admin/achievements',
			data
		)
		return response.data
	}

	async update(
		id: number,
		data: AdminUpdateAchievement
	): Promise<AdminAchievement> {
		const response = await apiClient.patch<AdminAchievement>(
			`/api/v1/admin/achievements/${id}`,
			data
		)
		return response.data
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/achievements/${id}`)
	}

	async assignUser(achievementId: number, userId: number): Promise<void> {
		await apiClient.post(
			`/api/v1/admin/achievements/${achievementId}/users/${userId}`
		)
	}

	async removeUser(achievementId: number, userId: number): Promise<void> {
		await apiClient.delete(
			`/api/v1/admin/achievements/${achievementId}/users/${userId}`
		)
	}

	async getUserAchievements(userId: number): Promise<UserAchievement[]> {
		const { data } = await apiClient.get<UserAchievement[]>(
			`/api/v1/admin/achievements/user/${userId}`
		)
		return data
	}
}

export const adminAchievementService = new AdminAchievementService()
