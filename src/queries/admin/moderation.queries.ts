import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { adminModerationService } from '@/services/admin/moderation.service'

class AdminModerationQueries {
	articleQueue({
		take = 24,
		page = 1,
		status,
	}: {
		take?: number
		page?: number
		status?: string
	} = {}) {
		return queryOptions({
			queryKey: [
				'admin',
				'moderation',
				'articles',
				{ take, page, status },
			],
			queryFn: () =>
				adminModerationService.articleQueue({ take, page, status }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	autoBans({ take = 24, page = 1 }: { take?: number; page?: number } = {}) {
		return queryOptions({
			queryKey: ['admin', 'moderation', 'autoBans', { take, page }],
			queryFn: () => adminModerationService.autoBans({ take, page }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	multiaccounts(days = 30) {
		return queryOptions({
			queryKey: ['admin', 'moderation', 'multiaccounts', days],
			queryFn: () => adminModerationService.multiaccounts(days),
			staleTime: 1000 * 60,
		})
	}

	comments({ take = 24, page = 1 }: { take?: number; page?: number } = {}) {
		return queryOptions({
			queryKey: ['admin', 'moderation', 'comments', { take, page }],
			queryFn: () => adminModerationService.comments({ take, page }),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}
}

export const adminModerationQueries = new AdminModerationQueries()
