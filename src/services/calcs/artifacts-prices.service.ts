import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { ArtPriceQuery, ArtPricesResponse } from '@/types/artifacts.type'

class ArtifactsPricesService {
	async getPrices(
		queries: ArtPriceQuery[],
		region: string
	): Promise<ArtPricesResponse> {
		const { data } = await apiClient.post<ArtPricesResponse>(
			`/api/v1/artifacts-prices/${region}`,
			queries
		)
		return data
	}
}

export const artifactsPricesService = new ArtifactsPricesService()
