import type { Build } from './build.type'

export interface BuildApi {
	id: string
	title: string
	data: Build
	flags: number | null
	tags: string[]
	author: BuildApiAuthor
	stars: number
	starred: boolean
	created_at: string
	updated_at: string
}

interface BuildApiAuthor {
	id: number
	username: string
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
