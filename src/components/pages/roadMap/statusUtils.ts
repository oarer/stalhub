import type { RoadMap } from '@/constants/roadMap.const'
import { roadMap } from '@/constants/roadMap.const'

export type Status = RoadMap['status']

export const getTasksByStatus = (status: Status) => {
    return roadMap.filter((t) => t.status === status)
}

export const getSubTaskBgColor = (status: Status) => {
    switch (status) {
        case 'review':
            return 'bg-sky-50 dark:bg-sky-900/30 border-sky-100 dark:border-sky-700/50'
        case 'inDev':
            return 'bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-700/50'
        case 'production':
            return 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-700/50'
        case 'cancel':
            return 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-700/50'
        default:
            return 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700/50'
    }
}
