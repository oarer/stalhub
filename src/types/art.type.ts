export enum ArtType {
	DEFAULT = 'DEFAULT',
	NSFW = 'NSFW',
}

export interface Art {
	id: string
	external_id: string
	type: ArtType
	title?: string
	description?: string
	image_url: string | null
	tags: string[]
	views: number
	author: ArtAuthor
	stars_count: number
	is_starred: boolean
	comments_count?: number
	created_at: string
	updated_at: string
}

export interface ArtAuthor {
	id: number | null
	username: string
	name: string
	social_links?: Record<string, string> | null
}

export interface ArtCreate {
	title: string
	type?: ArtType
	image_url?: string | null
	tags?: string[]
	description?: string
}

export interface ArtUpdate {
	title?: string
	type?: ArtType
	image_url?: string | null
	tags?: string[]
	description?: string
}

export interface ArtComment {
	id: number
	content: string
	author: ArtCommentAuthor
	parent_id: number | null
	replies?: ArtComment[]
	created_at: string
}

export interface ArtCommentAuthor {
	id: number
	username: string
	name: string
}

export interface ArtCommentCreate {
	content: string
	parent_id?: number
}
