import { queryOptions } from '@tanstack/react-query'

import { playerService } from '@/services/player/player.service'
import type { PlayerParams, PlayerInfo } from '@/types/player.type'

class PlayerQueries {
    get({ region, character }: PlayerParams) {
        return queryOptions<PlayerInfo>({
            queryKey: ['player', region, character],
            queryFn: () => playerService.get({ region, character }),
            placeholderData: undefined,
            staleTime: 1000 * 60,
        })
    }
}

export const playerQueries = new PlayerQueries()
