import { apiClient } from '@/app/api/interceptors/root.interceptor'

class AdminMetricsService {
	async raw(): Promise<string> {
		const { data } = await apiClient.get<string>('/api/v1/metrics', {
			responseType: 'text',
			headers: {
				Accept: 'text/plain',
			},
		})
		return data
	}
}

export const adminMetricsService = new AdminMetricsService()
