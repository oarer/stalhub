import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminBadge,
	AdminCreateBadge,
	AdminUpdateBadge,
} from '@/types/admin.type'

class AdminBadgeService {
	async list(): Promise<AdminBadge[]> {
		const { data } = await apiClient.get<AdminBadge[]>(
			'/api/v1/admin/badges'
		)
		return data
	}

	async get(id: number): Promise<AdminBadge> {
		const { data } = await apiClient.get<AdminBadge>(
			`/api/v1/admin/badges/${id}`
		)
		return data
	}

	async create(badge: AdminCreateBadge): Promise<AdminBadge> {
		const { data } = await apiClient.post<AdminBadge>(
			'/api/v1/admin/badges',
			badge
		)
		return data
	}

	async update(id: number, badge: AdminUpdateBadge): Promise<AdminBadge> {
		const { data } = await apiClient.patch<AdminBadge>(
			`/api/v1/admin/badges/${id}`,
			badge
		)
		return data
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/badges/${id}`)
	}

	async assignUser(badgeId: number, userId: number): Promise<void> {
		await apiClient.post(`/api/v1/admin/badges/${badgeId}/users/${userId}`)
	}

	async removeUser(badgeId: number, userId: number): Promise<void> {
		await apiClient.delete(
			`/api/v1/admin/badges/${badgeId}/users/${userId}`
		)
	}

	async getUserBadges(userId: number): Promise<AdminBadge[]> {
		const { data } = await apiClient.get<AdminBadge[]>(
			`/api/v1/admin/badges/user/${userId}`
		)
		return data
	}
}

export const adminBadgeService = new AdminBadgeService()
