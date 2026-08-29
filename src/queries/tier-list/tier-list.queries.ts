import { queryOptions } from '@tanstack/react-query'
import { tierListService } from '@/services/tier-list/tier-list.service'

export const tierListQueries = {
	list: (params?: {
		take?: number
		page?: number
		kind?: string
		item_kind?: string
		category?: string
	}) =>
		queryOptions({
			queryKey: ['tier-lists', 'list', params],
			queryFn: () => tierListService.list(params),
		}),

	listMine: (params?: { take?: number; page?: number }) =>
		queryOptions({
			queryKey: ['tier-lists', 'mine', params],
			queryFn: () => tierListService.listMine(params),
		}),

	get: (id: string) =>
		queryOptions({
			queryKey: ['tier-lists', id],
			queryFn: () => tierListService.get(id),
		}),

	topAuthorOfWeek: () =>
		queryOptions({
			queryKey: ['authors', 'week'],
			queryFn: () => tierListService.getTopAuthorOfWeek(),
			staleTime: 1000 * 60 * 30,
		}),
}
