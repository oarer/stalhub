import { queryOptions } from '@tanstack/react-query'

import { adminPermissionService } from '@/services/admin/permission.service'

class AdminPermissionQueries {
	list() {
		return queryOptions({
			queryKey: ['admin', 'permissions'],
			queryFn: () => adminPermissionService.list(),
			staleTime: 1000 * 60,
		})
	}
}

export const adminPermissionQueries = new AdminPermissionQueries()
