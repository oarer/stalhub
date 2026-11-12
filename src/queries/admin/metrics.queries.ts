import { queryOptions } from '@tanstack/react-query'

import { adminMetricsService } from '@/services/admin/metrics.service'

interface AdminMetricsRaw {
	text: string
	fetchedAt: number
}

class AdminMetricsQueries {
	raw() {
		return queryOptions({
			queryKey: ['admin', 'metrics'],
			queryFn: async (): Promise<AdminMetricsRaw> => ({
				text: await adminMetricsService.raw(),
				fetchedAt: Date.now(),
			}),
			staleTime: 1000 * 15,
			refetchInterval: 1000 * 30,
		})
	}
}

export const adminMetricsQueries = new AdminMetricsQueries()
