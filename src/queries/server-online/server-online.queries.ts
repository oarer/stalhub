import { queryOptions } from '@tanstack/react-query'
import { serverOnlineService } from '@/services/server-online/server-online.service'
import type {
	EmissionInfo,
	ServerOnlineEntry,
	ServerOnlineHistoryPoint,
	ServerOnlinePeak,
} from '@/types/server-online.type'

class ServerOnlineQueries {
	latest() {
		return queryOptions<ServerOnlineEntry[]>({
			queryKey: ['server-online'],
			queryFn: () => serverOnlineService.latest(),
			staleTime: 1000 * 60 * 5,
			refetchInterval: 1000 * 60 * 5,
		})
	}

	history(hours: number) {
		return queryOptions<ServerOnlineHistoryPoint[]>({
			queryKey: ['server-online', 'history', hours],
			queryFn: () => serverOnlineService.history(hours),
			staleTime: 1000 * 60 * 5,
			refetchInterval: 1000 * 60 * 5,
		})
	}

	peaks(days: number) {
		return queryOptions<ServerOnlinePeak[]>({
			queryKey: ['server-online', 'peaks', days],
			queryFn: () => serverOnlineService.peaks(days),
			staleTime: 1000 * 60 * 10,
		})
	}

	emissions() {
		return queryOptions<EmissionInfo[]>({
			queryKey: ['server-online', 'emissions'],
			queryFn: () => serverOnlineService.emissions(),
			staleTime: 1000 * 60,
			refetchInterval: 1000 * 60,
		})
	}
}

export const serverOnlineQueries = new ServerOnlineQueries()
