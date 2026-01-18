import axios from 'axios'

import type { PlayerInfo, PlayerParams } from '@/types/player.type'

class PlayerService {
    async get({ region, character }: PlayerParams) {
        const { data } = await axios.get<PlayerInfo>(
            `/api/player/${region}/${character}`
        )
        return data
    }
}

export const playerService = new PlayerService()
