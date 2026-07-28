import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminCreatePermission,
	AdminPermission,
	AdminUpdatePermission,
} from '@/types/admin.type'

class AdminPermissionService {
	async list(): Promise<AdminPermission[]> {
		const { data } = await apiClient.get<AdminPermission[]>(
			'/api/v1/admin/permissions'
		)
		return data
	}

	async create(permission: AdminCreatePermission): Promise<AdminPermission> {
		const { data } = await apiClient.post<AdminPermission>(
			'/api/v1/admin/permissions',
			permission
		)
		return data
	}

	async update(
		id: number,
		permission: AdminUpdatePermission
	): Promise<AdminPermission> {
		const { data } = await apiClient.patch<AdminPermission>(
			`/api/v1/admin/permissions/${id}`,
			permission
		)
		return data
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/permissions/${id}`)
	}
}

export const adminPermissionService = new AdminPermissionService()
