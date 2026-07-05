import { apiClient } from '@/app/api/interceptors/root.interceptor'

class DiscordAuthService {
	async getLoginUrl(): Promise<string> {
		const { data } = await apiClient.get<{ url: string }>(
			'/api/v1/auth/discord/login'
		)
		return data.url
	}

	async handleCallback(code: string, state?: string): Promise<void> {
		await apiClient.get('/api/v1/auth/discord/callback', {
			params: { code, state },
		})
	}
}

export const discordAuthService = new DiscordAuthService()
