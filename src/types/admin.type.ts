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
	created_at: string
	last_active: string
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
	permissionIds: number[]
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
	schedule: { brawlsPerWeek: number; brawlsMandatory: boolean } | null
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
	schedule?: { brawlsPerWeek?: number; brawlsMandatory?: boolean }
}

export interface AdminClanMember {
	id: number
	clanId: string
	name: string
	rank: string
	joinTime: string | null
	userId: number | null
	user: { id: number; username: string; name: string } | null
	syncedAt: string
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
	creatorId: number | null
	clanId: string | null
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
	bannerMode?: 'COLOR' | 'IMAGE' | 'NONE'
	bannerType?: 'BACKGROUND' | 'HEADER'
	bannerColor?: string
	bannerImage?: string | null
	cardBackground?: string
	cardColor?: string
}

export interface AdminUserDetail extends AdminUser {
	username_changed_at?: string
	onboarded?: boolean
	customization?: AdminUserCustomization | null
	UserSettings?: {
		banned: boolean
		ban_reason: string | null
		ban_expires_at: string | null
	} | null
	_count?: {
		sessions: number
		builds: number
		articles: number
		stars: number
	}
}
