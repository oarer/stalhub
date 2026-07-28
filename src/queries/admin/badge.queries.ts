import { queryOptions } from '@tanstack/react-query'

import { adminBadgeService } from '@/services/admin/badge.service'
import type { AdminBadge } from '@/types/admin.type'

class AdminBadgeQueries {
	list() {
		return queryOptions<AdminBadge[]>({
			queryKey: ['admin', 'badges'],
			queryFn: () => adminBadgeService.list(),
			staleTime: 1000 * 60,
		})
	}

	getUserBadges(userId: number) {
		return queryOptions<AdminBadge[]>({
			queryKey: ['admin', 'user', userId, 'badges'],
			queryFn: () => adminBadgeService.getUserBadges(userId),
			staleTime: 1000 * 30,
		})
	}
}

export const adminBadgeQueries = new AdminBadgeQueries()
