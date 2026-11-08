import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { unoService } from '@/services/uno/uno.service'
import type {
	UnoDateRangeParams,
	UnoLeaderboardParams,
	UnoVsParams,
} from '@/types/uno/uno.type'

class UnoQueries {
	leaderboard(params: UnoLeaderboardParams = {}) {
		return queryOptions({
			queryKey: ['uno', 'leaderboard', params],
			queryFn: () => unoService.getLeaderboard(params),
			staleTime: 1000 * 60,
			placeholderData: keepPreviousData,
		})
	}

	clans() {
		return queryOptions({
			queryKey: ['uno', 'clans'],
			queryFn: () => unoService.getClans(),
			staleTime: 1000 * 60,
		})
	}

	clan(clanId: string) {
		return queryOptions({
			queryKey: ['uno', 'clan', clanId],
			queryFn: () => unoService.getClan(clanId),
			staleTime: 1000 * 60,
			retry: false,
		})
	}

	analytics(clanId: string, params: UnoDateRangeParams = {}) {
		return queryOptions({
			queryKey: ['uno', 'analytics', clanId, params],
			queryFn: () => unoService.getAnalytics(clanId, params),
			staleTime: 1000 * 60,
		})
	}

	vs(params: UnoVsParams) {
		return queryOptions({
			queryKey: ['uno', 'vs', params],
			queryFn: () => unoService.getVs(params),
			staleTime: 1000 * 60,
			retry: false,
		})
	}

	ratingHistory(clanId: string) {
		return queryOptions({
			queryKey: ['uno', 'rating-history', clanId],
			queryFn: () => unoService.getRatingHistory(clanId),
			staleTime: 1000 * 60,
		})
	}

	history(clanId: string, params: UnoDateRangeParams = {}) {
		return queryOptions({
			queryKey: ['uno', 'history', clanId, params],
			queryFn: () => unoService.getHistory(clanId, params),
			staleTime: 1000 * 60,
		})
	}

	calendar(params: UnoDateRangeParams = {}) {
		return queryOptions({
			queryKey: ['uno', 'calendar', params],
			queryFn: () => unoService.getCalendar(params),
			staleTime: 1000 * 60,
		})
	}

	grids(params: UnoDateRangeParams = {}) {
		return queryOptions({
			queryKey: ['uno', 'grids', params],
			queryFn: () => unoService.getGrids(params),
			staleTime: 1000 * 60,
		})
	}

	grid(gridId: string, params: { q?: string; rank?: string } = {}) {
		return queryOptions({
			queryKey: ['uno', 'grid', gridId, params],
			queryFn: () => unoService.getGrid(gridId, params),
			staleTime: 1000 * 60,
			retry: false,
		})
	}

	seasons() {
		return queryOptions({
			queryKey: ['uno', 'seasons'],
			queryFn: () => unoService.getSeasons(),
			staleTime: 1000 * 60 * 5,
		})
	}
}

export const unoQueries = new UnoQueries()
