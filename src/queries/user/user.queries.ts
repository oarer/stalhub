import { queryOptions } from '@tanstack/react-query'

import { userService } from '@/services/user/user.service'
import type {
	Notification,
	PaginatedResponse,
	Session,
	StarredItem,
	User,
	UserSettings,
} from '@/types/user.type'

class UserQueries {
	getMe() {
		return queryOptions<User>({
			queryKey: ['user', 'me'],
			queryFn: () => userService.getMe(),
			staleTime: 1000 * 60,
			retry: false,
		})
	}

	getSettings() {
		return queryOptions<UserSettings>({
			queryKey: ['user', 'settings'],
			queryFn: () => userService.getSettings(),
			staleTime: 1000 * 60,
		})
	}

	getSessions() {
		return queryOptions<Session[]>({
			queryKey: ['user', 'sessions'],
			queryFn: () => userService.getSessions(),
			staleTime: 1000 * 30,
		})
	}

	getStars({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<StarredItem>>({
			queryKey: ['user', 'stars', { take, page }],
			queryFn: () => userService.getStars({ take, page }),
			staleTime: 1000 * 60,
		})
	}

	getNotifications({ take = 20, page = 1 } = {}) {
		return queryOptions<PaginatedResponse<Notification>>({
			queryKey: ['user', 'notifications', { take, page }],
			queryFn: () => userService.getNotifications({ take, page }),
			staleTime: 1000 * 30,
		})
	}

	getUnreadCount() {
		return queryOptions<number>({
			queryKey: ['user', 'notifications', 'unread'],
			queryFn: () => userService.getUnreadCount(),
			staleTime: 1000 * 15,
			refetchInterval: 1000 * 30,
		})
	}
}

export const userQueries = new UserQueries()
