import { queryOptions } from '@tanstack/react-query'

import { adminUnoService } from '@/services/admin/uno.service'

class AdminUnoQueries {
	ipStats(take = 50) {
		return queryOptions({
			queryKey: ['admin', 'uno', 'ip-stats', { take }],
			queryFn: () => adminUnoService.ipStats(take),
			staleTime: 1000 * 15,
			refetchInterval: 1000 * 30,
		})
	}

	bans() {
		return queryOptions({
			queryKey: ['admin', 'uno', 'bans'],
			queryFn: () => adminUnoService.bans(),
			staleTime: 1000 * 15,
		})
	}
}

export const adminUnoQueries = new AdminUnoQueries()
