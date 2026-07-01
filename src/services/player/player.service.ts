import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	PlayerParams,
	PlayerResponse,
	PlayerStatsResponse,
} from '@/types/player.type'

class PlayerService {
	async get({ region, character }: PlayerParams): Promise<PlayerResponse> {
		const { data } = await apiClient.get<PlayerResponse>(
			`/api/v1/player/${region}/${character}`
		)
		return data
	}

	async getPopular({
		limit,
	}: {
		limit: number
	}): Promise<PlayerStatsResponse[]> {
		const { data } = await apiClient.get<PlayerStatsResponse[]>(
			`/api/v1/player/popular`,
			{ params: { limit: limit } }
		)
		return data
	}

	async getRecent({
		limit,
	}: {
		limit: number
	}): Promise<PlayerStatsResponse[]> {
		const { data } = await apiClient.get<PlayerStatsResponse[]>(
			`/api/v1/player/recent`,
			{ params: { limit: limit } }
		)
		return data
	}
}

export const playerService = new PlayerService()
