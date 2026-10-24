import type { ClanSchedule } from './clan/clan.type'

export interface AdminPermission {
	id: number
	name: string
	description: string | null
}

export interface AdminCreatePermission {
	name: string
	description?: string
}

export interface AdminUpdatePermission {
	name?: string
	description?: string
}

export interface AdminRole {
	id: number
	name: string
	description: string | null
	permissions: AdminPermission[]
}

export interface AdminCreateRole {
	name: string
	description?: string
}

export interface AdminUpdateRole {
	name?: string
	description?: string
}

export interface AdminUser {
	id: number
	username: string
	name: string | null
	avatar: string | null
	joined_at: string
	roles: { id: number; name: string }[]
	banned: boolean
}

export interface AdminSession {
	id: number
	ip: string
	user_agent: string
	last_used_at: string
	revoked: boolean
}

export interface AdminUserListParams {
	take?: number
	page?: number
	search?: string
}

export interface AdminBanUser {
	reason?: string
	expires_in?: number
}

export interface AdminAssignPermissions {
	permission_ids: number[]
}

export interface AdminBadge {
	id: number
	name: string
	icon: string | null
	image: string | null
	color: string
}

export interface AdminCreateBadge {
	name: string
	icon?: string | null
	image?: string | null
	color?: string
}

export interface AdminUpdateBadge {
	name?: string
	icon?: string | null
	image?: string | null
	color?: string
}

export interface AdminClan {
	id: string
	name: string
	tag: string
	level: number
	level_points: number
	alliance: string
	description: string
	leader: string
	member_count: number
	region: string
	status: 'FROZEN' | 'ACTIVE'
	is_public: boolean
	recruiting: boolean
	schedule: ClanSchedule | null
	blocked: boolean
	block_reason: string | null
	blocked_at: string | null
	synced_at: string
	created_at: string
	_count?: {
		members: number
		squads: number
		sessions: number
	}
}

export interface AdminClanUpdate {
	name?: string
	tag?: string
	description?: string
	status?: 'FROZEN' | 'ACTIVE'
	is_public?: boolean
	recruiting?: boolean
	region?: string
	schedule?: Partial<ClanSchedule>
}

export interface AdminClanMember {
	id: number
	clan_id: string
	name: string
	rank: string
	join_time: string | null
	user_id: number | null
	user: { id: number; username: string; name: string } | null
	synced_at: string
}

export interface AdminClanStage {
	id: number
	external_id: string
	region: string
	map_name: string
	type: 'TOURNAMENT' | 'BRAWL' | 'BASE_CAPTURE'
	started_at: string
	ended_at: string | null
	stage_number: number | null
	creator_id: number | null
	clan_id: string | null
	_count: {
		screenshots: number
		attendance: number
	}
}

export interface AdminClanStageUpdate {
	map_name?: string
	type?: 'TOURNAMENT' | 'BRAWL' | 'BASE_CAPTURE'
	stage_number?: number | null
	started_at?: string | null
	ended_at?: string | null
	region?: string
}

export interface AdminUserCustomization {
	id?: number
	layout?: string
	banner_mode?: 'COLOR' | 'IMAGE' | 'NONE'
	banner_type?: 'BACKGROUND' | 'HEADER'
	banner_color?: string
	banner_image?: string | null
	card_background?: string
	card_color?: string
	avatar?: 'DISCORD' | 'TELEGRAM' | null
	avatar_image?: string | null
}

export interface AdminUpdateUser {
	username?: string
	name?: string
	onboarded?: boolean
	public_profile?: boolean
	social_links?: Record<string, string>
}

export interface AdminUpdateUserCustomization {
	layout?: 'CLASSIC' | 'MODERN' | 'COMPACT'
	banner_mode?: 'COLOR' | 'IMAGE' | 'NONE'
	banner_type?: 'BACKGROUND' | 'HEADER'
	banner_color?: string
	banner_image?: string | null
	card_background?: 'COLOR' | 'AVATAR' | 'NONE'
	card_color?: string
	avatar?: 'DISCORD' | 'TELEGRAM' | null
}

export interface AdminUserDetail extends AdminUser {
	username_changed_at?: string
	onboarded?: boolean
	social_links?: Record<string, string> | null
	customization?: AdminUserCustomization | null
	discord_auth?: {
		id: number
		discord_id: string
		name: string
		username: string
		avatar_id: string | null
		connected_at: string
	} | null
	telegram_auth?: {
		id: number
		telegram_id: string
		name: string
		login: string | null
		avatar_id: string | null
		connected_at: string
	} | null
	exbo_auth?: {
		id: number
		exbo_id: string
		login: string
		username: string
		region: string | null
		region_changed_at: string | null
		connected_at: string
	} | null
	user_settings?: {
		banned: boolean
		ban_reason: string | null
		ban_expires_at: string | null
		public_profile?: boolean
	} | null
	_count?: {
		sessions: number
		builds: number
		articles: number
		stars: number
	}
}

export interface AdminBanLog {
	id: number
	user_id: number
	rule: string
	severity: 'WARN' | 'BAN'
	auto: boolean
	reason: string
	meta: Record<string, unknown> | null
	created_at: string
	user: { id: number; username: string; name: string | null }
}

export interface AdminBanStats {
	total_warnings: number
	total_bans: number
	auto_banned_users: number
	auto_warned_users: number
	by_rule: { rule: string; severity: string; _count: { _all: number } }[]
}

export interface AdminBanListParams {
	take?: number
	page?: number
	auto?: boolean
	rule?: string
	search?: string
}

export interface AdminScNode {
	id: number
	name: string
	base_url: string
	has_api_key: boolean
	enabled: boolean
	priority: number
	timeout_ms: number
	last_seen_at: string | null
	last_error: string | null
	created_at: string
	updated_at: string
	used: number
	remaining: number
	reset_at: string
}

export interface AdminScTokenUsage {
	id: number
	label: string
	tail: string
	enabled: boolean
	used: number
	remaining: number
	reset_at: string
}

export interface AdminScOverview {
	quota_per_minute: number
	node_quota_per_minute: number
	costs: { default: number; auction: number }
	nodes_up: number
	tokens_up: number
	nodes: AdminScNode[]
	tokens: AdminScTokenUsage[]
}

export interface AdminScNodeInput {
	name: string
	base_url: string
	api_key?: string
	priority?: number
	timeout_ms?: number
	enabled?: boolean
}

export interface AdminScNodePing {
	ok: boolean
	latency_ms?: number
	error?: string
}

export interface AdminScBulkResult {
	created: number
	skipped: number
	total: number
}

export interface AdminAuctionHistoryRun {
	items: number
	pages: number
	rows: number
	inserted: number
	failed: number
	startedAt: number
	finishedAt: number
}

export interface AdminAuctionCensus {
	startedAt: number
	finishedAt: number
	items: number
	withHistory: number
	withoutHistory: number
	failed: number
	exboDeals: number
	buckets: { label: string; count: number }[]
	top: { id: string; total: number }[]
}

export interface AdminRollupStats {
	startedAt: number
	finishedAt: number
	days: number
}

export interface AdminAuctionHistoryProgress {
	items: {
		total: number
		backfilled: number
		pending: number
		backfillPct: number
		capped: number
	}
	deals: {
		total: number
		oldest: string | null
		newest: string | null
	}
	size: {
		db: string
		deals: string
	}
	top: { dataPath: string; deals: number }[]
	enabled: boolean
	running: boolean
	deepening: boolean
	censusRunning: boolean
	lastSweep: AdminAuctionHistoryRun | null
	lastBackfill: AdminAuctionHistoryRun | null
	lastDeepen: AdminAuctionHistoryRun | null
	lastCensus: AdminAuctionCensus | null
	rollupRunning: boolean
	lastRollup: AdminRollupStats | null
}

export interface AdminDashboardTrendPoint {
	date: string
	count: number
}

export interface AdminDashboardContentTrendPoint {
	date: string
	builds: number
	articles: number
	arts: number
}

export interface AdminDashboardBanRule {
	rule: string
	severity: 'WARN' | 'BAN'
	count: number
}

export interface AdminDashboardServerOnline {
	region: string
	server_id: string
	online: number
	createdAt?: string
}

export interface AdminDashboardTopBuild {
	id: number
	external_id: string
	title: string
	views: number
	created_at: string
	author: { id: number; username: string; name: string } | null
}

export interface AdminDashboardTopArticle {
	id: number
	external_id: string
	title: string
	views: number
	status: string
	created_at: string
	author: { id: number; username: string; name: string } | null
}

export interface AdminDashboardTopArt {
	id: number
	external_id: string
	title: string | null
	views: number
	created_at: string
}

export interface AdminDashboardTopPlayer {
	id: string
	uuid: string
	username: string
	region: string
	alliance: string
	views: number
}

export interface AdminDashboard {
	generated_at: string
	trend_days: number
	users: {
		total: number
		new_today: number
		new_7d: number
		new_30d: number
		onboarded: number
		public_profiles: number
		active_sessions_24h: number
		active_sessions_7d: number
		revoked_sessions: number
		banned: number
		auto_banned: number
		auto_warned: number
		registration_trend: AdminDashboardTrendPoint[]
	}
	content: {
		builds: { total: number; views: number; new_7d: number }
		articles: {
			total: number
			views: number
			by_status: Record<string, number>
		}
		arts: { total: number; views: number }
		tier_lists: { total: number; views: number }
		comments: { total: number; new_7d: number }
		stars: { total: number }
		creation_trend: AdminDashboardContentTrendPoint[]
	}
	clans: {
		total: number
		recruiting: number
		public: number
		blocked: number
		members_total: number
		by_status: Record<string, number>
	}
	moderation: {
		ban_logs_total: number
		bans_7d: number
		warnings_7d: number
		users_banned: number
		auto_banned: number
		auto_warned: number
		by_rule: AdminDashboardBanRule[]
	}
	system: {
		roles: number
		permissions: number
		badges: number
		notifications: number
		notifications_read: number
	}
	players: {
		popular_players: number
		blacklist_size: number
		player_notes: number
	}
	server_online: {
		latest: AdminDashboardServerOnline[]
		history_24h: {
			region: string
			createdAt: string
			online: number
		}[]
	}
	top: {
		builds: AdminDashboardTopBuild[]
		articles: AdminDashboardTopArticle[]
		arts: AdminDashboardTopArt[]
		players: AdminDashboardTopPlayer[]
	}
}

export type AdminDashboardRange = 7 | 14 | 30 | 90
