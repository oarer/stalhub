import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminHealth } from '@/types/admin.type'

class AdminHealthService {
	async get(): Promise<AdminHealth> {
		const { data } = await apiClient.get<AdminHealth>(
			'/api/v1/admin/health'
		)
		return data
	}
}

export const adminHealthService = new AdminHealthService()
