import { queryOptions } from '@tanstack/react-query'

import { adminHealthService } from '@/services/admin/health.service'

class AdminHealthQueries {
	get() {
		return queryOptions({
			queryKey: ['admin', 'health'],
			queryFn: () => adminHealthService.get(),
			staleTime: 1000 * 30,
			refetchInterval: 1000 * 60,
		})
	}
}

export const adminHealthQueries = new AdminHealthQueries()
