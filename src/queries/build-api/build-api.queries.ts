import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import type { BuildSort } from '@/constants/builds.const'
import { buildApiService } from '@/services/build-api/build-api.service'
import type { BuildApi } from '@/types/build-api.type'
import type { PaginatedResponse } from '@/types/user.type'

class BuildApiQueries {
	list({
		take = 20,
		page = 1,
		tags,
		sort,
		priceMin,
		priceMax,
	}: {
		take?: number
		page?: number
		tags?: string[]
		sort?: BuildSort
		priceMin?: number
		priceMax?: number
	} = {}) {
		const normalizedTags = tags && tags.length > 0 ? tags : undefined
		const normalizedSort = sort && sort !== 'newest' ? sort : undefined
		const normalizedPriceMin = priceMin != null ? priceMin : undefined
		const normalizedPriceMax = priceMax != null ? priceMax : undefined

		return queryOptions<PaginatedResponse<BuildApi>>({
			queryKey: [
				'builds',
				{
					take,
					page,
					tags: normalizedTags,
					sort: normalizedSort,
					priceMin: normalizedPriceMin,
					priceMax: normalizedPriceMax,
				},
			],
			queryFn: () =>
				buildApiService.list({
					take,
					page,
					tags,
					sort,
					priceMin,
					priceMax,
				}),
			staleTime: 1000 * 30,
			placeholderData: keepPreviousData,
		})
	}

	mine({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<BuildApi>>({
			queryKey: ['builds', 'mine', { take, page }],
			queryFn: () => buildApiService.listMine({ take, page }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	get(id: string) {
		return queryOptions<BuildApi>({
			queryKey: ['build', id],
			queryFn: () => buildApiService.get(id),
			staleTime: 1000 * 30,
		})
	}
}

export const buildApiQueries = new BuildApiQueries()
