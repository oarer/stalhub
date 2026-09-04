import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	ServerOnlineEntry,
	ServerOnlineHistoryPoint,
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
}

export const serverOnlineService = new ServerOnlineService()
