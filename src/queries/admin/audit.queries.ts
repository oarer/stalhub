import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { adminAuditService } from '@/services/admin/audit.service'
import type { AdminAuditListParams } from '@/types/admin.type'

class AdminAuditQueries {
	list({
		take = 24,
		page = 1,
		search,
		entity,
		action,
		actor_id,
	}: AdminAuditListParams = {}) {
		return queryOptions({
			queryKey: [
				'admin',
				'audit',
				{ take, page, search, entity, action, actor_id },
			],
			queryFn: () =>
				adminAuditService.list({
					take,
					page,
					search,
					entity,
					action,
					actor_id,
				}),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}
}

export const adminAuditQueries = new AdminAuditQueries()
