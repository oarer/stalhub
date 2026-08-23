import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Art, ArtType } from '@/types/art.type'
import type { PaginatedResponse } from '@/types/user.type'

export interface AdminArtListParams {
	take?: number
	page?: number
	search?: string
	type?: ArtType
	tags?: string[]
}

export interface AdminArtCreate {
	title: string
	type?: ArtType
	image_url?: string | null
	tags?: string[]
	author_id?: number
	author_name?: string
	author_social_links?: Record<string, string>
}

export interface AdminArtUpdate {
	title?: string
	type?: ArtType
	image_url?: string | null
	tags?: string[]
	author_id?: number | null
	author_name?: string | null
	author_social_links?: Record<string, string> | null
}

class AdminArtService {
	async list({
		take = 20,
		page = 1,
		search,
		type,
		tags,
	}: AdminArtListParams = {}): Promise<PaginatedResponse<Art>> {
		const { data } = await apiClient.get<PaginatedResponse<Art>>('/api/v1/admin/arts', {
			params: {
				take,
				page,
				search,
				type,
				tags: tags?.length ? tags.join(',') : undefined,
			},
		})
		return data
	}

	async create(art: AdminArtCreate): Promise<Art> {
		const { data } = await apiClient.post<Art>('/api/v1/admin/arts', art)
		return data
	}

	async update(id: string, art: AdminArtUpdate): Promise<Art> {
		const { data } = await apiClient.patch<Art>(
			`/api/v1/admin/arts/${id}`,
			art
		)
		return data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/admin/arts/${id}`)
	}
}

export const adminArtService = new AdminArtService()
