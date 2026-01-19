import type { RoadMap } from '@/constants/roadMap.const'
import { roadMap } from '@/constants/roadMap.const'

export type Status = RoadMap['status']

export const getTasksByStatus = (status: Status) => {
	return roadMap.filter((t) => t.status === status)
}

export const getSubTaskBgColor = (status: Status) => {
	switch (status) {
		case 'review':
			return 'bg-sky-50 dark:bg-sky-900/30 ring-sky-100 dark:ring-sky-700/50'
		case 'inDev':
			return 'bg-orange-50 dark:bg-orange-900/30 ring-orange-100 dark:ring-orange-700/50'
		case 'production':
			return 'bg-green-50 dark:bg-green-900/30 ring-green-100 dark:ring-green-700/50'
		case 'cancel':
			return 'bg-red-50 dark:bg-red-900/30 ring-red-100 dark:ring-red-700/50'
		default:
			return 'bg-neutral-50 dark:bg-neutral-900/50 ring-white dark:ring-neutral-700/50'
	}
}
