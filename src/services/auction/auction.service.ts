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
	}: AuctionParams): Promise<LotsResponse> {
		try {
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
	}: AuctionParams): Promise<LotsHistoryResponse> {
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
