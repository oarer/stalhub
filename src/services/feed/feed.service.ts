import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { FeedContentType, FeedResponse, FeedSort } from '@/types/feed.type'

class FeedService {
	async list({
		types,
		page = 1,
		take = 20,
		sort = 'new',
	}: {
		types?: FeedContentType[]
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
			},
			// Повторяемый ключ `types=build&types=art`; axios по умолчанию
			// отправляет `types[]=...`, который API не разбирает.
			paramsSerializer: { indexes: null },
		})
		return data
	}
}

export const feedService = new FeedService()
