import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	EmissionInfo,
	ServerOnlineEntry,
	ServerOnlineHistoryPoint,
	ServerOnlinePeak,
} from '@/types/server-online.type'

class ServerOnlineService {
	async latest(): Promise<ServerOnlineEntry[]> {
		const { data } = await apiClient.get<ServerOnlineEntry[]>(
			'/api/v1/server-online'
		)
		return data
	}

	async history(hours: number): Promise<ServerOnlineHistoryPoint[]> {
		const { data } = await apiClient.get<ServerOnlineHistoryPoint[]>(
			'/api/v1/server-online/history',
			{ params: { hours } }
		)
		return data
	}

	async peaks(days: number): Promise<ServerOnlinePeak[]> {
		const { data } = await apiClient.get<ServerOnlinePeak[]>(
			'/api/v1/server-online/peaks',
			{ params: { days } }
		)
		return data
	}

	async emissions(): Promise<EmissionInfo[]> {
		const { data } = await apiClient.get<EmissionInfo[]>(
			'/api/v1/server-online/emissions'
		)
		return data
	}
}

export const serverOnlineService = new ServerOnlineService()
