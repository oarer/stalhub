import { apiClient } from '@/app/api/interceptors/root.interceptor'

class TelegramAuthService {
	async getLoginUrl(): Promise<string> {
		const { data } = await apiClient.get<{ url: string }>(
			'/api/v1/auth/telegram/login'
		)
		return data.url
	}

	async handleCallback(code: string, state: string): Promise<void> {
		await apiClient.get('/api/v1/auth/telegram/callback', {
			params: { code, state },
		})
	}

	async handleIdToken(id_token: string): Promise<void> {
		await apiClient.post('/api/v1/auth/telegram/callback', { id_token })
	}
}

export const telegramAuthService = new TelegramAuthService()
