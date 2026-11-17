import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AdminFeedCategory,
	AdminFeedCategoryCreate,
	AdminFeedCategoryUpdate,
} from '@/types/admin.type'

const BASE = '/api/v1/admin/feed-categories'

class AdminFeedCategoriesService {
	async list(): Promise<{ categories: AdminFeedCategory[] }> {
		const { data } = await apiClient.get<{
			categories: AdminFeedCategory[]
		}>(BASE)
		return data
	}

	async create(
		input: AdminFeedCategoryCreate
	): Promise<{ category: AdminFeedCategory }> {
		const { data } = await apiClient.post<{
			category: AdminFeedCategory
		}>(BASE, input)
		return data
	}

	async update(
		id: number,
		input: AdminFeedCategoryUpdate
	): Promise<{ category: AdminFeedCategory }> {
		const { data } = await apiClient.patch<{
			category: AdminFeedCategory
		}>(`${BASE}/${id}`, input)
		return data
	}

	async delete(id: number): Promise<{ ok: true }> {
		const { data } = await apiClient.delete<{ ok: true }>(`${BASE}/${id}`)
		return data
	}
}

export const adminFeedCategoriesService = new AdminFeedCategoriesService()
