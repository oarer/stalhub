import { queryOptions } from '@tanstack/react-query'

import { adminScNodeService } from '@/services/admin/sc-node.service'

class AdminScNodeQueries {
	overview() {
		return queryOptions({
			queryKey: ['admin', 'sc-nodes', 'overview'],
			queryFn: () => adminScNodeService.overview(),
			// Live quota: token usage resets every minute
			refetchInterval: 1000 * 15,
			staleTime: 1000 * 10,
		})
	}
}

export const adminScNodeQueries = new AdminScNodeQueries()
