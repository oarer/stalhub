import { apiClient } from '@/app/api/interceptors/root.interceptor'

class AuthService {
	async login(username: string, password: string): Promise<void> {
		await apiClient.post('/api/v1/auth/login', { username, password }, {
			skipAuthRefresh: true,
		})
	}

	async logout(): Promise<void> {
		await apiClient.delete('/api/v1/users/@me')
	}
}

export const authService = new AuthService()
