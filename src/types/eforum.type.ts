export type EForumQuote = {
	author: string | null
	authorUrl: string | null
	html: string
	text: string
}

export type EForumComment = {
	id: string
	author: {
		name: string
		profileUrl: string
	}
	link: string
	discussion: {
		slug: string | null
		postNumber: number | null
	}
	createdAt: string
	quotes: EForumQuote[]
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

export type EForumAuthor = {
	name: string
	profileUrl: string
}

export type EForumAuthorsResponse = {
	total: number
	authors: EForumAuthor[]
}
