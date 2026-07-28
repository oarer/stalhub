import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	Notification,
	PaginatedResponse,
	Session,
	StarredItem,
	User,
	UserSettings,
} from '@/types/user.type'

class UserService {
	async getMe(): Promise<User> {
		const { data } = await apiClient.get<User>('/api/v1/users/@me')
		return data
	}

	async patchMe(update: {
		public_profile?: boolean
		avatar?: string
		bg_variant?: 'COLOR' | 'AVATAR' | 'NONE'
		bg_color?: string
	}): Promise<User> {
		const { data } = await apiClient.patch<User>(
			'/api/v1/users/@me',
			update
		)
		return data
	}

	async deleteMe(): Promise<void> {
		await apiClient.delete('/api/v1/users/@me')
	}

	async getSettings(): Promise<UserSettings> {
		const { data } = await apiClient.get<UserSettings>(
			'/api/v1/users/@me/settings'
		)
		return data
	}

	async getSessions(): Promise<Session[]> {
		const { data } = await apiClient.get<Session[]>(
			'/api/v1/users/@me/sessions'
		)
		return data
	}

	async deleteSession(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/users/@me/sessions/${id}`)
	}

	async deleteAllSessions(): Promise<void> {
		await apiClient.delete('/api/v1/users/@me/sessions/all')
	}

	async getProviderLinkUrl(
		provider: 'discord' | 'telegram' | 'exbo'
	): Promise<string> {
		const { data } = await apiClient.get<{ url: string }>(
			`/api/v1/auth/${provider}/link`
		)
		return data.url
	}

	async unlinkProvider(
		provider: 'discord' | 'telegram' | 'exbo'
	): Promise<void> {
		await apiClient.delete(`/api/v1/auth/${provider}/link`)
	}

	async getStars({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<StarredItem>> {
		const { data } = await apiClient.get<PaginatedResponse<StarredItem>>(
			'/api/v1/users/@me/stars',
			{ params: { take, page } }
		)
		return data
	}

	async getNotifications({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<Notification>> {
		const { data } = await apiClient.get<
			PaginatedResponse<Notification> & { totalCount?: number }
		>('/api/v1/users/@me/notifications', {
			params: { take, page: page - 1 },
		})
		return { ...data, total: data.totalCount ?? (data as any).total }
	}

	async getUnreadCount(): Promise<number> {
		const { data } = await apiClient.get<number>(
			'/api/v1/users/@me/notifications/unread'
		)
		return data
	}

	async markRead(id: number): Promise<void> {
		await apiClient.patch(`/api/v1/users/@me/notifications/${id}/read`)
	}

	async markAllRead(): Promise<void> {
		await apiClient.post('/api/v1/users/@me/notifications/read-all')
	}

	async deleteNotification(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/users/@me/notifications/${id}`)
	}
}

export const userService = new UserService()
