import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminBanUser,
	AdminRole,
	AdminSession,
	AdminUser,
	AdminUserDetail,
	AdminUserListParams,
} from '@/types/admin.type'
import type { PaginatedResponse } from '@/types/user.type'

class AdminUserService {
	async list({
		take = 20,
		page = 1,
		search,
	}: AdminUserListParams = {}): Promise<PaginatedResponse<AdminUser>> {
		const { data } = await apiClient.get<PaginatedResponse<AdminUser>>(
			'/api/v1/admin/users',
			{ params: { take, page, search } }
		)
		return data
	}

	async get(userId: number): Promise<AdminUserDetail> {
		const { data } = await apiClient.get<AdminUserDetail>(
			`/api/v1/admin/users/${userId}`
		)
		return data
	}

	async update(
		userId: number,
		update: { username?: string; name?: string }
	): Promise<AdminUser> {
		const { data } = await apiClient.patch<AdminUser>(
			`/api/v1/admin/users/${userId}`,
			update
		)
		return data
	}

	async delete(userId: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/users/${userId}`)
	}

	async getSessions(userId: number): Promise<AdminSession[]> {
		const { data } = await apiClient.get<AdminSession[]>(
			`/api/v1/admin/users/${userId}/sessions`
		)
		return data
	}

	async revokeSession(userId: number, sessionId: string): Promise<void> {
		await apiClient.post(
			`/api/v1/admin/users/${userId}/sessions/${sessionId}/revoke`
		)
	}

	async getRoles(userId: number): Promise<AdminRole[]> {
		const { data } = await apiClient.get<AdminRole[]>(
			`/api/v1/admin/users/${userId}/roles`
		)
		return data
	}

	async assignRole(userId: number, roleId: number): Promise<void> {
		await apiClient.post(`/api/v1/admin/users/${userId}/roles`, {
			role_id: roleId,
		})
	}

	async removeRole(userId: number, roleId: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/users/${userId}/roles/${roleId}`)
	}

	async ban(userId: number, ban: AdminBanUser): Promise<void> {
		await apiClient.post(`/api/v1/admin/users/${userId}/ban`, ban)
	}

	async unban(userId: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/users/${userId}/ban`)
	}

	async updateCustomization(
		userId: number,
		update: {
			banner_mode?: 'COLOR' | 'IMAGE' | 'NONE'
			banner_type?: 'BACKGROUND' | 'HEADER'
			banner_color?: string
			banner_image?: string | null
		}
	): Promise<void> {
		await apiClient.patch(
			`/api/v1/admin/users/${userId}/customization`,
			update
		)
	}

	async uploadBanner(
		userId: number,
		file: File
	): Promise<{ banner_image: string }> {
		const formData = new FormData()
		formData.append('file', file)
		const { data } = await apiClient.post<{ banner_image: string }>(
			`/api/v1/admin/users/${userId}/banner`,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data
	}
}

export const adminUserService = new AdminUserService()
