import { queryOptions } from '@tanstack/react-query'
import { upgradePricesService } from '@/services/calcs/upgrade-prices.service'
import type { UpgradePricesResponse } from '@/types/upgrade.type'

class UpgradePricesQueries {
	get(region: string) {
		return queryOptions<UpgradePricesResponse>({
			queryKey: ['upgrade-prices', region],
			queryFn: () => upgradePricesService.getPrices(region),
			staleTime: 1000 * 60 * 60,
			retry: 1,
			placeholderData: undefined,
		})
	}
}

export const upgradePricesQueries = new UpgradePricesQueries()