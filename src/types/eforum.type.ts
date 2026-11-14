export type EForumQuote = {
	author: string | null
	authorDisplayName: string | null
	authorUrl: string | null
	authorAvatarUrl: string | null
	link: string | null
	postId: string | null
	html: string
	text: string
}

export type EForumBlock = {
	kind: 'text' | 'quote'
	html: string
	text: string
	quote: EForumQuote | null
}

export type EForumAuthor = {
	name: string
	displayName: string
	profileUrl: string
	avatarUrl: string | null
}

export type EForumComment = {
	id: string
	author: EForumAuthor
	link: string
	discussion: {
		slug: string | null
		title: string | null
		postNumber: number | null
	}
	createdAt: string
	quotes: EForumQuote[]
	blocks: EForumBlock[]
	response: {
		html: string
		text: string
	}
	text: string
	images: string[]
	videos: string[]
}

export type EForumResponse = {
	items: EForumComment[]
	total: number
	limit: number
	offset: number
	hasMore: boolean
	updatedAt: string
	lastCheck?: {
		startedAt: string
		finishedAt: string | null
		checked: number
		newCount: number
		errors: number
	} | null
}

export type EForumParams = {
	author?: string
	authors?: string | string[]
	limit?: number
	offset?: number
	since?: string
}

export type EForumAuthorsResponse = {
	total: number
	authors: EForumAuthor[]
}
