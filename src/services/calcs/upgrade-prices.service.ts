import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { UpgradePricesResponse } from '@/types/upgrade.type'

class UpgradePricesService {
	async getPrices(region: string): Promise<UpgradePricesResponse> {
		const { data } = await apiClient.get<UpgradePricesResponse>(
			`/api/v1/upgrade-prices/${region}`
		)
		return data
	}
}

export const upgradePricesService = new UpgradePricesService()