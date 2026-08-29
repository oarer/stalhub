import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	Article,
	ArticleCreate,
	ArticleUpdate,
	ArticleVersion,
} from '@/types/article.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArticleService {
	async list({
		take = 20,
		page = 1,
		status,
	}: {
		take?: number
		page?: number
		status?: string
	} = {}): Promise<PaginatedResponse<Article>> {
		const { data } = await apiClient.get<PaginatedResponse<Article>>(
			'/api/v1/articles',
			{ params: { take, page, status } }
		)
		return data
	}

	async mine({ take = 20, page = 1 } = {}): Promise<PaginatedResponse<Article>> {
		const { data } = await apiClient.get<PaginatedResponse<Article>>(
			'/api/v1/articles/mine',
			{ params: { take, page } }
		)
		return data
	}

	async publicList({
		take = 20,
		page = 1,
	}: {
		take?: number
		page?: number
	} = {}): Promise<PaginatedResponse<Article>> {
		const { data } = await apiClient.get<PaginatedResponse<Article>>(
			'/api/v1/articles/public',
			{ params: { take, page } }
		)
		return data
	}

	async get(id: string): Promise<Article> {
		const { data } = await apiClient.get<Article>(`/api/v1/articles/${id}`)
		return data
	}

	async create(article: ArticleCreate): Promise<Article> {
		const { data } = await apiClient.post<Article>(
			'/api/v1/articles',
			article
		)
		return data
	}

	async uploadImage(id: string, file: File): Promise<string> {
		const form = new FormData()
		form.append('file', file)
		const { data } = await apiClient.post<{ url: string }>(
			`/api/v1/articles/${id}/image`,
			form,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data.url
	}

	async update(id: string, article: ArticleUpdate): Promise<Article> {
		const { data } = await apiClient.patch<Article>(
			`/api/v1/articles/${id}`,
			article
		)
		return data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/articles/${id}`)
	}

	async setStatus(
		id: string,
		status: string,
		reason?: string
	): Promise<void> {
		await apiClient.patch(`/api/v1/articles/${id}/status`, {
			status,
			reason,
		})
	}

	async submit(id: string): Promise<void> {
		await apiClient.post(`/api/v1/articles/${id}/submit`)
	}

	async getVersions(id: string): Promise<ArticleVersion[]> {
		const { data } = await apiClient.get<ArticleVersion[]>(
			`/api/v1/articles/${id}/versions`
		)
		return data
	}

	async getVersion(id: string, versionId: string): Promise<ArticleVersion> {
		const { data } = await apiClient.get<ArticleVersion>(
			`/api/v1/articles/${id}/versions/${versionId}`
		)
		return data
	}

	async star(id: string): Promise<void> {
		await apiClient.post(`/api/v1/articles/${id}/star`)
	}

	async unstar(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/articles/${id}/star`)
	}
}

export const articleService = new ArticleService()
