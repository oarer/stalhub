export enum ArticleStatus {
	PENDING = 'PENDING',
	REVIEW = 'REVIEW',
	DENIED = 'DENIED',
	BANNED = 'BANNED',
	APPROVED = 'APPROVED',
}

export enum ArticleType {
	QUEST = 'QUEST',
	GUIDE = 'GUIDE',
	OTHER = 'OTHER',
	STALHUB = 'STALHUB',
}

export const ARTICLE_STATUS_META: Record<
	ArticleStatus,
	{ label: string; color: string }
> = {
	[ArticleStatus.PENDING]: {
		label: 'Черновик',
		color: 'bg-neutral-500/10 text-neutral-400',
	},
	[ArticleStatus.REVIEW]: {
		label: 'На рассмотрении',
		color: 'bg-yellow-500/10 text-yellow-400',
	},
	[ArticleStatus.DENIED]: {
		label: 'Отклонено',
		color: 'bg-red-500/10 text-red-400',
	},
	[ArticleStatus.BANNED]: {
		label: 'Заблокировано',
		color: 'bg-red-600/10 text-red-500',
	},
	[ArticleStatus.APPROVED]: {
		label: 'Одобрено',
		color: 'bg-green-600/10 text-green-500',
	},
}

export interface Article {
	id: string
	title: string
	content: string
	image_url: string | null
	status: ArticleStatus
	type: ArticleType | null
	flags: number | null
	tags: string[]
	author: ArticleAuthor
	stars_count: number
	is_starred: boolean
	comments_count: number
	created_at: string
	updated_at: string
}

interface ArticleAuthor {
	id: number
	username: string
	avatar: string | null
}

export interface ArticleCreate {
	title: string
	content: string
	image_url?: string | null
	type?: ArticleType
	flags?: number
	tags?: string[]
}

export interface ArticleUpdate {
	title?: string
	content?: string
	image_url?: string | null
	type?: ArticleType
	flags?: number
	tags?: string[]
}

export interface ArticleVersion {
	id: string
	version: number
	title: string
	content: string
	created_at: string
}

export interface ArticleComment {
	id: number
	content: string
	author: ArticleCommentAuthor
	parent_id: number | null
	replies?: ArticleComment[]
	created_at: string
}

interface ArticleCommentAuthor {
	id: number
	username: string
	avatar: string | null
}

export interface ArticleCommentCreate {
	content: string
	parent_id?: number
}
