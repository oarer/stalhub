import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { adminBanService } from '@/services/admin/ban.service'
import type { AdminBanListParams } from '@/types/admin.type'

class AdminBanQueries {
	list({ take = 24, page = 1, auto, rule, search }: AdminBanListParams = {}) {
		return queryOptions({
			queryKey: ['admin', 'bans', { take, page, auto, rule, search }],
			queryFn: () => adminBanService.list({ take, page, auto, rule, search }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	stats() {
		return queryOptions({
			queryKey: ['admin', 'bans', 'stats'],
			queryFn: () => adminBanService.stats(),
			staleTime: 1000 * 60,
		})
	}
}

export const adminBanQueries = new AdminBanQueries()
