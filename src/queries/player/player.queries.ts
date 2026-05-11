import { queryOptions } from '@tanstack/react-query'

import { playerService } from '@/services/player/player.service'
import type {
	PlayerParams,
	PlayerResponse,
	PlayerStatsResponse,
} from '@/types/player.type'

class PlayerQueries {
	get({ region, character }: PlayerParams) {
		return queryOptions<PlayerResponse>({
			queryKey: ['player', region, character],
			queryFn: () => playerService.get({ region, character }),
			placeholderData: undefined,
			staleTime: 1000 * 60,
		})
	}

	getPopular({ limit = 15 }: { limit?: number } = {}) {
		return queryOptions<PlayerStatsResponse[]>({
			queryKey: ['playerPopular'],
			queryFn: () => playerService.getPopular({ limit }),
			placeholderData: undefined,
			staleTime: 1000,
		})
	}

	getRecent({ limit = 15 }: { limit?: number } = {}) {
		return queryOptions<PlayerStatsResponse[]>({
			queryKey: ['playerRecent'],
			queryFn: () => playerService.getRecent({ limit }),
			placeholderData: undefined,
			staleTime: 1000 * 60,
		})
	}
}

export const playerQueries = new PlayerQueries()
