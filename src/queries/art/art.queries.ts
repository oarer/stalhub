import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { artService } from '@/services/art/art.service'
import type { Art, ArtType } from '@/types/art.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArtQueries {
	list({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<Art>>({
			queryKey: ['arts', { take, page }],
			queryFn: () => artService.list({ take, page }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	publicList({
		take = 24,
		page = 1,
		tags,
		type,
	}: {
		take?: number
		page?: number
		tags?: string[]
		type?: ArtType
	} = {}) {
		return queryOptions<PaginatedResponse<Art>>({
			queryKey: ['arts', 'public', { take, page, tags, type }],
			queryFn: () => artService.publicList({ take, page, tags, type }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 60,
		})
	}

	get(id: string) {
		return queryOptions<Art>({
			queryKey: ['art', id],
			queryFn: () => artService.get(id),
			staleTime: 1000 * 30,
		})
	}
}

export const artQueries = new ArtQueries()
