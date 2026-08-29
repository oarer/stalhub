export enum TierRank {
	S = 'S',
	A = 'A',
	B = 'B',
	C = 'C',
	D = 'D',
	E = 'E',
}

export enum TierListKind {
	SYSTEM = 'SYSTEM',
	USER = 'USER',
}

export enum TierItemKind {
	ARMOR = 'ARMOR',
	WEAPON = 'WEAPON',
}

export const TIER_RANK_COLORS: Record<
	TierRank,
	{ bg: string; text: string; ring: string }
> = {
	[TierRank.S]: {
		bg: 'bg-red-500/10',
		text: 'text-red-400',
		ring: 'ring-red-500/30',
	},
	[TierRank.A]: {
		bg: 'bg-orange-500/10',
		text: 'text-orange-400',
		ring: 'ring-orange-500/30',
	},
	[TierRank.B]: {
		bg: 'bg-yellow-500/10',
		text: 'text-yellow-400',
		ring: 'ring-yellow-500/30',
	},
	[TierRank.C]: {
		bg: 'bg-green-500/10',
		text: 'text-green-400',
		ring: 'ring-green-500/30',
	},
	[TierRank.D]: {
		bg: 'bg-blue-500/10',
		text: 'text-blue-400',
		ring: 'ring-blue-500/30',
	},
	[TierRank.E]: {
		bg: 'bg-neutral-500/10',
		text: 'text-neutral-400',
		ring: 'ring-neutral-500/30',
	},
}

export const ALL_TIER_RANKS = [
	TierRank.S,
	TierRank.A,
	TierRank.B,
	TierRank.C,
	TierRank.D,
	TierRank.E,
]

export interface TierListEntry {
	id: number
	item_id: string
	rank: TierRank
	ttk: number | null
	position: number
}

export interface TierList {
	id: string
	external_id: string
	title: string
	description: string
	kind: TierListKind
	item_kind: TierItemKind
	scenario: string | null
	category: string | null
	is_public: boolean
	is_current?: boolean
	generated_at?: string | null
	removed_at?: string | null
	previous_version?: TierList | null
	author: TierListAuthor | null
	views: number
	entries?: TierListEntry[]
	entry_count?: number
	created_at: string
	updated_at: string
}

interface TierListAuthor {
	id: number
	name: string
	username: string
}

export interface TierListCreate {
	title: string
	description?: string
	item_kind?: TierItemKind
	is_public?: boolean
	scenario?: string
	category?: string
	entries?: Array<{ item_id: string; rank: TierRank; position?: number }>
}

export interface WeeklyTopWork {
	kind: 'build' | 'article' | 'art' | 'tier_list'
	id: number
	external_id: string
	title: string
	views: number
	popularity: number
	created_at: string
	author: TierListAuthor | null
	image_url?: string | null
}

export interface WeeklyTopAuthor {
	user: TierListAuthor
	views: {
		builds: number
		articles: number
		arts: number
		tier_lists: number
		total: number
	}
	works: WeeklyTopWork[]
}

export interface WeeklyTopsResponse {
	week: WeeklyTopAuthor | null
	month: WeeklyTopAuthor[]
}

export interface TierListUpdate {
	title?: string
	description?: string
	is_public?: boolean
	category?: string
	entries?: Array<{ item_id: string; rank: TierRank; position?: number }>
}
