import type { UserBadge } from './user.type'

/**
 * Базовый интерфейс автора контента
 */
export interface Author {
	id: number | null
	username: string
	name?: string | null
	avatar?: string | null
	badges?: UserBadge[]
}

/**
 * Базовые поля статистики контента
 */
export interface ContentStats {
	views?: number
	stars_count?: number
	is_starred?: boolean
	comments_count?: number
}

/**
 * Базовые временные метки
 */
export interface Timestamps {
	created_at: string
	updated_at?: string
}
