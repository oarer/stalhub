import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminNotificationTargetKind } from '@/types/admin.type'

interface NotificationSend {
	title: string
	content: string
	type?: number
	link?: string
}

export interface AdminNotificationStats {
	total: number
	read: number
	unread: number
	assigned_users: number
	recent_sent_7d: number
}

export interface AdminNotificationTargetPayload {
	kind: AdminNotificationTargetKind
	role_id?: number
	clan_id?: string
}

class AdminNotificationService {
	async broadcast(data: NotificationSend): Promise<{ sent: number }> {
		const { data: res } = await apiClient.post<{ sent: number }>(
			'/api/v1/admin/notifications/broadcast',
			data
		)
		return res
	}

	async sendToTarget(
		target: AdminNotificationTargetPayload,
		data: NotificationSend
	): Promise<{ sent: number }> {
		const { data: res } = await apiClient.post<{ sent: number }>(
			'/api/v1/admin/notifications/targeted',
			{ target, ...data }
		)
		return res
	}

	async estimateTargets(
		target: AdminNotificationTargetPayload
	): Promise<{ count: number }> {
		const { data: res } = await apiClient.post<{ count: number }>(
			'/api/v1/admin/notifications/estimate',
			{ target }
		)
		return res
	}

	async stats(): Promise<AdminNotificationStats> {
		const { data: res } = await apiClient.get<AdminNotificationStats>(
			'/api/v1/admin/notifications/stats'
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
			{ ...data, user_ids: userIds }
		)
		return res
	}
}

export const adminNotificationService = new AdminNotificationService()
