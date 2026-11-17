import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	FeedCategoriesResponse,
	FeedContentType,
	FeedResponse,
	FeedSort,
} from '@/types/feed.type'

class FeedService {
	async list({
		types,
		categories,
		page = 1,
		take = 20,
		sort = 'new',
	}: {
		types?: FeedContentType[]
		categories?: number[]
		page?: number
		take?: number
		sort?: FeedSort
	} = {}): Promise<FeedResponse> {
		const { data } = await apiClient.get<FeedResponse>('/api/v1/feed', {
			params: {
				page,
				take,
				sort,
				...(types && types.length > 0 ? { types } : {}),
				...(categories && categories.length > 0 ? { categories } : {}),
			},
			// Повторяемый ключ `types=build&types=art`; axios по умолчанию
			// отправляет `types[]=...`, который API не разбирает.
			paramsSerializer: { indexes: null },
		})
		return data
	}

	async categories(): Promise<FeedCategoriesResponse> {
		const { data } = await apiClient.get<FeedCategoriesResponse>(
			'/api/v1/feed/categories'
		)
		return data
	}
}

export const feedService = new FeedService()
