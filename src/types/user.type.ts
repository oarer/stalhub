import type { Article } from './article.type'
import type { BuildApi } from './build-api.type'
import type { ClanHistoryEntry, PublicClan } from './clan/clan.type'
import { Alliance } from './player.type'

export interface User {
	id: number
	username: string
	name: string | null
	joined_at: string
	name_changed_at: string | null
	username_changed_at: string | null
	onboarded: boolean
	social_links: Record<string, string> | null

	settings: UserSettings | null
	badges: UserBadge[]
	roles: UserRole[]

	providers: {
		discord: DiscordProvider | null
		telegram: TelegramProvider | null
		exbo: ExboProvider | null
	}

	customization: UserCustomization
}

interface UserCustomization {
	layout: string
	bannerMode: BannerMode
	bannerType: BannerType
	bannerColor: string
	bannerImage: string
	cardBackground: CardBackground
	cardColor: string
	avatar: string | null
}

export type Layout = 'CLASSIC' | 'MODERN' | 'COMPACT'
export type BannerMode = 'COLOR' | 'IMAGE' | 'NONE'
export type BannerType = 'BACKGROUND' | 'HEADER'
export type CardBackground = 'COLOR' | 'AVATAR' | 'NONE'
type AvatarSource = 'DISCORD' | 'TELEGRAM'

export interface UserSettings {
	id: string
	public_profile: boolean
	region?: string | null
	region_changed_at?: string | null
	avatar?: {
		current: string
		available: string[]
	}
	avatar_image?: string | null
}

export interface UserBadge {
	id: string
	name: string
	icon: string | null
	image: string | null
	color: string
}

interface UserRole {
	id: number
	name: string
	description: string | null
}

interface DiscordProvider {
	id: string
	name: string
	username: string
}

interface TelegramProvider {
	id: string
	name: string
	username: string
}

interface ExboProvider {
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

export type PublicUser = Pick<
	User,
	'id' | 'username' | 'name' | 'joined_at' | 'badges' | 'customization'
> & {
	stars_count: number
	social_links: Record<string, string> | null

	builds: PublicUserBuild[]
	articles: PublicUserArticle[]

	clan: PublicClan | null
	clan_history: ClanHistoryEntry[]
}

export type PublicUserBuild = Pick<
	BuildApi,
	'id' | 'title' | 'tags' | 'created_at' | 'data' | 'price' | 'is_starred'
> & {
	tags: string
}

export type PublicUserArticle = Pick<
	Article,
	'id' | 'type' | 'title' | 'image_url' | 'created_at' | 'stars'
> & {
	tags: string
}

export interface PaginatedResponse<T> {
	data: T[]
	total: number
	page: number
	take: number
}

export interface UpdateUserSettingsDto {
	public_profile?: boolean

	name?: string
	username?: string
	region?: string

	layout?: Layout

	bannerMode?: BannerMode
	bannerType?: BannerType
	bannerColor?: string
	bannerImage?: string

	cardBackground?: CardBackground
	cardColor?: string

	social_links?: Record<string, string>

	avatar?: AvatarSource
}

export const allianceBackground: Record<Alliance, string> = {
	[Alliance.MERC]: 'bg-linear-to-r from-sky-950 to-sky-500',
	[Alliance.COVENANT]: 'bg-linear-to-r from-purple-950 to-purple-600',
	[Alliance.FREEDOM]: 'bg-linear-to-r from-green-950 to-green-600',
	[Alliance.DUTY]: 'bg-linear-to-r from-red-950 to-red-700',
	[Alliance.BANDITS]: 'bg-linear-to-r from-neutral-900 to-neutral-500',
	[Alliance.STALKERS]: 'bg-linear-to-r from-amber-950 to-yellow-600',
}
