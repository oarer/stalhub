import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { AdminArtListParams } from '@/services/admin/art.service'
import { adminArtService } from '@/services/admin/art.service'

class AdminArtQueries {
	list({ take = 20, page = 1, search, type, tags }: AdminArtListParams = {}) {
		return queryOptions({
			queryKey: ['admin', 'arts', { take, page, search, type, tags }],
			queryFn: () =>
				adminArtService.list({ take, page, search, type, tags }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}
}

export const adminArtQueries = new AdminArtQueries()
