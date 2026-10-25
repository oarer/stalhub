import { queryOptions } from '@tanstack/react-query'

import { adminNotificationService } from '@/services/admin/notification.service'
import type { AdminNotificationTargetKind } from '@/types/admin.type'

class AdminNotificationQueries {
	stats() {
		return queryOptions({
			queryKey: ['admin', 'notifications', 'stats'],
			queryFn: () => adminNotificationService.stats(),
			staleTime: 1000 * 60,
		})
	}

	estimateTargets(target: {
		kind: AdminNotificationTargetKind
		role_id?: number
		clan_id?: string
	}) {
		return queryOptions({
			queryKey: ['admin', 'notifications', 'estimate', target],
			queryFn: () => adminNotificationService.estimateTargets(target),
			staleTime: 1000 * 15,
		})
	}
}

export const adminNotificationQueries = new AdminNotificationQueries()
