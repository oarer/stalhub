import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminFeedSource,
	AdminFeedSourceCreate,
	AdminFeedSourceUpdate,
} from '@/types/admin.type'

const BASE = '/api/v1/admin/feed-sources'

class AdminFeedSourcesService {
	async list(): Promise<{ sources: AdminFeedSource[] }> {
		const { data } = await apiClient.get<{ sources: AdminFeedSource[] }>(BASE)
		return data
	}

	async create(input: AdminFeedSourceCreate): Promise<{ source: AdminFeedSource }> {
		const { data } = await apiClient.post<{ source: AdminFeedSource }>(
			BASE,
			input
		)
		return data
	}

	async update(
		id: number,
		input: AdminFeedSourceUpdate
	): Promise<{ source: AdminFeedSource }> {
		const { data } = await apiClient.patch<{ source: AdminFeedSource }>(
		`${BASE}/${id}`,
			input
		)
		return data
	}

	async delete(id: number): Promise<{ ok: true }> {
		const { data } = await apiClient.delete<{ ok: true }>(`${BASE}/${id}`)
		return data
	}

	async sync(id: number): Promise<{ synced: number; last_synced_at: string }> {
		const { data } = await apiClient.post<{
			synced: number
			last_synced_at: string
		}>(`${BASE}/${id}/sync`)
		return data
	}
}

export const adminFeedSourcesService = new AdminFeedSourcesService()
