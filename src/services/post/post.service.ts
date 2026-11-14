import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Post, PostCreate, PostUpdate } from '@/types/post.type'

class PostService {
	async get(id: string): Promise<Post> {
		const { data } = await apiClient.get<Post | { post: Post }>(
			`/api/v1/posts/${id}`
		)
		return 'post' in data ? data.post : data
	}

	async create(post: PostCreate): Promise<Post> {
		const { data } = await apiClient.post<{ post: Post }>(
			'/api/v1/posts',
			post
		)
		return data.post
	}

	async update(id: string, post: PostUpdate): Promise<Post> {
		const { data } = await apiClient.patch<Post | { post: Post }>(
			`/api/v1/posts/${id}`,
			post
		)
		return 'post' in data ? data.post : data
	}

	async delete(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/posts/${id}`)
	}

	async star(id: string): Promise<void> {
		await apiClient.post(`/api/v1/posts/${id}/star`)
	}

	async unstar(id: string): Promise<void> {
		await apiClient.delete(`/api/v1/posts/${id}/star`)
	}

	async votePoll(id: string, optionIds: number[]): Promise<Post> {
		const { data } = await apiClient.post<Post | { post: Post }>(
			`/api/v1/posts/${id}/poll/vote`,
			{ option_ids: optionIds }
		)
		return 'post' in data ? data.post : data
	}

	async retractPollVote(id: string): Promise<Post> {
		const { data } = await apiClient.delete<Post | { post: Post }>(
			`/api/v1/posts/${id}/poll/vote`
		)
		return 'post' in data ? data.post : data
	}

	async repost(id: string, content?: string): Promise<Post> {
		const { data } = await apiClient.post<{ post: Post }>(
			`/api/v1/posts/${id}/repost`,
			content?.trim() ? { content: content.trim() } : {}
		)
		return data.post
	}
}

export const postService = new PostService()
