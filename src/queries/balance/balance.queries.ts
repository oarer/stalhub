import { queryOptions } from '@tanstack/react-query'
import { balanceDiffService } from '@/services/balance/balance.service'
import type { BalanceDiffsResponse } from '@/types/balance-diff.type'

class BalanceDiffQueries {
	latest() {
		return queryOptions<BalanceDiffsResponse>({
			queryKey: ['balance-diffs'],
			queryFn: () => balanceDiffService.getDiffs(),
			staleTime: 1000 * 60,
		})
	}

	archived(timestamp: string) {
		return queryOptions<BalanceDiffsResponse>({
			queryKey: ['balance-diffs', 'archive', timestamp],
			queryFn: () => balanceDiffService.getArchived(timestamp),
			staleTime: 1000 * 60 * 60,
		})
	}
}

export const balanceDiffQueries = new BalanceDiffQueries()
