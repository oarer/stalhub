import type { UserBadge } from './user.type'

export enum ArtType {
	DEFAULT = 'DEFAULT',
	NSFW = 'NSFW',
}

export const ART_IMAGES_MAX_COUNT = 10

export interface Art {
	id: string
	external_id: string
	type: ArtType
	title: string
	description?: string
	image_url: string | null
	image_urls: string[]
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
	badges: UserBadge[]
}

export interface ArtCreate {
	title: string
	type?: ArtType
	image_url?: string | null
	image_urls?: string[]
	tags?: string[]
	description?: string
}

export interface ArtUpdate {
	title?: string
	type?: ArtType
	image_url?: string | null
	image_urls?: string[] | null
	tags?: string[]
	description?: string
}

export function getArtImages(art: {
	image_urls?: string[] | null
	image_url?: string | null
}): string[] {
	if (art.image_urls && art.image_urls.length > 0) return art.image_urls
	if (art.image_url) return [art.image_url]
	return []
}

export function normalizeArtImagesInput(
	urls: (string | null | undefined)[],
	fallbackUrl?: string | null
): string[] {
	const cleaned: string[] = []
	for (const raw of urls) {
		const trimmed = raw?.trim()
		if (!trimmed || cleaned.includes(trimmed)) continue
		cleaned.push(trimmed)
		if (cleaned.length >= ART_IMAGES_MAX_COUNT) break
	}
	if (cleaned.length === 0 && fallbackUrl?.trim()) {
		cleaned.push(fallbackUrl.trim())
	}
	return cleaned.slice(0, ART_IMAGES_MAX_COUNT)
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
	badges: UserBadge[]
}

export interface ArtCommentCreate {
	content: string
	parent_id?: number
}
