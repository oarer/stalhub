import { queryOptions } from '@tanstack/react-query'

import { adminRoleService } from '@/services/admin/role.service'

class AdminRoleQueries {
	list() {
		return queryOptions({
			queryKey: ['admin', 'roles'],
			queryFn: () => adminRoleService.list(),
			staleTime: 1000 * 60,
		})
	}
}

export const adminRoleQueries = new AdminRoleQueries()
