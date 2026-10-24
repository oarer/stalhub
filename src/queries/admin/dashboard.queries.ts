import { queryOptions } from '@tanstack/react-query'

import { adminDashboardService } from '@/services/admin/dashboard.service'
import type { AdminDashboardRange } from '@/types/admin.type'

class AdminDashboardQueries {
	summary(days: AdminDashboardRange = 30) {
		return queryOptions({
			queryKey: ['admin', 'dashboard', days],
			queryFn: () => adminDashboardService.summary(days),
			staleTime: 1000 * 60,
			refetchInterval: 1000 * 120,
		})
	}
}

export const adminDashboardQueries = new AdminDashboardQueries()
