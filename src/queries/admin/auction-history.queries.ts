import { queryOptions } from '@tanstack/react-query'

import { adminAuctionHistoryService } from '@/services/admin/auction-history.service'

class AdminAuctionHistoryQueries {
	progress() {
		return queryOptions({
			queryKey: ['admin', 'auction-history', 'progress'],
			queryFn: () => adminAuctionHistoryService.progress(),
			// бэкфилл/свип постоянно двигают цифры
			refetchInterval: 1000 * 15,
			staleTime: 1000 * 10,
		})
	}
}

export const adminAuctionHistoryQueries = new AdminAuctionHistoryQueries()
