import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Art, ArtCreate, ArtType, ArtUpdate } from '@/types/art.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArtService {
	async list({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<Art>> {
		const { data } = await apiClient.get<
			PaginatedResponse<Art> & { totalCount: number }
		>('/api/v1/arts', { params: { take, page } })
		return { ...data, total: data.totalCount ?? data.total }
	}

	async publicList({
		take = 24,
		page = 1,
		tags,
		type,
	}: {
		take?: number
		page?: number
		tags?: string[]
		type?: ArtType
	} = {}): Promise<PaginatedResponse<Art>> {
		const { data } = await apiClient.get<
			PaginatedResponse<Art> & { totalCount: number }
		>('/api/v1/arts/public', {
			params: {
				take,
				page,
				tags: tags?.length ? tags.join(',') : undefined,
				type,
			},
		})
		return { ...data, total: data.totalCount ?? data.total }
	}

	async get(id: string): Promise<Art> {
		const { data } = await apiClient.get<Art>(`/api/v1/arts/${id}`)
		return data
	}

	async create(art: ArtCreate): Promise<Art> {
		const { data } = await apiClient.post<Art>('/api/v1/arts', art)
		return data
	}

	async uploadImage(file: File): Promise<{ image_url: string }> {
		const formData = new FormData()
		formData.append('file', file)
		const { data } = await apiClient.post<{ image_url: string }>(
			'/api/v1/arts/upload',
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data
	}

	async update(id: string, art: ArtUpdate): Promise<Art> {
		const { data } = await apiClient.patch<Art>(`/api/v1/arts/${id}`, art)
		return data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/arts/${id}`)
	}

	async star(id: string): Promise<void> {
		await apiClient.post(`/api/v1/arts/${id}/star`)
	}

	async unstar(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/arts/${id}/star`)
	}
}

export const artService = new ArtService()
