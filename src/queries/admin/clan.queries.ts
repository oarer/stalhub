import { queryOptions } from '@tanstack/react-query'

import { adminClanService } from '@/services/admin/clan.service'
import type { AdminClanMember, AdminClanStage } from '@/types/admin.type'

class AdminClanQueries {
	list({
		take = 20,
		page = 1,
		search,
	}: {
		take?: number
		page?: number
		search?: string
	} = {}) {
		return queryOptions({
			queryKey: ['admin', 'clans', { take, page, search }],
			queryFn: () => adminClanService.list({ take, page, search }),
			staleTime: 1000 * 30,
		})
	}

	get(clanId: string) {
		return queryOptions({
			queryKey: ['admin', 'clan', clanId],
			queryFn: () => adminClanService.get(clanId),
			staleTime: 1000 * 30,
		})
	}

	getMembers(clanId: string) {
		return queryOptions<AdminClanMember[]>({
			queryKey: ['admin', 'clan', clanId, 'members'],
			queryFn: () => adminClanService.getMembers(clanId),
			staleTime: 1000 * 30,
		})
	}

	getStages(clanId: string) {
		return queryOptions<AdminClanStage[]>({
			queryKey: ['admin', 'clan', clanId, 'stages'],
			queryFn: () => adminClanService.getStages(clanId),
			staleTime: 1000 * 30,
		})
	}
}

export const adminClanQueries = new AdminClanQueries()
