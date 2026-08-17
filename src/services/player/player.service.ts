import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { OperationSessionListing } from '@/types/operations/operation.type'
import type {
	PlayerParams,
	PlayerResponse,
	PlayerStatsResponse,
} from '@/types/player.type'

class PlayerService {
	async get({ region, character }: PlayerParams): Promise<PlayerResponse> {
		const { data } = await apiClient.get<PlayerResponse>(
			`/api/v1/player/${region}/${character}`,
			{ params: { history: true } }
		)
		return data
	}

	async getOperations({
		region,
		username,
		limit = 20,
		offset = 0,
	}: {
		region: string
		username?: string
		limit?: number
		offset?: number
	}): Promise<OperationSessionListing> {
		const { data } = await apiClient.get<OperationSessionListing>(
			`/api/v1/player/${region}/operations/sessions`,
			{
				params: {
					...(username ? { username } : {}),
					limit,
					offset,
				},
			}
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
