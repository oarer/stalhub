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
	}: {
		take?: number
		page?: number
		tags?: string[]
		sort?: BuildSort
		priceMin?: number
		priceMax?: number
	} = {}): Promise<PaginatedResponse<BuildApi>> {
		const { data } = await apiClient.get<PaginatedResponse<BuildApi>>('/api/v1/builds', {
			params: {
				take,
				page,
				...(tags && tags.length > 0 && { tags: tags.join(',') }),
				...(sort && sort !== 'newest' && { sort }),
				...(priceMin != null && { price_min: priceMin }),
				...(priceMax != null && { price_max: priceMax }),
			},
		})
		return data
	}

	async listMine({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<BuildApi>> {
		const { data } = await apiClient.get<PaginatedResponse<BuildApi>>('/api/v1/users/@me/builds', {
			params: { take, page },
		})
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
