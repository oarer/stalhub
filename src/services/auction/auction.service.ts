import axios from 'axios'
import { apiClient } from '@/app/api/interceptors/root.interceptor'
import { type AuctionParams, Regions } from '@/types/api.type'
import type { LotsHistoryResponse, LotsResponse } from '@/types/item.type'

const hasNoAuctionData = (error: unknown) => {
	if (!axios.isAxiosError(error)) return false
	const status = error.response?.status
	return status === 400 || status === 404 || status === 422
}

class AuctionService {
	async getLots({
		id,
		limit = 10,
		offset = 0,
		additional = true,
		region = Regions.RU,
		uno,
	}: AuctionParams): Promise<LotsResponse> {
		try {
			if (uno) {
				const { data } = await apiClient.get<LotsResponse>(
					'/api/v1/uno/auction/lots',
					{
						params: {
							item_id: id,
							limit,
							offset,
							sort: 3,
							region: region === Regions.EU ? 'eu' : undefined,
						},
					}
				)
				return data
			}

			const { data } = await apiClient.get<LotsResponse>(
				`/api/v1/auction/${region}/${id}/lots`,
				{
					params: { limit, additional, offset },
				}
			)
			return data
		} catch (error) {
			if (hasNoAuctionData(error)) {
				return { total: 0, lots: [] }
			}
			throw error
		}
	}

	async getHistory({
		id,
		limit = 10,
		offset = 0,
		additional = true,
		region = Regions.RU,
		uno,
	}: AuctionParams): Promise<LotsHistoryResponse> {
		if (uno) {
			return { total: 0, prices: [] }
		}

		try {
			const { data } = await apiClient.get<LotsHistoryResponse>(
				`/api/v1/auction/${region}/${id}/history`,
				{
					params: { limit, additional, offset },
				}
			)
			return data
		} catch (error) {
			if (hasNoAuctionData(error)) {
				return { total: 0, prices: [] }
			}
			throw error
		}
	}
}

export const auctionService = new AuctionService()
