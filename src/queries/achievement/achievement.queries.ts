import { queryOptions } from '@tanstack/react-query'

import { achievementService } from '@/services/achievement/achievement.service'
import type { Achievement, UserAchievement } from '@/types/achievement.type'

class AchievementQueries {
	list() {
		return queryOptions<Achievement[]>({
			queryKey: ['achievements'],
			queryFn: () => achievementService.list(),
			staleTime: 1000 * 60 * 5,
		})
	}

	forUser(userId: number) {
		return queryOptions<UserAchievement[]>({
			queryKey: ['achievements', 'user', userId],
			queryFn: () => achievementService.forUser(userId),
			staleTime: 1000 * 30,
		})
	}

	mine() {
		return queryOptions<UserAchievement[]>({
			queryKey: ['achievements', 'me'],
			queryFn: () => achievementService.mine(),
		})
	}
}

export const achievementQueries = new AchievementQueries()
