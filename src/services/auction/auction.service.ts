import { apiClient } from '@/app/api/interceptors/root.interceptor'
import { type AuctionParams, Regions } from '@/types/api.type'
import type { LotsHistoryResponse, LotsResponse } from '@/types/item.type'

class AuctionService {
	async getLots({
		id,
		limit = 10,
		additional = true,
		region = Regions.RU,
	}: AuctionParams): Promise<LotsResponse> {
		const { data } = await apiClient.get<LotsResponse>(
			`/api/v1/auction/${region}/${id}/lots`,
			{
				params: { limit, additional },
			}
		)
		return data
	}

	async getHistory({
		id,
		limit = 10,
		additional = true,
		region = Regions.RU,
	}: AuctionParams): Promise<LotsHistoryResponse> {
		const { data } = await apiClient.get<LotsHistoryResponse>(
			`/api/v1/auction/${region}/${id}/history`,
			{
				params: { limit, additional },
			}
		)
		return data
	}
}

export const auctionService = new AuctionService()
