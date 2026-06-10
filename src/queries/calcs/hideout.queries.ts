import { queryOptions } from '@tanstack/react-query'
import { hideoutService } from '@/services/calcs/hideout.service'
import type { Root } from '@/types/hideout.type'

class HideoutQueries {
	get() {
		return queryOptions<Root>({
			queryKey: ['hideout'],
			queryFn: () => hideoutService.get(),
			staleTime: 1000 * 60 * 10,
		})
	}
}

export const hideoutQueries = new HideoutQueries()
