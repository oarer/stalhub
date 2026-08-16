import { queryOptions } from '@tanstack/react-query'

import { artCommentService } from '@/services/art/comment.service'
import type { ArtComment } from '@/types/art.type'
import type { PaginatedResponse } from '@/types/user.type'

class ArtCommentQueries {
	list(artId: string, { take = 50, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<ArtComment>>({
			queryKey: ['art', artId, 'comments', { take, page }],
			queryFn: () => artCommentService.list(artId, { take, page }),
			staleTime: 1000 * 15,
		})
	}
}

export const artCommentQueries = new ArtCommentQueries()
