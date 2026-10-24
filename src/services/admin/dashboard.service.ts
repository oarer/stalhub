import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminDashboard } from '@/types/admin.type'

class AdminDashboardService {
	async summary(days = 30): Promise<AdminDashboard> {
		const { data } = await apiClient.get<AdminDashboard>(
			'/api/v1/admin/dashboard',
			{ params: { days } }
		)
		return data
	}
}

export const adminDashboardService = new AdminDashboardService()
