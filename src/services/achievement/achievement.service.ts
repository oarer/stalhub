import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Achievement, UserAchievement } from '@/types/achievement.type'

class AchievementService {
	async list(): Promise<Achievement[]> {
		const { data } = await apiClient.get<Achievement[]>(
			'/api/v1/achievements'
		)
		return data
	}

	async forUser(userId: number): Promise<UserAchievement[]> {
		const { data } = await apiClient.get<UserAchievement[]>(
			`/api/v1/achievements/user/${userId}`
		)
		return data
	}

	async mine(): Promise<UserAchievement[]> {
		const { data } = await apiClient.get<UserAchievement[]>(
			'/api/v1/achievements/@me'
		)
		return data
	}
}

export const achievementService = new AchievementService()
