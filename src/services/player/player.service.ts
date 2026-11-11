import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { OperationSessionListing } from '@/types/operations/operation.type'
import type {
	PlayerParams,
	PlayerResponse,
	PlayerStatsResponse,
} from '@/types/player.type'
import type { PlayerGearResponse } from '@/types/playerGear.type'

type UnifiedPlayerResponse = PlayerResponse & {
	player?: PlayerResponse
	uno?: Partial<PlayerResponse>
	gear?: PlayerGearResponse | null
}

function normalizePlayerResponse(data: UnifiedPlayerResponse): PlayerResponse {
	if (!data.player) return data

	return {
		...data.player,
		...data.uno,
		gear: data.gear ?? data.uno?.gear ?? data.player.gear ?? null,
		strings: data.strings ?? data.uno?.strings ?? data.player.strings,
		music: data.music ?? data.uno?.music ?? data.player.music,
		ascii: data.ascii ?? data.uno?.ascii ?? data.player.ascii,
	}
}

class PlayerService {
	async get({ region, character }: PlayerParams): Promise<PlayerResponse> {
		const { data } = await apiClient.get<UnifiedPlayerResponse>(
			`/api/v1/player/${region}/${encodeURIComponent(character)}`,
			{
				params: {
					history: true,
					...(region === 'RU' ? { gear: true, strings: true } : {}),
				},
			}
		)
		return normalizePlayerResponse(data)
	}

	async getGear({
		character,
	}: {
		character: string
	}): Promise<PlayerGearResponse> {
		const { data } = await apiClient.get<PlayerGearResponse>(
			`/api/v1/uno/players/${character}/gear`,
			{ timeout: 20_000 }
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
