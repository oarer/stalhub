import {
	infiniteQueryOptions,
	queryOptions,
} from '@tanstack/react-query'

import { auctionService } from '@/services/auction/auction.service'
import type { AuctionParams } from '@/types/api.type'
import type { LotsHistoryResponse, LotsResponse } from '@/types/item.type'

class AuctionQueries {
	lots({
		id,
		limit,
		offset,
		additional,
		region,
	}: AuctionParams & { region?: string }) {
		return queryOptions<LotsResponse>({
			queryKey: [
				'auction',
				'lots',
				id,
				limit,
				offset,
				additional,
				region,
			],
			queryFn: () =>
				auctionService.getLots({ id, limit, offset, additional, region }),
			placeholderData: undefined,
			staleTime: 1000 * 60,
		})
	}

	history({
		id,
		limit,
		offset,
		additional,
		region,
	}: AuctionParams & { region?: string }) {
		return queryOptions<LotsHistoryResponse>({
			queryKey: [
				'auction',
				'history',
				id,
				limit,
				offset,
				additional,
				region,
			],
			queryFn: () =>
				auctionService.getHistory({
					id,
					limit,
					offset,
					additional,
					region,
				}),
			placeholderData: undefined,
			staleTime: 1000 * 60,
		})
	}

	lotsInfinite({
		id,
		limit = 50,
		additional,
		region,
	}: AuctionParams & { region?: string }) {
		return infiniteQueryOptions<LotsResponse>({
			queryKey: [
				'auction',
				'lots-infinite',
				id,
				limit,
				additional,
				region,
			],
			queryFn: ({ pageParam }) =>
				auctionService.getLots({
					id,
					limit,
					offset: pageParam as number,
					additional,
					region,
				}),
			initialPageParam: 0,
			getNextPageParam: (lastPage, allPages) => {
				const loaded = allPages.reduce((sum, page) => sum + page.lots.length, 0)
				return loaded < lastPage.total ? loaded : undefined
			},
			staleTime: 1000 * 60,
		})
	}

	historyInfinite({
		id,
		limit = 50,
		additional,
		region,
	}: AuctionParams & { region?: string }) {
		return infiniteQueryOptions<LotsHistoryResponse>({
			queryKey: [
				'auction',
				'history-infinite',
				id,
				limit,
				additional,
				region,
			],
			queryFn: ({ pageParam }) =>
				auctionService.getHistory({
					id,
					limit,
					offset: pageParam as number,
					additional,
					region,
				}),
			initialPageParam: 0,
			getNextPageParam: (lastPage, allPages) => {
				const loaded = allPages.reduce(
					(sum, page) => sum + page.prices.length,
					0
				)
				return loaded < lastPage.total ? loaded : undefined
			},
			staleTime: 1000 * 60,
		})
	}
}

export const auctionQueries = new AuctionQueries()
