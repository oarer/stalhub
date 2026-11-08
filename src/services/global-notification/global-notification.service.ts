import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	GlobalNotification,
	GlobalNotificationSaveInput,
	GlobalNotificationsResponse,
	GlobalNotificationUpdateInput,
} from '@/types/global-notification.type'

class GlobalNotificationService {
	async list(): Promise<GlobalNotification[]> {
		const { data } = await apiClient.get<GlobalNotificationsResponse>(
			'/api/v1/global-notifications'
		)

		return data.data
	}

	async listAdmin(): Promise<GlobalNotification[]> {
		const { data } = await apiClient.get<GlobalNotification[]>(
			'/api/v1/admin/notifications/global'
		)

		return data
	}

	async getAdmin(id: number): Promise<GlobalNotification> {
		const { data } = await apiClient.get<GlobalNotification>(
			`/api/v1/admin/notifications/global/${id}`
		)

		return data
	}

	async create(
		input: GlobalNotificationSaveInput
	): Promise<GlobalNotification> {
		const { data } = await apiClient.post<GlobalNotification>(
			'/api/v1/admin/notifications/global',
			input
		)

		return data
	}

	async update(
		id: number,
		input: GlobalNotificationUpdateInput
	): Promise<GlobalNotification> {
		const { data } = await apiClient.patch<GlobalNotification>(
			`/api/v1/admin/notifications/global/${id}`,
			input
		)

		return data
	}

	async remove(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/notifications/global/${id}`)
	}
}

export const globalNotificationService = new GlobalNotificationService()
