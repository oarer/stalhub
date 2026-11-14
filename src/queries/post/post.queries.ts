import { queryOptions } from '@tanstack/react-query'
import { postService } from '@/services/post/post.service'
import type { Post } from '@/types/post.type'

export const postQueries = {
	get: (id: string) =>
		queryOptions<Post>({
			queryKey: ['post', id],
			queryFn: () => postService.get(id),
			staleTime: 1000 * 30,
		}),
}
