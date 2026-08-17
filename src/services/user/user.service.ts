import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	Notification,
	PaginatedResponse,
	PublicUser,
	Session,
	StarredItem,
	UpdateUserSettingsDto,
	User,
	UserSettings,
} from '@/types/user.type'

class UserService {
	async getMe(): Promise<User> {
		const { data } = await apiClient.get<User>('/api/v1/users/@me')
		return data
	}

	async patchMe(update: UpdateUserSettingsDto): Promise<User> {
		const { data } = await apiClient.patch<User>(
			'/api/v1/users/@me',
			update
		)
		return data
	}

	async completeOnboarding(
		update: UpdateUserSettingsDto
	): Promise<User> {
		const { data } = await apiClient.post<User>(
			'/api/v1/users/@me/onboarding',
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

	async uploadBanner(file: File): Promise<{ banner_image: string }> {
		const formData = new FormData()
		formData.append('file', file)
		const { data } = await apiClient.post<{ banner_image: string }>(
			'/api/v1/users/@me/banner',
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data
	}

	async uploadAvatar(file: File): Promise<{ avatar_image: string }> {
		const formData = new FormData()
		formData.append('file', file)
		const { data } = await apiClient.post<{ avatar_image: string }>(
			'/api/v1/users/@me/avatar',
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data
	}

	async deleteAvatar(): Promise<void> {
		await apiClient.delete('/api/v1/users/@me/avatar')
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
		return { ...data, total: data.totalCount ?? data.total }
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

	async getUser(id: number): Promise<PublicUser> {
		const { data } = await apiClient.get<PublicUser>(
			`/api/v1/users/id/${id}`
		)
		return data
	}

	async getUserByUsername(username: string): Promise<PublicUser> {
		const { data } = await apiClient.get<PublicUser>(
			`/api/v1/users/${username}`
		)
		return data
	}
}

export const userService = new UserService()
