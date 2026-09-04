import { queryOptions } from '@tanstack/react-query'
import { serverOnlineService } from '@/services/server-online/server-online.service'
import type {
	ServerOnlineEntry,
	ServerOnlineHistoryPoint,
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
}

export const serverOnlineQueries = new ServerOnlineQueries()
