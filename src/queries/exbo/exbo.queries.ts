import { queryOptions } from '@tanstack/react-query'

import { exboService } from '@/services/exbo/exbo.service'
import type { Regions } from '@/types/api.type'
import type { PlayerResponse } from '@/types/player.type'

class ExboQueries {
	getCharacters(region: Regions) {
		return queryOptions<PlayerResponse[]>({
			queryKey: ['exbo', 'characters', region],
			queryFn: () => exboService.getCharacters(region),
			staleTime: 1000 * 60,
		})
	}
}

export const exboQueries = new ExboQueries()
