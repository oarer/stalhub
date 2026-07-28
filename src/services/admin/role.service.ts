import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminAssignPermissions,
	AdminCreateRole,
	AdminRole,
	AdminUpdateRole,
} from '@/types/admin.type'

class AdminRoleService {
	async list(): Promise<AdminRole[]> {
		const { data } = await apiClient.get<AdminRole[]>(
			'/api/v1/admin/roles'
		)
		return data
	}

	async create(role: AdminCreateRole): Promise<AdminRole> {
		const { data } = await apiClient.post<AdminRole>(
			'/api/v1/admin/roles',
			role
		)
		return data
	}

	async update(id: number, role: AdminUpdateRole): Promise<AdminRole> {
		const { data } = await apiClient.patch<AdminRole>(
			`/api/v1/admin/roles/${id}`,
			role
		)
		return data
	}

	async delete(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/admin/roles/${id}`)
	}

	async assignPermissions(
		id: number,
		payload: AdminAssignPermissions
	): Promise<void> {
		await apiClient.post(
			`/api/v1/admin/roles/${id}/permissions`,
			payload
		)
	}

	async removePermissions(
		id: number,
		payload: AdminAssignPermissions
	): Promise<void> {
		await apiClient.delete(
			`/api/v1/admin/roles/${id}/permissions`,
			{ data: payload }
		)
	}
}

export const adminRoleService = new AdminRoleService()
