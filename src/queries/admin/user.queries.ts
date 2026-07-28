import { queryOptions } from '@tanstack/react-query'

import { adminUserService } from '@/services/admin/user.service'
import type { AdminUserListParams } from '@/types/admin.type'

class AdminUserQueries {
	list({ take = 20, page = 1, search }: AdminUserListParams = {}) {
		return queryOptions({
			queryKey: ['admin', 'users', { take, page, search }],
			queryFn: () => adminUserService.list({ take, page, search }),
			staleTime: 1000 * 30,
		})
	}

	get(userId: number) {
		return queryOptions({
			queryKey: ['admin', 'user', userId],
			queryFn: () => adminUserService.get(userId),
			staleTime: 1000 * 30,
		})
	}

	getSessions(userId: number) {
		return queryOptions({
			queryKey: ['admin', 'user', userId, 'sessions'],
			queryFn: () => adminUserService.getSessions(userId),
			staleTime: 1000 * 30,
		})
	}

	getRoles(userId: number) {
		return queryOptions({
			queryKey: ['admin', 'user', userId, 'roles'],
			queryFn: () => adminUserService.getRoles(userId),
			staleTime: 1000 * 30,
		})
	}
}

export const adminUserQueries = new AdminUserQueries()
