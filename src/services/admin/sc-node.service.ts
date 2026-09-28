import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminScBulkResult,
	AdminScNode,
	AdminScNodeInput,
	AdminScNodePing,
	AdminScOverview,
	AdminScTokenUsage,
} from '@/types/admin.type'

const BASE = '/api/v1/admin/sc'

class AdminScNodeService {
	async overview(): Promise<AdminScOverview> {
		const { data } = await apiClient.get<AdminScOverview>(
			`${BASE}/overview`
		)
		return data
	}

	async createNode(
		input: AdminScNodeInput
	): Promise<Pick<AdminScNode, 'id' | 'name'>> {
		const { data } = await apiClient.post(`${BASE}/nodes`, input)
		return data
	}

	async updateNode(
		id: number,
		input: Partial<AdminScNodeInput>
	): Promise<Pick<AdminScNode, 'id' | 'name'>> {
		const { data } = await apiClient.patch(`${BASE}/nodes/${id}`, input)
		return data
	}

	async deleteNode(id: number): Promise<{ success: boolean }> {
		const { data } = await apiClient.delete(`${BASE}/nodes/${id}`)
		return data
	}

	async pingNode(id: number): Promise<AdminScNodePing> {
		const { data } = await apiClient.post<AdminScNodePing>(
			`${BASE}/nodes/${id}/ping`
		)
		return data
	}

	async createToken(input: {
		label?: string
		token: string
	}): Promise<{ id: number; label: string; tail: string }> {
		const { data } = await apiClient.post(`${BASE}/tokens`, input)
		return data
	}

	async bulkTokens(input: {
		tokens: string | string[]
		label?: string
	}): Promise<AdminScBulkResult> {
		const { data } = await apiClient.post<AdminScBulkResult>(
			`${BASE}/tokens/bulk`,
			input
		)
		return data
	}

	async updateToken(
		id: number,
		input: { label?: string; enabled?: boolean }
	): Promise<{ id: number; label: string; enabled: boolean }> {
		const { data } = await apiClient.patch(`${BASE}/tokens/${id}`, input)
		return data
	}

	async deleteToken(id: number): Promise<{ success: boolean }> {
		const { data } = await apiClient.delete(`${BASE}/tokens/${id}`)
		return data
	}
}

export const adminScNodeService = new AdminScNodeService()
export type { AdminScTokenUsage }
