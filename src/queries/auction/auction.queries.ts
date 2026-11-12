import {
	infiniteQueryOptions,
	keepPreviousData,
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
		uno,
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
				uno,
			],
			queryFn: () =>
				auctionService.getLots({
					id,
					limit,
					offset,
					additional,
					region,
					uno,
				}),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 60,
			retry: 1,
		})
	}

	history({
		id,
		limit,
		offset,
		additional,
		region,
		uno,
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
				uno,
			],
			queryFn: () =>
				auctionService.getHistory({
					id,
					limit,
					offset,
					additional,
					region,
					uno,
				}),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 60,
			retry: 1,
		})
	}

	lotsInfinite({
		id,
		limit = 50,
		additional,
		region,
		uno,
	}: AuctionParams & { region?: string }) {
		return infiniteQueryOptions<LotsResponse>({
			queryKey: [
				'auction',
				'lots-infinite',
				id,
				limit,
				additional,
				region,
				uno,
			],
			queryFn: ({ pageParam }) =>
				auctionService.getLots({
					id,
					limit,
					offset: pageParam as number,
					additional,
					region,
					uno,
				}),
			initialPageParam: 0,
			getNextPageParam: (lastPage, allPages) => {
				const loaded = allPages.reduce(
					(sum, page) => sum + page.lots.length,
					0
				)
				return loaded < lastPage.total ? loaded : undefined
			},
			staleTime: 1000 * 60,
			retry: 1,
		})
	}

	historyInfinite({
		id,
		limit = 50,
		additional,
		region,
		uno,
	}: AuctionParams & { region?: string }) {
		return infiniteQueryOptions<LotsHistoryResponse>({
			queryKey: [
				'auction',
				'history-infinite',
				id,
				limit,
				additional,
				region,
				uno,
			],
			queryFn: ({ pageParam }) =>
				auctionService.getHistory({
					id,
					limit,
					offset: pageParam as number,
					additional,
					region,
					uno,
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
			retry: 1,
		})
	}
}

export const auctionQueries = new AuctionQueries()
