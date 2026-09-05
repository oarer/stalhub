import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	BalanceArchiveResponse,
	BalanceDiffsResponse,
} from '@/types/balance-diff.type'

class BalanceDiffService {
	async getDiffs(refresh = false): Promise<BalanceDiffsResponse> {
		const { data } = await apiClient.get<BalanceDiffsResponse>(
			'/api/v1/balance/diffs',
			{
				params: refresh ? { refresh: true } : undefined,
			}
		)
		return data
	}

	async listArchive(): Promise<BalanceArchiveResponse> {
		const { data } = await apiClient.get<BalanceArchiveResponse>(
			'/api/v1/balance/diffs/archive'
		)
		return data
	}

	async getArchived(timestamp: string): Promise<BalanceDiffsResponse> {
		const { data } = await apiClient.get<BalanceDiffsResponse>(
			`/api/v1/balance/diffs/archive/${timestamp}`
		)
		return data
	}
}

export const balanceDiffService = new BalanceDiffService()
