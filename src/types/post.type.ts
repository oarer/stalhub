import type { BuildApi } from './build-api.type'
import type { TierList } from './tier-list.type'
import type { Author } from './common.type'

export type PostSource = 'USER' | 'TG' | 'YOUTUBE' | 'EFORUM'

export type PostPollType = 'single' | 'multiple'

export interface PostPollOption {
	id: number
	text: string
	votes_count: number
}

export interface PostPoll {
	id: number
	question: string
	type: PostPollType
	options: PostPollOption[]
	total_votes: number
	my_vote_option_ids: number[]
}

export interface PostRepostOf {
	external_id: string
	title: string | null
	content: string
	image_urls: string[]
	author?: { username: string; name?: string | null }
	author_name?: string | null
	created_at: string
}

export interface PostAuthor extends Author {
	id: number
	name: string | null
}

export interface PostEditedBy {
	id: number
	username: string
}

export interface Post {
	id: string
	external_id: string
	title: string | null
	content: string
	image_urls: string[]
	poll?: PostPoll
	author: PostAuthor | null
	author_name?: string | null
	created_at: string
	updated_at: string
	stars_count: number
	is_starred: boolean
	comments_count?: number
	attached_builds?: BuildApi[]
	attached_tier_lists?: TierList[]
	repost_of?: PostRepostOf
	source: PostSource
	edited_by?: PostEditedBy | null
	can_manage?: boolean
}

export interface PostCreate {
	title?: string
	content: string
	image_urls?: string[]
	poll?: { question: string; type: PostPollType; options: string[] }
	attached_build_ids?: Array<string | number>
	attached_tier_list_ids?: Array<string | number>
}

export interface PostUpdate extends Omit<PostCreate, 'title'> {
	title?: string | null
}

/** Минимальный набор полей поста, нужный форме редактирования. */
export type PostEditable = Pick<
	Post,
	'external_id' | 'title' | 'content' | 'image_urls'
> & {
	poll?: PostPoll | null
	attached_builds?: BuildApi[]
	attached_tier_lists?: TierList[]
}
