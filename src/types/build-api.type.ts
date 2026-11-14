import type { Build } from './build.type'
import type { Author } from './common.type'

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
	comments_count?: number
	hidden_from_feed?: boolean
	created_at: string
	updated_at: string
}

export interface BuildApiAuthor extends Author {
	id: number
	avatar: string | null
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
