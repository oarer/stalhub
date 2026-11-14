import { queryOptions } from '@tanstack/react-query'

import { adminAchievementService } from '@/services/admin/achievement.service'
import type {
	AdminAchievement,
	UserAchievement,
} from '@/types/achievement.type'

class AdminAchievementQueries {
	list() {
		return queryOptions<AdminAchievement[]>({
			queryKey: ['admin', 'achievements'],
			queryFn: () => adminAchievementService.list(),
			staleTime: 1000 * 60,
		})
	}

	getUserAchievements(userId: number) {
		return queryOptions<UserAchievement[]>({
			queryKey: ['admin', 'user', userId, 'achievements'],
			queryFn: () => adminAchievementService.getUserAchievements(userId),
			staleTime: 1000 * 30,
		})
	}
}

export const adminAchievementQueries = new AdminAchievementQueries()
