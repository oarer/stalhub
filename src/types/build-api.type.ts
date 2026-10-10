import type { Build } from './build.type'
import type { UserBadge } from './user.type'

export interface BuildApi {
	id: string
	external_id: string
	title: string
	data: Build
	flags: number | null
	tags: string[]
	price?: number | null
	views: number
	author: BuildApiAuthor
	is_starred: boolean
	stars_count: number
	created_at: string
	updated_at: string
}

interface BuildApiAuthor {
	id: number
	username: string
	avatar: string | null
	badges: UserBadge[]
}

export interface BuildApiCreate {
	title: string
	data: Build
	flags?: number
	tags?: string[]
}

export interface BuildApiUpdate {
	title?: string
	data?: Build
	flags?: number
	tags?: string[]
}
