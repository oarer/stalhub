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
		armor,
		container,
		arts,
		qualityMin,
		qualityMax,
	}: {
		take?: number
		page?: number
		tags?: string[]
		sort?: BuildSort
		priceMin?: number
		priceMax?: number
		armor?: string[]
		container?: string[]
		arts?: string[]
		qualityMin?: number
		qualityMax?: number
	} = {}) {
		const normalizedTags = tags && tags.length > 0 ? tags : undefined
		const normalizedSort = sort && sort !== 'newest' ? sort : undefined
		const normalizedPriceMin = priceMin != null ? priceMin : undefined
		const normalizedPriceMax = priceMax != null ? priceMax : undefined
		const normalizedArmor =
			armor && armor.length > 0 ? armor : undefined
		const normalizedContainer =
			container && container.length > 0 ? container : undefined
		const normalizedArts = arts && arts.length > 0 ? arts : undefined
		const normalizedQualityMin =
			qualityMin != null ? qualityMin : undefined
		const normalizedQualityMax =
			qualityMax != null ? qualityMax : undefined

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
					armor: normalizedArmor,
					container: normalizedContainer,
					arts: normalizedArts,
					qualityMin: normalizedQualityMin,
					qualityMax: normalizedQualityMax,
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
					armor,
					container,
					arts,
					qualityMin,
					qualityMax,
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
