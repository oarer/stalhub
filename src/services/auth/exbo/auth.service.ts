import { apiClient } from '@/app/api/interceptors/root.interceptor'

class ExboAuthService {
	async getLoginUrl(): Promise<string> {
		const { data } = await apiClient.get<{ url: string }>(
			'/api/v1/auth/exbo/login'
		)
		return data.url
	}

	async handleCallback(code: string, state: string): Promise<void> {
		await apiClient.get('/api/v1/auth/exbo/callback', {
			params: { code, state },
			skipAuthRefresh: true,
		})
	}
}

export const exboAuthService = new ExboAuthService()
