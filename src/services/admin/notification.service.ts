import { apiClient } from '@/app/api/interceptors/root.interceptor'

interface NotificationSend {
	title: string
	content: string
	type?: number
	link?: string
}

class AdminNotificationService {
	async broadcast(data: NotificationSend): Promise<{ sent: number }> {
		const { data: res } = await apiClient.post<{ sent: number }>(
			'/api/v1/admin/notifications/broadcast',
			data
		)
		return res
	}

	async sendToUser(
		userId: number,
		data: NotificationSend
	): Promise<{ sent: number }> {
		const { data: res } = await apiClient.post<{ sent: number }>(
			`/api/v1/admin/notifications/user/${userId}`,
			data
		)
		return res
	}

	async sendToUsers(
		userIds: number[],
		data: NotificationSend
	): Promise<{ sent: number }> {
		const { data: res } = await apiClient.post<{ sent: number }>(
			'/api/v1/admin/notifications/batch',
			{ ...data, userIds }
		)
		return res
	}
}

export const adminNotificationService = new AdminNotificationService()
