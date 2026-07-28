import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type { Regions } from '@/types/api.type'
import type { PlayerResponse } from '@/types/player.type'

class ExboService {
	async getCharacters(region: Regions): Promise<PlayerResponse[]> {
		const { data } = await apiClient.get<PlayerResponse[]>(
			`/api/v1/exbo/${region}/characters`
		)
		return data
	}
}

export const exboService = new ExboService()
