import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	TierList,
	TierListCreate,
	TierListUpdate,
	WeeklyTopsResponse,
} from '@/types/tier-list.type'
import type { PaginatedResponse } from '@/types/user.type'

class TierListService {
	async list({
		take = 24,
		page = 1,
		kind,
		item_kind,
		category,
	}: {
		take?: number
		page?: number
		kind?: string
		item_kind?: string
		category?: string
	} = {}): Promise<PaginatedResponse<TierList>> {
		const { data } = await apiClient.get<PaginatedResponse<TierList>>(
			'/api/v1/tier-lists',
			{
				params: {
					take,
					page,
					...(kind && { kind }),
					...(item_kind && { item_kind }),
					...(category && { category }),
				},
			}
		)
		return data
	}

	async listMine({
		take = 24,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<TierList>> {
		const { data } = await apiClient.get<PaginatedResponse<TierList>>(
			'/api/v1/tier-lists/mine',
			{ params: { take, page } }
		)
		return data
	}

	async get(id: string): Promise<TierList> {
		const { data } = await apiClient.get<TierList>(
			`/api/v1/tier-lists/${id}`
		)
		return data
	}

	async create(tierList: TierListCreate): Promise<TierList> {
		const { data } = await apiClient.post<TierList>(
			'/api/v1/tier-lists',
			tierList
		)
		return data
	}

	async update(id: string, tierList: TierListUpdate): Promise<TierList> {
		const { data } = await apiClient.patch<TierList>(
			`/api/v1/tier-lists/${id}`,
			tierList
		)
		return data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/tier-lists/${id}`)
	}

	async getTopAuthorOfWeek(): Promise<WeeklyTopsResponse> {
		const { data } = await apiClient.get<WeeklyTopsResponse>(
			'/api/v1/authors/week'
		)
		return data
	}
}

export const tierListService = new TierListService()
