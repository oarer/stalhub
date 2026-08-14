import { queryOptions } from '@tanstack/react-query'
import { artifactsPricesService } from '@/services/calcs/artifacts-prices.service'
import type { ArtPriceQuery, ArtPricesResponse } from '@/types/artifacts.type'

class ArtifactsPricesQueries {
	prices(queries: ArtPriceQuery[], region: string) {
		return queryOptions<ArtPricesResponse>({
			queryKey: ['artifacts-prices', region, queries],
			queryFn: () => artifactsPricesService.getPrices(queries, region),
			staleTime: 1000 * 60 * 30,
			enabled: queries.length > 0,
			placeholderData: undefined,
		})
	}
}

export const artifactsPricesQueries = new ArtifactsPricesQueries()
