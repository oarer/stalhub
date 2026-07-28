import { queryOptions } from '@tanstack/react-query'

import { buildApiService } from '@/services/build-api/build-api.service'
import type { BuildApi } from '@/types/build-api.type'
import type { PaginatedResponse } from '@/types/user.type'

class BuildApiQueries {
	list({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<BuildApi>>({
			queryKey: ['builds', { take, page }],
			queryFn: () => buildApiService.list({ take, page }),
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
