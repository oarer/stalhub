import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminBanListParams,
	AdminBanLog,
	AdminBanStats,
} from '@/types/admin.type'
import type { PaginatedResponse } from '@/types/user.type'

class AdminBanService {
	async list({
		take = 24,
		page = 1,
		auto,
		rule,
		search,
	}: AdminBanListParams = {}): Promise<PaginatedResponse<AdminBanLog>> {
		const { data } = await apiClient.get<PaginatedResponse<AdminBanLog>>(
			'/api/v1/admin/bans',
			{ params: { take, page, auto, rule, search } }
		)
		return data
	}

	async stats(): Promise<AdminBanStats> {
		const { data } = await apiClient.get<AdminBanStats>(
			'/api/v1/admin/bans/stats'
		)
		return data
	}
}

export const adminBanService = new AdminBanService()
