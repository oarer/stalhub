import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminAuctionHistoryProgress } from '@/types/admin.type'

const BASE = '/api/v1/auction-history/progress'

class AdminAuctionHistoryService {
	async progress(): Promise<AdminAuctionHistoryProgress> {
		const { data } = await apiClient.get<AdminAuctionHistoryProgress>(BASE)
		return data
	}

	async deepen(): Promise<{ started: boolean }> {
		const { data } = await apiClient.post<{ started: boolean }>(
			'/api/v1/auction-history/deepen'
		)
		return data
	}

	async census(): Promise<{ started: boolean }> {
		const { data } = await apiClient.post<{ started: boolean }>(
			'/api/v1/auction-history/census'
		)
		return data
	}
}

export const adminAuctionHistoryService = new AdminAuctionHistoryService()
