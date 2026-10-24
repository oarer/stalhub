import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { BuildSort } from '@/constants/builds.const'
import type {
	BuildApi,
	BuildApiCreate,
	BuildApiUpdate,
} from '@/types/build-api.type'
import type { PaginatedResponse } from '@/types/user.type'

class BuildApiService {
	async list({
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
	} = {}): Promise<PaginatedResponse<BuildApi>> {
		const { data } = await apiClient.get<PaginatedResponse<BuildApi>>(
			'/api/v1/builds',
			{
				params: {
					take,
					page,
					...(tags && tags.length > 0 && { tags: tags.join(',') }),
					...(sort && sort !== 'newest' && { sort }),
					...(priceMin != null && { price_min: priceMin }),
					...(priceMax != null && { price_max: priceMax }),
					...(armor && armor.length > 0 && { armor: armor.join(',') }),
					...(container &&
						container.length > 0 && {
							container: container.join(','),
						}),
					...(arts && arts.length > 0 && { art: arts.join(',') }),
					...(qualityMin != null && { quality_min: qualityMin }),
					...(qualityMax != null && { quality_max: qualityMax }),
				},
			}
		)
		return data
	}

	async listMine({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<BuildApi>> {
		const { data } = await apiClient.get<PaginatedResponse<BuildApi>>(
			'/api/v1/users/@me/builds',
			{
				params: { take, page },
			}
		)
		return data
	}

	async get(id: string): Promise<BuildApi> {
		const { data } = await apiClient.get<BuildApi>(`/api/v1/builds/${id}`)
		return data
	}

	async create(build: BuildApiCreate): Promise<BuildApi> {
		const { data } = await apiClient.post<BuildApi>('/api/v1/builds', build)
		return data
	}

	async update(id: string, build: BuildApiUpdate): Promise<BuildApi> {
		const { data } = await apiClient.patch<BuildApi>(
			`/api/v1/builds/${id}`,
			build
		)
		return data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/builds/${id}`)
	}

	async star(id: string): Promise<void> {
		await apiClient.post(`/api/v1/builds/${id}/star`)
	}

	async unstar(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/builds/${id}/star`)
	}
}

export const buildApiService = new BuildApiService()
