import { queryOptions } from '@tanstack/react-query'
import { globalNotificationService } from '@/services/global-notification/global-notification.service'

class GlobalNotificationQueries {
	list() {
		return queryOptions({
			queryKey: ['global-notifications'],
			queryFn: () => globalNotificationService.list(),
			staleTime: 1000 * 60,
			refetchInterval: 1000 * 60,
			retry: false,
		})
	}

	adminList() {
		return queryOptions({
			queryKey: ['admin', 'notifications', 'global'],
			queryFn: () => globalNotificationService.listAdmin(),
			staleTime: 1000 * 30,
			retry: false,
		})
	}
}

export const globalNotificationQueries = new GlobalNotificationQueries()
