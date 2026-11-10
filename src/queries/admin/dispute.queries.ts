import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { adminDisputeService } from '@/services/admin/dispute.service'
import type { AdminDisputeListParams } from '@/types/admin.type'

class AdminDisputeQueries {
	list({
		take = 24,
		page = 1,
		status,
		kind,
		assigned,
		search,
	}: AdminDisputeListParams = {}) {
		return queryOptions({
			queryKey: [
				'admin',
				'disputes',
				{ take, page, status, kind, assigned, search },
			],
			queryFn: () =>
				adminDisputeService.list({
					take,
					page,
					status,
					kind,
					assigned,
					search,
				}),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	stats() {
		return queryOptions({
			queryKey: ['admin', 'disputes', 'stats'],
			queryFn: () => adminDisputeService.stats(),
			staleTime: 1000 * 30,
		})
	}

	get(id: string) {
		return queryOptions({
			queryKey: ['admin', 'dispute', id],
			queryFn: () => adminDisputeService.get(id),
			staleTime: 1000 * 15,
			refetchInterval: 1000 * 10,
		})
	}

	messages(id: string) {
		return queryOptions({
			queryKey: ['admin', 'dispute', id, 'messages'],
			queryFn: () => adminDisputeService.messages(id),
			staleTime: 1000 * 10,
		})
	}

	messagesAfter(id: string, after: number) {
		return queryOptions({
			queryKey: ['admin', 'dispute', id, 'messages', after],
			queryFn: () => adminDisputeService.messages(id, { after }),
			enabled: after > 0,
			refetchInterval: 5000,
		})
	}
}

export const adminDisputeQueries = new AdminDisputeQueries()
