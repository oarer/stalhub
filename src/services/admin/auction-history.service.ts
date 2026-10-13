import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { AdminAuctionHistoryProgress } from '@/types/admin.type'

const BASE = '/api/v1/auction-history/progress'

class AdminAuctionHistoryService {
	async progress(): Promise<AdminAuctionHistoryProgress> {
		const { data } = await apiClient.get<AdminAuctionHistoryProgress>(BASE)
		return data
	}
}

export const adminAuctionHistoryService = new AdminAuctionHistoryService()
