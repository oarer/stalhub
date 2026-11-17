import type { Art } from './art.type'
import type { BuildApi } from './build-api.type'
import type { Post } from './post.type'
import type { TierList } from './tier-list.type'

export const FEED_CONTENT_TYPES = [
	'build',
	'tier_list',
	'post',
	'art',
	'eforum',
] as const

export type FeedContentType = (typeof FEED_CONTENT_TYPES)[number]
export type FeedSort = 'new' | 'top'

export interface FeedCategory {
	id: number
	name: string
	position: number
	sources_count: number
}

export interface FeedCategoriesResponse {
	categories: FeedCategory[]
}

// Типы элементов ленты — упрощённые версии базовых типов
export type FeedBuild = Pick<
	BuildApi,
	| 'id'
	| 'external_id'
	| 'title'
	| 'data'
	| 'tags'
	| 'author'
	| 'created_at'
	| 'hidden_from_feed'
> & {
	image_url?: string | null
	preview_image?: string | null
	screenshot_url?: string | null
	description?: string | null
	comments_count?: number
}

export type FeedTierList = Pick<
	TierList,
	| 'id'
	| 'external_id'
	| 'title'
	| 'description'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'item_kind'
	| 'category'
	| 'entry_count'
	| 'hidden_from_feed'
> & {
	image_url?: string | null
	preview_image?: string | null
	comments_count?: number
	entries?: Array<{ item_id: string; rank: string }>
}

export type FeedPost = Pick<
	Post,
	| 'id'
	| 'external_id'
	| 'title'
	| 'content'
	| 'image_urls'
	| 'poll'
	| 'author'
	| 'author_name'
	| 'created_at'
	| 'updated_at'
	| 'attached_builds'
	| 'attached_tier_lists'
	| 'repost_of'
	| 'source'
	| 'source_url'
	| 'source_avatar_url'
	| 'edited_by'
	| 'can_manage'
>

export type FeedArt = Pick<
	Art,
	| 'id'
	| 'external_id'
	| 'title'
	| 'image_url'
	| 'image_urls'
	| 'description'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'type'
	| 'tags'
>

export interface FeedItem {
	type: FeedContentType
	stars_count: number
	comments_count: number
	is_starred: boolean
	build?: FeedBuild
	tier_list?: FeedTierList
	post?: FeedPost
	art?: FeedArt
}

export interface FeedResponse {
	data: FeedItem[]
	total_count: number
	page: number
	take: number
}

export type FeedBuildDetail = BuildApi & {
	comments_count?: number
}

export type FeedTierListDetail = TierList & {
	stars_count?: number
	is_starred?: boolean
	comments_count?: number
}
