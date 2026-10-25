import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminAuditList, AdminAuditListParams } from '@/types/admin.type'

class AdminAuditService {
	async list(params: AdminAuditListParams = {}): Promise<AdminAuditList> {
		const { take = 24, page = 1, search, entity, action, actor_id } = params
		const { data } = await apiClient.get<AdminAuditList>(
			'/api/v1/admin/audit',
			{
				params: { take, page, search, entity, action, actor_id },
			}
		)
		return data
	}
}

export const adminAuditService = new AdminAuditService()
