import { Alliance } from './player.type'

export interface User {
	id: string
	username: string
	name: string | null
	joined_at: string

	settings: UserSettings | null
	badges: UserBadge[]
	roles: UserRole[]

	providers: {
		discord: DiscordProvider | null
		telegram: TelegramProvider | null
		exbo: ExboProvider | null
	}
}

export interface UserSettings {
	id: string
	public_profile: boolean
	avatar: string | null
	bg_variant: BgVariant
	bg_color: string | null
}

export type BgVariant = 'COLOR' | 'AVATAR' | 'NONE'

export interface UserBadge {
	id: string
	name: string
	icon: string | null
	image: string | null
	color: string
}

export interface UserRole {
	id: number
	name: string
	description: string | null
}

export interface DiscordProvider {
	id: string
	name: string
	username: string
}

export interface TelegramProvider {
	id: string
	name: string
	username: string
}

export interface ExboProvider {
	id: string
	login: string
	username: string
}

export interface Session {
	id: number
	ip: string
	user_agent: string
	browser: string
	is_self: boolean
	is_mobile: boolean
	browser_version: string
	last_accessed: Date
}

export interface Notification {
	id: number
	title: string
	content: string
	author: string
	type: number
	read: boolean
	link: string | null
	created_at: string
}

export interface StarredItem {
	id: number
	type: 'build' | 'article'
	item_id: string
	title: string
	created_at: string
}

export interface PaginatedResponse<T> {
	data: T[]
	total: number
	page: number
	take: number
}

export const allianceBackground: Record<Alliance, string> = {
	[Alliance.MERC]: 'bg-linear-to-r from-sky-950 to-sky-500',
	[Alliance.COVENANT]: 'bg-linear-to-r from-purple-950 to-purple-600',
	[Alliance.FREEDOM]: 'bg-linear-to-r from-green-950 to-green-600',
	[Alliance.DUTY]: 'bg-linear-to-r from-red-950 to-red-700',
	[Alliance.BANDITS]: 'bg-linear-to-r from-neutral-900 to-neutral-500',
	[Alliance.STALKERS]: 'bg-linear-to-r from-amber-950 to-yellow-600',
}
